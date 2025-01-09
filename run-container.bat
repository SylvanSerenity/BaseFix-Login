:: Build and run Docker image
echo "Building Docker image..."
docker build -t internet-monitor .
echo "Running Docker container..."
docker run -d --name internet-monitor internet-monitor
echo "Docker container running. Status:"
docker ps
