#!/bin/sh

# Install dependencies
echo "Installing dependencies..." && \
    sudo apt-get update && sudo apt-get install -y \
        chromium-chromedriver \
        iputils-ping \
        --no-install-recommends
echo "\nInstalling Node.JS..." && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && \
    sudo apt-get install -y nodejs

# Copy files
echo "\nCopying files..." && \
    sudo cp internet-monitor.service /etc/systemd/system && \
    sudo mkdir -p /usr/src/app && \
    sudo cp *.js* /usr/src/app && \
    sudo chown -R monitor:monitor /usr/src/app && \
    sudo chmod -R 750 /usr/src/app

# Install npm dependencies
echo "\nInstalling npm dependencies..." && \
    sudo -u monitor npm install --prefix /usr/src/app

# Start service
echo "\nStarting service..." && \
    sudo systemctl daemon-reload
    sudo systemctl enable internet-monitor
    sudo systemctl start internet-monitor

# Display status
echo "\n\n\nService started. Status:" && \
    sudo systemctl status internet-monitor
