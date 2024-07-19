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

Future-Work:

- create module File for socket handlers(think about it)

Past Messages:

- returns an array of objects now.
- [
  {
  content: String,
  createAt: String
  }
  ]

# Stuff to change on the front-end

## We need to redo the front-end queries to use chanelName instead of channelId

- pagination on the backend
  - We need to update FrontEnd to handle result.lastKey
  - We need to let CDK Team Know, to update tables in the cdk

# Stuff to let Austin and Avery know, CDK Team

- We updated message Table Schema

  - messageIdCreated => messageId

- We can change this for them if needed, in the cdk creation
- Channels Table

  - ChannelName is the Hash(Parition Key)
  - WE need to update all the queries on the cdk and lambdas
  - we need to update the channels

- clean up package json remove stuff we're not using
