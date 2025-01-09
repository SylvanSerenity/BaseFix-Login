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

// Ping a reliable host
async function checkInternet() {
    const res = await ping.promise.probe(host, { timeout: 1, packetSize: 1 });

    if (parseFloat(res.packetLoss) > 0) {
        failedPingCount++;
        if (failedPingCount <= attemptsPerFailure) {
            console.log(`Ping failed (${failedPingCount}/${attemptsPerFailure})...`);
        }
        if (failedPingCount == attemptsPerFailure) { // Fail after attemptsPerFailure tries
            isInternetDown = true; // Mark internet as down
            await loginToISP();
        }
        else if (failedPingCount % attemptsPerRetry == 0) { // Run script every attemptsPerRetry while disconnected
            await loginToISP();
        }
    } else {
        if (isInternetDown) {
            console.log('Internet restored.');
        }
        failedPingCount = 0; // Reset failed ping count when successful
        isInternetDown = false; // Reset flag when successful
    }
}

// Set up Chrome driver
const options = new chrome.Options();
options.addArguments('--headless');
options.addArguments('--verbose');
options.addArguments('--disable-gpu');
options.addArguments('--no-sandbox');
options.addArguments('--incognito');
options.addArguments('--disable-dev-shm-usage');
options.addArguments('--disable-features=CookiesWithoutSameSiteMustBeSecure');
options.addArguments('--disable-site-isolation-trials');
options.addArguments('--disable-blink-features=BlockCredentialedSubresources');
options.addArguments('--disable-component-extensions-with-background-pages');
options.addArguments('--disable-application-cache');
options.addArguments('--disable-session-crashed-bubble');
options.addArguments('--disable-restore-session-state');
options.addArguments('--user-data-dir=/dev/null');
options.addArguments('--user-cache-dir=/dev/null');

async function loginToISP() {
    console.log('Internet unreachable. Running login script...');
    let driver;

    try {
	// Initialize driver
	driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
	await driver.manage().setTimeouts({ implicit: 5000 }); // Set 5-second timeout for element search

        // Navigate to the login page
        await driver.get(ispPage);
        
        // Locate the visible username and password fields
        let usernameField = await driver.findElement(By.id('username')); // Visible username field
        let passwordField = await driver.findElement(By.css('input[type="password"]')); // Password field
        
        // Input your credentials
        await usernameField.sendKeys(username);
        await passwordField.sendKeys(password);
        
        // Click the Login button
        let loginButton = await driver.findElement(By.css('button[type="submit"]'));
        await loginButton.click();

        await driver.sleep(1000); // Wait for page to load
    } catch(e) {
        console.error(e);
    } finally {
	if (driver) {
            await driver.quit();
	}
    }
}

// Handle exits
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    process.exit();
});

// Main loop
setInterval(checkInternet, 1000 / attemptsPerSec);
