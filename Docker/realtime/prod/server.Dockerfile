FROM node:20-alpine

WORKDIR /app

COPY ./Server/package*.json ./

RUN npm install

COPY ./Server/ ./

EXPOSE 5000

CMD ["node", "index.js"]