FROM node:19.4 AS build
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm i  && rm -f .npmrc

FROM node:19.4.0-alpine3.16
ENV NODE_ENV production
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node . /usr/src/app
CMD ["npm", "run", "start:fnw"]
EXPOSE 3000