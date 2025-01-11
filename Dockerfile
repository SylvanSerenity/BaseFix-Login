# Use the official Node.js image with a slim base
FROM node:18-slim

# Set environment variables to avoid prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN echo "Installing dependencies..." && \
    apt-get update && apt-get install -y \
        chromium-chromedriver \
        iputils-ping \
        --no-install-recommends && \
        rm -rf /var/lib/apt/lists/*

# Install npm dependencies
WORKDIR /usr/src/app
COPY *.js* ./
RUN echo "Installing npm dependencies" && \
    npm install

# Set the script as the default command
CMD ["node", "internet-monitor.js"]
