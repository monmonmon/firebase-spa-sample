FROM "node:8.16.0-alpine"
RUN npm i -g yarn
RUN yarn global add create-react-app firebase-tools
WORKDIR /app
