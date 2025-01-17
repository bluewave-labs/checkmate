#!/bin/bash

# Change directory to root directory for correct Docker Context
cd "$(dirname "$0")"
cd ../..

# Define an array of services and their Dockerfiles
declare -A services=(
  ["realtime_uptime_client"]="./Docker/realtime/client.Dockerfile"
  ["realtime_uptime_database_mongo"]="./Docker/realtime/mongoDB.Dockerfile"
  ["realtime_uptime_redis"]="./Docker/realtime/redis.Dockerfile"
  ["realtime_uptime_server"]="./Docker/realtime/server.Dockerfile"
)

# Loop through each service and build the corresponding image
for service in "${!services[@]}"; do
  docker build -f "${services[$service]}" -t "$service" .
  
  # Check if the build succeeded
  if [ $? -ne 0 ]; then
    echo "Error building $service image. Exiting..."
    exit 1
  fi
done
