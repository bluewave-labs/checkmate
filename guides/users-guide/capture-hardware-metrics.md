---
icon: sign-posts-wrench
---

# Capture: Hardware Monitoring Agent

Capture is a hardware monitoring agent that collects hardware information from the host machine and exposes it through a RESTful API. The agent is designed to be lightweight and easy to use.

Capture is only available for **Linux**. You can install the agent using Docker or manually.

## Docker Installation

There are two ways to install the agent using Docker. The first way is to pull the image from the Container Registry The second way is to build the image from the source code.

### Pull or Build

//TODO: Replace URL_TO_IMAGE with the actual URL

```shell
docker pull URL_TO_IMAGE
```

or

```shell
docker buildx build -f Dockerfile -t capture .
```

### Run

Run the container with specified flags

```shell
docker run -v /etc/os-release:/etc/os-release:ro \
    -p 59232:59232 \
    -e API_SECRET=REPLACE_WITH_YOUR_SECRET \
    -d \
    capture:latest
```

You can access the agent at [http://localhost:59232](http://localhost:59232)

## Manual Installation

### Requirements

- [Git](https://git-scm.com/downloads) is essential for cloning the repository.
- [Go](https://go.dev/dl/) is required to build the project.
- [Just](https://github.com/casey/just) is optional but **recommended** for building the project with pre-defined commands.

### Build from Source

1. Git Clone

    ```shell
    git clone git@github.com:bluewave-labs/capture.git
    ```

2. Change your directory

    ```shell
    cd capture
    ```

3. Install dependencies

    ```shell
    go mod download
    ```

4. Build the project

    ```shell
    just build
    ```

    or

    ```shell
    go build -o capture ./cmd/capture/
    ```

5. Run the project

    ```shell
    ./capture
    ```

6. You can access the agent at `http://localhost:59232`

### `go install`

You can also install the agent using `go install` command.

```shell
go install github.com/bluewave-labs/capture/cmd/capture@latest
```

Make sure the installed binary is executable

```shell
# Make sure $GOPATH/bin is in your PATH
chmod +x $(go env GOPATH)/bin/capture
```

Run the installed binary

```shell
capture
```

## Environment Variables

You can configure the agent using environment variables.

| ENV Variable Name | Required/Optional | Type      | Default Value                          | Description                          | Accepted Values |
|-------------------|-------------------|-----------| ---------------------------------------|--------------------------------------|-----------------|
| PORT              | Optional          | `integer` | 59232                                  | Specifies Port for Server            | 0 - 65535       |
| API_SECRET        | Required          | `string`  | -                                      | API Secret                           | Any string      |
| ALLOW_PUBLIC_API  | Optional          | `boolean` | false                                  | Allow or deny publicly available api | true, false     |
| GIN_MODE          | Optional          | `string`  | system -> debug <br> docker -> release | Gin mode                             | debug, release  |
