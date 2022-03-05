FROM node:16.13.0-alpine

LABEL ca.cioosatlantic.author="Ryan Deschamps"
LABEL ca.cioosatlantic.version="1.0.0"
LABEL multi.ca.cioosatlantic.maintainer="ryan.deschamps@cioosatlantic.ca" \
      multi.ca.cioosatlantic.maintainer2="shayla.fitzsimmons@cioosatlantic.ca"

WORKDIR /usr/src/app

RUN yarn global add serve
CMD serve -s build
EXPOSE 3000

COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . ./

RUN yarn run build --production