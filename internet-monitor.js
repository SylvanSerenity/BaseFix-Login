console.log('Preparing...');
const fs = require('fs');
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const ping = require('ping');

// Load credentials from config.json
let config;
try {
    config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
} catch (e) {
    console.error('Failed to load config.json:', e.message);
    process.exit(1); // Exit the program with an error code
}
const { username, password } = config;

// Configurable constants
const host = '8.8.8.8'; // Google DNS
const ispPage = 'http://login.basefix.net';
const attemptsPerSec = 5; // Check connection 5 times per second
const attemptsPerFailure = 3; // Run script immediately after 3 failures
const attemptsPerRetry = attemptsPerSec * 5; // Retry script every 5 seconds after failure

// Global variables
let failedPingCount = 0; // Counter for consecutive failed pings
let isInternetDown = false; // Flag to prevent repeated login attempts
let driver = null; // WebDriver instance

// Set up Chrome driver
const options = new chrome.Options();
options.addArguments('--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--disable-features=CookiesWithoutSameSiteMustBeSecure', '--disable-site-isolation-trials', '--disable-blink-features=BlockCredentialedSubresources', '--disable-component-extensions-with-background-pages', '--disable-application-cache', '--disable-session-crashed-bubble', '--disable-restore-session-state');

// Initialize WebDriver
async function initializeDriver() {
    if (!driver) {
        console.log('Initializing WebDriver...');
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
		await driver.manage().setTimeouts({ implicit: 5000 }); // Set 5-second timeout for element search
        console.log('WebDriver initialized.');
    }
}

async function loginToISP() {
    try {
		await initializeDriver();

        // Navigate to the login page
		console.log('Loading login page...');
        await driver.get(ispPage);

        // Locate the visible username and password fields
		console.log('Finding username/password fields...');
        let usernameField = await driver.findElement(By.id('username')); // Visible username field
        let passwordField = await driver.findElement(By.css('input[type="password"]')); // Password field

        // Input your credentials
		console.log('Entering username/password...');
        await usernameField.sendKeys(username);
        await passwordField.sendKeys(password);

        // Click the Login button
		console.log('Logging in...');
        let loginButton = await driver.findElement(By.css('button[type="submit"]'));
        await loginButton.click();
		console.log('Login complete.');
    } catch(e) {
        console.error('Error during login:', e);
    }
}

// Ping a reliable host
async function checkInternet() {
	try {
        const res = await Promise.race([
            ping.promise.probe(host, { timeout: 1, packetSize: 1 }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Ping timeout")), 1000))
        ]);

        if (parseFloat(res.packetLoss) > 0) {
            failedPingCount++;
        } else {
            if (isInternetDown) {
                console.log('Internet restored.');
            }
            failedPingCount = 0; // Reset failed ping count when successful
            isInternetDown = false; // Reset flag when successful
        }
    } catch (error) {
        failedPingCount++;
    } finally {
		if (failedPingCount > 0) {
            if (failedPingCount <= attemptsPerFailure) {
                console.log(`Ping failed (${failedPingCount}/${attemptsPerFailure})...`);
            }
            if (failedPingCount == attemptsPerFailure) { // Fail after attemptsPerFailure tries
                isInternetDown = true; // Mark internet as down
                console.log('Internet unreachable. Running login script...');
                await loginToISP();
            }
            else if (failedPingCount % attemptsPerRetry == 0) { // Run script every attemptsPerRetry while disconnected
                console.log('Internet unreachable. Running login script...');
                await loginToISP();
            }
        }
	}
}

// Handle exits
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    process.exit();
});

// Initialize driver before monitoring
initializeDriver().then(
    () => {
        console.log('Driver ready. Continuously monitoring Internet status...');
        setInterval(checkInternet, 1000 / attemptsPerSec);
    }
).catch(
    (err) => {
        console.error('Error initializing WebDriver:', err);
        process.exit(1);
    }
);
