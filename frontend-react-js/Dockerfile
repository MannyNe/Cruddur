###     --The Build Image--     ###
FROM node:latest AS build

# A small, lightweight utility that helps to ensure that the main process -
# in a container is always the child of dumb-init. It helps avoid certain -
# problems that can arise when running applications in containers, such as -
# "zombie" processes that don't exit properly and resource leaks.
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

WORKDIR /frontend-react-js

COPY package*.json .

RUN npm ci --only=production

###     --The Production Image--    ###
FROM node:16.17.0-bullseye-slim

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init

# Securing the container by not running it using the root privilage
USER node

WORKDIR /frontend-react-js

COPY --chown=node:node --from=build /frontend-react-js/node_modules /frontend-react-js/node_modules
COPY --chown=node:node . .

ENV PORT=3000
EXPOSE ${PORT}

# Set the entrypoint command to run the script
ENTRYPOINT ["bash", "./init.sh"]