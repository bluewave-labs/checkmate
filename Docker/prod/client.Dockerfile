FROM node:20-alpine AS build

WORKDIR /app

COPY ../../Client/package*.json ./

RUN npm install

COPY ../../Client .

RUN npm run build

# Serve the app directly
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/dist .

EXPOSE 80

CMD ["npx", "http-server", "-p", "80", "."]
