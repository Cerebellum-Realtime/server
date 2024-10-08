# Use Node.js 22 Alpine as the base image
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g typescript

RUN npm run build

EXPOSE 8001

CMD ["npm", "start"]