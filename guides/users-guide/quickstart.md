---
icon: sign-posts-wrench
---

# Installing Uptime Manager

## Quickstart for users (quick method) <a href="#user-quickstart" id="user-quickstart"></a>

1. Download our [Docker compose file](https://github.com/bluewave-labs/bluewave-uptime/raw/refs/heads/master/Docker/dist/docker-compose.yaml)
2. Run `docker compose up` to start the application
3. Now the application is running at `http://localhost`

##### Optional Config:

- If you want to monitor Docker containers, uncomment this line in `docker-compose.yaml`:

```
  # volumes:
  # - /var/run/docker.sock:/var/run/docker.sock:ro
```

This gives the app access to your docker daemon via unix socket, please be aware of what you are doing.

---

## Quickstart for users (remote server) <a href="#user-quickstart" id="user-quickstart"></a>

1. Download our [Docker compose file](https://github.com/bluewave-labs/bluewave-uptime/blob/develop/Docker/dist/docker-compose.yaml)
2. Edit the `UPTIME_APP_API_BASE_URL` variable in the docker-compose file to point to your remote server.
3. Run `docker compose up` to start the application
4. Now the application is running at `http://<remote_server_ip>`

##### Optional Config:

- If you want to monitor Docker containers, uncomment this line in `docker-compose.yaml`:

```
  # volumes:
  # - /var/run/docker.sock:/var/run/docker.sock:ro
```

This gives the app access to your docker daemon via unix socket, please be aware of what you are doing.

---

## Quickstart for developers <a href="#dev-quickstart" id="dev-quickstart"></a>

{% hint style="info" %}
Make sure you change the directory to the specified directories, as paths in commands are relative.
{% endhint %}

### Cloning and initial setup

1. Clone this repository.
2. Checkout the `develop` branch `git checkout develop`

### Setting up Docker images

3. Change directory to the `Docker/dev` directory
4. Build the docker images by running the `build_images.sh` script
5. Run `docker run -d -p 6379:6379 -v $(pwd)/redis/data:/data --name uptime_redis uptime_redis`
6. Run `docker run -d -p 27017:27017 -v $(pwd)/mongo/data:/data/db --name uptime_database_mongo uptime_database_mongo`

### Server setup

6. CD to `Server` directory, and run `npm install`
7. While in `Server` directory, create a `.env` file with the [required environmental variables](#env-vars-server)
8. While in the `Server` directory, run `npm run dev`

### Client setup

9. CD to `Client` directory `run npm install`
10. While in the `Client` directory, create a `.env` file with the [required environmental variables](#env-vars-client)
11. While in the `Client` directory run `npm run dev`

### Access the application

12. Client is now running at `localhost:5173`
13. Server is now running at `localhost:5000`

---

## Manual installation <a href="#manual-install" id="manual-install"></a>

### Client installation <a href="#install-client" id="install-client"></a>

1. Change directory to the `Client` directory
2. Install all dependencies by running `npm install`
3. Add a `.env` file to the `Client` directory with the following options:

#### Environment variables <a href="#env-vars-client" id="env-vars-client"></a>

| ENV Variable Name     | Required/Optional | Type      | Description        | Accepted Values                    |
| --------------------- | ----------------- | --------- | ------------------ | ---------------------------------- |
| VITE_APP_API_BASE_URL | Required          | `string`  | Base URL of server | {host}/api/v1                      |
| VITE_APP_LOG_LEVEL    | Optional          | `string`  | Log level          | `"none"`\|`"error"` \| `"warn"` \| |
| VITE_APP_DEMO         | Optional          | `boolean` | Demo server or not | `true`\|`false` \|                 |

Sample ENV file:

```
VITE_APP_API_BASE_URL="http://localhost:5000/api/v1"
VITE_APP_LOG_LEVEL="debug"
```

#### Starting the Client development server <a href="#start-client" id="start-client"></a>

1. Run `npm run dev` to start the development server.

### Server Installation <a href="#install-server" id="install-server"></a>

1. Change the directory to the `Server` directory
2. Install all dependencies by running `npm install`
3. Add a `.env` file to the `Server` directory with the following options:

#### Environment variables <a href="#env-vars-server" id="env-vars-server"></a>

Configure the server with the following environmental variables:

<table><thead><tr><th width="239">ENV Variable Name</th><th width="149">Required/Optional</th><th width="116">Type</th><th>Description</th><th>Accepted Values</th></tr></thead><tbody><tr><td>CLIENT_HOST</td><td>Required</td><td><code>string</code></td><td>Frontend Host</td><td></td></tr><tr><td>JWT_SECRET</td><td>Required</td><td><code>string</code></td><td>JWT secret</td><td></td></tr><tr><td>REFRESH_TOKEN_SECRET</td><td>Required</td><td><code>string</code></td><td>Refresh JWT secret</td><td></td></tr><tr><td>DB_TYPE</td><td>Optional</td><td><code>string</code></td><td>Specify DB to use</td><td><code>MongoDB | FakeDB</code></td></tr><tr><td>DB_CONNECTION_STRING</td><td>Required</td><td><code>string</code></td><td>Specifies URL for MongoDB Database</td><td></td></tr><tr><td>PORT</td><td>Optional</td><td><code>integer</code></td><td>Specifies Port for Server</td><td></td></tr><tr><td>LOGIN_PAGE_URL</td><td>Required</td><td><code>string</code></td><td>Login url to be used in emailing service</td><td></td></tr><tr><td>REDIS_HOST</td><td>Required</td><td><code>string</code></td><td>Host address for Redis database</td><td></td></tr><tr><td>REDIS_PORT</td><td>Required</td><td><code>integer</code></td><td>Port for Redis database</td><td></td></tr><tr><td>TOKEN_TTL</td><td>Optional</td><td><code>string</code></td><td>Time for token to live</td><td>In vercel/ms format https://github.com/vercel/ms</td></tr><tr><td>REFRESH_TOKEN_TTL</td><td>Optional</td><td><code>string</code></td><td>Time for refresh token to live</td><td></td></tr><tr><td>PAGESPEED_API_KEY</td><td>Optional</td><td><code>string</code></td><td>API Key for PageSpeed requests</td><td></td></tr><tr><td>SYSTEM_EMAIL_HOST</td><td>Required</td><td><code>string</code></td><td>Host to send System Emails From</td><td></td></tr><tr><td>SYSTEM_EMAIL_PORT</td><td>Required</td><td><code>number</code></td><td>Port for System Email Host</td><td></td></tr><tr><td>SYSTEM_EMAIL_ADDRESS</td><td>Required</td><td><code>string</code></td><td>System Email Address</td><td></td></tr><tr><td>SYSTEM_EMAIL_PASSWORD</td><td>Required</td><td><code>string</code></td><td>System Email Password</td><td></td></tr></tbody></table>

Sample env file

```
CLIENT_HOST="http://localhost:5173"
JWT_SECRET="my_secret"
DB_TYPE="MongoDB"
DB_CONNECTION_STRING="mongodb://localhost:27017/uptime_db"
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
TOKEN_TTL="99d"
PAGESPEED_API_KEY=<api_key>
SYSTEM_EMAIL_HOST="smtp.gmail.com"
SYSTEM_EMAIL_PORT=465
SYSTEM_EMAIL_ADDRESS=<email_address>
SYSTEM_EMAIL_PASSWORD=<password>
REFRESH_TOKEN_SECRET="my_refresh"
REFRESH_TOKEN_TTL="99d"
```

---

#### Databases <a href="#databases" id="databases"></a>

This project requires two databases:

1. **Main application database:** The project uses MongoDB for its primary database, with a MongoDB Docker image provided for easy setup.
2. **Redis for queue management:** A Redis database is used for the PingService’s queue system, and a Redis Docker image is included for deployment.

You may use the included Dockerfiles to spin up databases quickly if you wish.

**(Optional) Dockerised databases**

Dockerfiles for the server and databases are located in the `Docker` directory

<details>

<summary>MongoDB Image</summary>

Location: `Docker/mongoDB.Dockerfile`

The `Docker/mongo/data` directory should be mounted to the MongoDB container in order to persist data.

From the `Docker` directory run

1. Build the image: `docker build -f mongoDB.Dockerfile -t uptime_database_mongo .`
2. Run the docker image: `docker run -d -p 27017:27017 -v $(pwd)/mongo/data:/data/db --name uptime_database_mongo uptime_database_mongo`

</details>

<details>

<summary>Redis Image</summary>

Location `Docker/redis.Dockerfile`

the `Docker/redis/data` directory should be mounted to the Redis container in order to persist data.

From the `Docker` directory run

1. Build the image: `docker build -f redis.Dockerfile -t uptime_redis .`
2. Run the image: `docker run -d -p 6379:6379 -v $(pwd)/redis/data:/data --name uptime_redis uptime_redis`

</details>

---

#### Starting the development server <a href="#start-server" id="start-server"></a>

- run `npm run dev` to start the development server

or,

- run `node index.js` to start server

---

### API documentation <a href="#api-documentation" id="api-documentation"></a>

Our API is documented in accordance with the [OpenAPI spec](https://www.openapis.org/).

You can see the documentation on your local development server at http://localhost:{port}/api-docs

You can also view the documentation on our demo server at [https://checkmate-demo.bluewavelabs.ca/api-docs](https://checkmate-demo.bluewavelabs.ca/api-docs)

### Error handling

Errors are returned in a standard format:

`{"success": false, "msg": "No token provided"}`

Errors are handled by error handling middleware and should be thrown with the following parameters

| Name    | Type      | Default                | Notes                                |
| ------- | --------- | ---------------------- | ------------------------------------ |
| status  | `integer` | 500                    | Standard HTTP codes                  |
| message | `string`  | "Something went wrong" | An error message                     |
| service | `string`  | "Unknown Service"      | Name of service that threw the error |

Example:

```
const myRoute = async(req, res, next) => {
  try{
    const result = myRiskyOperationHere();
  }
  catch(error){
    error.status = 404
    error.message = "Resource not found"
    error.service = service name
    next(error)
    return;
  }
}

```

Errors should not be handled at the controller level and should be left to the middleware to handle.
