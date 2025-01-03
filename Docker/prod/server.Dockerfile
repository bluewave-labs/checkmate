FROM node:20-alpine

ENV NODE_OPTIONS="--max-old-space-size=2048"

WORKDIR /app

COPY ./Server/package*.json ./

RUN npm install

COPY ./Server/ ./

EXPOSE 5000

CMD ["node", "index.js"]