# BaseFix Login

BaseFix Login is a service inspired by IP SLA that monitors Internet connection and sends a Selenium login request to BaseFix when logged out. Say goodbye to manually logging in, being disconnected from calls, and missing important notifications. The total recovery time between being logged out and reestablishing Internet connection is **605-900ms**, meaning you will likely not even notice any logout.

## Requirements

* You should use this service on a computer that is always running and with Internet access. If the computer running the service loses access to your ISP (shutdown or disconnected from the LAN), it will be unable to send the login request.
* The script itself sends 5 pings per second for monitoring, each of 9 bytes total (send/receive). This equates to 45B/sec, 3.9KB/min, or 234KB/hr. In other words, it is very lightweight.
* Any OS with Docker Engine (containerized) or a Linux system (system service).

## Docker Install

[Docker](https://www.docker.com/products/docker-desktop/) must be installed. Works on all platforms.

1. Download and extract the repository.
2. Edit `config.json` with your username and password.
3. Start Docker Engine via the desktop app (Windows) or the terminal with `sudo systemctl start docker` (Linux).
4. From the repository directory, run the `run-container.sh` script:

    Windows: `.\run-container.bat`

    Linux: `sh run-container.sh`

    *Note: Feel free to view and edit the run script or use Docker yourself if you are knowledgeable on it.*

5. The Docker container should run after the image is built. You may delete the repository files from your device.

    *Note: You will need to manually restart the Docker container if your system restarts. You can start it by clicking the start button next to the container in the Docker Desktop application.*

## Linux Service Install

A system running Linux (or WSL) is required.

1. Download and extract the repository.
2. Edit `config.json` with your username and password.
3. From the repository directory, run the `linux-install.sh` script as administrator: `sudo sh linux-install.sh`

    *Note: Administrator rights are required to install dependencies, create the monitor user, and set up the systemctl service.*

4. The service should run automatically and print its status. It will run whenever the device is rebooted, ensuring you have connection after power outages.
