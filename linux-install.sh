#!/bin/sh

# Install dependencies
echo "Installing dependencies..."
sudo apt-get update && sudo apt-get install -y \
    chromium-chromedriver \
    iputils-ping \
    --no-install-recommends
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Copy files
echo "Copying files..."
sudo mkdir -p /usr/src/app
sudo cp *.json /usr/src/app
sudo cp internet-monitor.js /usr/src/app
sudo cp basefix-login.js /usr/src/app
sudo cp internet-monitor.service /etc/systemd/system

# Set executable permissions
sudo chmod +x /usr/src/app/internet-monitor.js
cd /usr/src/app

# Install npm dependencies
echo "Installing npm dependencies..."
sudo npm install

# Start service
echo "Starting service..."
sudo systemctl daemon-reload
sudo systemctl enable internet-monitor
sudo systemctl start internet-monitor
echo "Service started. Status:"
sudo systemctl status internet-monitor
