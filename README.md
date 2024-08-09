Sections:

- What is this repo? => Cerebellum Server
- How can a developer use this repo? => Getting Started
- What does a developer need to know before using this repo? =>

## Cerebellum Server

This is the Cerebellum WebSocket server designed for realtime applications.

## Getting Started

### Setting up your environment

Clone the repo.

Install node dependencies. `cd` into the project root and run `npm install`.

Create a `.env` file in the project root and then copy the content from `.env.example`. Fill out the values according to your local development environment.

- Note

### Running a local development server

Start running Docker locally.

`cd` into the project root and run:

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

- Install Cerebellum's CLI package:
  - `npm install --global @cerebellum/cli`
- `cd` into a folder with no `.git` repo
- Create the CDK infrastructure deployment folder:
  - `cerebellum create`
    - In the option asking if you want to use your server image, insert the image just created.

For deploying Cerebellum's CDK and more information about our CLI: <Insert Link to CLI>.

# Archived stuff

- Server

  - Extract out the server code from sample
  - Option 1
    - we make a nice docker image, that the cli can automatically pull in for the cdk
  - Option 2
    - We can do a package thing like vite, or ekko
    - Where you can extend yourself if needed
    - create a script to dockerize and upload to aws for deployment
    - They would have to provide the docker image to cdk deployment

- Server repo with default image
- Or dev can pull down, extend, create own image
- Stretch -> `npm create Cerebellum` similar to Vite
  - one development image
    - on the client side, in our installer, we could drop a dockerCompose
    - This would include the dev image, redis, and dynamo
- Generate the API key on cdk deployment

  - This API Key is injected into the containers, and used to decode tokens as the secret

- A developer can use the Cerebellum class to generate A Token signed by the API Key
  - They would be responsible for proving a route that would generate the signed token,
  - and we would ping that route on the front end with our package
