FROM node:20-alpine AS build

WORKDIR /app

COPY ../../Client/package*.json ./

RUN npm install

COPY ../../Client .

RUN npm run build

FROM nginx:1.27.1-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh
CMD ["nginx", "-g", "daemon off;"]