## Cerebellum Server

This is the Cerebellum WebSocket server designed for realtime applications. The server runs on port **8001**.

## Getting Started

### Setting up your environment

Clone the repo.

Install node dependencies. `cd` into the project root and run `npm install`.

Create a `.env` file in the project root and then copy the content from `.env.example`. Fill out the values according to your local development environment.

- Note

### Running a local development server

- Start running Docker locally.
- `cd` into the project root and run:

```
docker compose up --detach
npm run dev
```

- `docker compose up --detach` starts running local docker images of Redis and DynamoDB in the background.
- `npm run dev` starts running a local instance of the Cerebellum WebSocket server on **port 8001**.

### Running the server in production

For production, this server is dockerized and its' image is used in our AWS CDK infrastructure deployment.

Note: While deploying the AWS infrastructure in the CDK, the environment variables needed in the server will be added automatically during deployment.

### Preparing for production

To dockerize this image:

- Run `docker login` to make sure you are logged in to your Dockerhub account.
- `cd` into the project root
- Create a local Docker image
  - `docker build -t <your-dockerhub-username>/<image-name>:<tag> .`
- Push the Docker image to Dockerhub
  - `docker push <your-dockerhub-username>/<image-name>:<tag>`

### Placing server into production

To use this Docker image in production:

- Install Cerebellum's CLI package globally:
  - `npm install --global @cerebellum/cli`
- `cd` into a folder with no `.git` repo
- Create the CDK infrastructure deployment folder by running:
  - `cerebellum create`
    - In the option asking if you want to use your server image, insert the Docker image just created.

For deploying Cerebellum's CDK and more information about our CLI: (https://github.com/Cerebellum-Realtime/cli)

## What's Included

### Authentication

Cerebellum server implements a way to authenticate users before a WebSocket connection is created in order to protect the server. This gives our server protection from unwanted users connecting.

Steps to authenticate:

- Create an API key
  - Checkout (https://github.com/Cerebellum-Realtime/cli) for more information on deploying using Cerebellum
- Place the API key into the server `.env` as `API_KEY=<your_api_key>`
- Create a separate authentication server and give it the API key

In practice, this is how authentication works:

- A client attempts to login via a separate authentication server (not Cerebellum server)
- Once the clients' login is successful, the client is given a JWT token
- The client then gives the JWT token to the Cerebellum server and the Cerebellum server authenticates the JWT token
- Assuming the JWT token was built with the same secret, the user is granted permission to connect to the Cerebellum server via WebSocket

### Scalable Realtime Communication

To be able to handle high traffic usage, Cerebellum server is designed to be easily scalable. To do this, we rely on a Redis cache that will act as a message facilitator between servers. This means that we can horizontally scale (ie add more servers) and have a way for all servers to communicate.

### Persistent Data Storage Capability

Cerebellum server is designed to save realtime data to DynamoDB.

- In development mode, data is written directly to a running docker instance of DynamoDB.
- In production mode, the server is designed to send data to a queue.
  - Note: An AWS Lambda function will use Dynamoose and send data to the database.

### Connection State Recovery

Cerebellum server is designed to handle dropped connections re-connecting quickly and without re-authentication. We use Socket.io's built-in connection state recovery. The max re-connect timeframe is set to 120 seconds and skip the middleware (which skips authentication).

### Realtime Presence

Cerebellum server is designed for realtime presence. This means that our server gives the capability for users to see realtime updates from other users in their channel. We utilize Redis streams by saving the presence of channels on the Redis temporarily. The server can then implement presence by:

- adding a user to the channel's presence
- removing a user from a channel's presence
- getting all users from a channel's presence
- updating a user's info in the channel's presence
- getting all channels a user is present in
- removing a user from all channel's presence
