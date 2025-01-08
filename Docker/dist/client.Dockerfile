FROM node:20-alpine AS build

WORKDIR /app

COPY ../../Client/package*.json ./

RUN npm install

COPY ../../Client .

RUN npm run build


FROM nginx:1.27.1-alpine

# Default values for envstub
ENV LISTEN_PORT=80
ENV SERVER_URL=http://server:5000
ENV SERVER_NAME=checkmate-demo.bluewavelabs.ca

# Using envstub to modify config on startup
# See https://hub.docker.com/_/nginx
COPY ./default.conf.template /etc/nginx/templates/default.conf.template

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

CMD ["nginx", "-g", "daemon off;"]