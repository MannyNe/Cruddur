###     The Build Image     ###
FROM node:latest AS build

# 
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

WORKDIR /frontend-react-js

COPY package*.json .

RUN npm ci --only=production

###     The Production Image    ###
FROM node:16.17.0-bullseye-slim

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init

# Securing the container by not running it using the root privilage
USER node

WORKDIR /frontend-react-js

COPY --chown=node:node --from=build /frontend-react-js/node_modules /frontend-react-js/node_modules
COPY --chown=node:node . .

ENV PORT=3000
EXPOSE ${PORT}

CMD ["dumb-init", "npm", "start"]