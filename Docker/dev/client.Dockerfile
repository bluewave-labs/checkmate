FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make g++  \
    gcc \
    libc-dev \
    linux-headers \
    libusb-dev \
    udev-dev


COPY ../../Client/package*.json ./

RUN npm install

COPY ../../Client .

RUN npm run build-dev

RUN npm install -g serve

CMD ["serve","-s", "dist", "-l", "5173"]
