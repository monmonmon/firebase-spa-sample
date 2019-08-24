FROM "node:12.8.0-alpine"
WORKDIR /app
RUN apk update \
    yarn global upgrade \
    yarn global add create-react-app firebase-tools
CMD yarn start
