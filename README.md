# Trivia Quiz app

This is an application for playing a trivia quiz.

The trivia questions are sourced from https://the-trivia-api.com/.

## Quickstart

To start the quiz server follow these steps:

1. Clone this repository and cd into it

   ```bash
   git clone git@github.com:AaronArmour/trivia-quiz.git && cd trivia-quiz
   ```

1. Install dependencies

   ```bash
   npm install
   ```

1. Build/compile the TypeScript code

   ```bash
   npm run build
   ```

1. Start the server

   ```bash
   npm run start-server
   ```

To run the cli-client (assuming the code has already been built as per the instructions above), simply run:

```bash
npm run start-cli-client
```

## Docker

### Build images

To build the Docker images for the server and cli-client you can run:

```bash
docker build --target server -t server:v1 .
docker build --target cli-client -t cli-client:v1 .
```

### Run the server image

To run the server image, use a command like:

```bash
docker run -d --network my_network -p 8081:8081 --name server server:v1
```

This will create a container named `server` attach it to the network `my_network` (which must have already been created, see below for how todo this) and map port 8081 on the host to port 8081 on the container.

You do not need to provide both the `--network` and `-p` options (but you can), which you might choose depends on where the server is hosted and how clients will connect.

By default the server creates quizzes with 10 questions, this can be configured by setting the environment variable `NUM_QNS` using the `-e` flag. (Note that the number of questions is limited to 20 questions maximum.)

#### Server logs

You can follow the latest logs on the server with:

```bash
docker logs -f server
```

### Play the quiz using the cli-client image

Note when running the server and client locally, **the client container must run on the same network as the server container** for them to be able to communicate.

```bash
docker run --rm -it --network my_network cli-client:v1
```

This assumes that the container running the server has the name 'server', if it does not you will need to supply an environment variable HOST with the name of the container (or its IP address):

```bash
docker run --rm -e HOST=<server-container-name-or-ip> -it --network my_network cli-client:v1
```

Note that the `--rm` flag is optional and simply removes the container when it exits.

### Network

If you run containers for the server and the cli-client on the same machine, you will need to attach them the same network. You can create a bridge network with, for example:

```bash
docker network create my_network
```
