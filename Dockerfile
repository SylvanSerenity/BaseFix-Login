# Use the official Node.js image with a slim base
FROM node:18-slim

# Set environment variables to avoid prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies for Selenium
RUN apt-get update && apt-get install -y \
    chromium-chromedriver \
    iputils-ping \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install npm dependencies
WORKDIR /usr/src/app
COPY *.js* ./
RUN npm install

# Set the script as the default command
CMD ["node", "internet-monitor.js"]
