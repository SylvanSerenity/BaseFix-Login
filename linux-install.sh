#!/bin/sh

# Install dependencies
echo "Installing dependencies..."
sudo apt-get update && sudo apt-get install -y \
    chromium-chromedriver \
    iputils-ping \
    --no-install-recommends
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create the 'monitor' user
echo "Creating 'monitor' user..."
if ! id -u monitor > /dev/null 2>&1; then
    sudo useradd -r -s /bin/false monitor
	sudo mkdir -p /home/monitor
	sudo usermod -d /home/monitor monitor
    echo "'monitor' user created."
else
    echo "'monitor' user already exists."
fi

# Create application directory and set ownership
echo "Setting up application directory..."
sudo mkdir -p /usr/src/app
sudo chown -R monitor:monitor /usr/src/app
sudo mkdir -p /home/monitor/.npm
sudo chown -R monitor:monitor /home/monitor/.npm

# Copy files
echo "Copying files..."
sudo cp internet-monitor.service /etc/systemd/system
sudo cp *.js* /usr/src/app
sudo chown -R monitor:monitor /usr/src/app
sudo chmod -R 750 /usr/src/app

# Install npm dependencies
echo "Installing npm dependencies..."
sudo -u monitor npm install --prefix /usr/src/app

# Start service
echo "Starting service..."
sudo systemctl daemon-reload
sudo systemctl enable internet-monitor
sudo systemctl start internet-monitor

# Display status
echo "Service started. Status:"
sudo systemctl status internet-monitor
