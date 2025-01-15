FROM mongo
COPY ./Docker/prod/mongo/init/create_users.js /docker-entrypoint-initdb.d/
EXPOSE 27017
CMD ["mongod"]
