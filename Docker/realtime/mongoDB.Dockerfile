FROM mongo
EXPOSE 27017
CMD ["mongod"]

# # Use the official MongoDB image as the base image
# FROM mongo:latest

# # Copy the generate-keyfile.sh script to the container
# COPY ./Docker/realtime/mongo/generate-keyfile.sh /generate-keyfile.sh

# # Create the keyfile directory and generate the keyfile during the image build
# RUN mkdir -p /opt/keyfile && \
#     /bin/bash /generate-keyfile.sh

# # Copy the custom mongod.conf to the container's configuration directory
# COPY ./Docker/realtime/mongo/mongod.conf /etc/mongod.conf

# # Copy the mongo-init.js file to the container's initialization script directory
# COPY ./Docker/realtime/mongo/mongo-init.js /docker-entrypoint-initdb.d/mongo-init.js

# CMD ["mongod", "-f", "/etc/mongod.conf"]