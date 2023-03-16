###     --The Build Image--     ###
FROM node:latest AS build

# A small, lightweight utility that helps to ensure that the main process -
# in a container is always the child of dumb-init. It helps avoid certain -
# problems that can arise when running applications in containers, such as -
# "zombie" processes that don't exit properly and resource leaks.
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

WORKDIR /side-car-node

COPY package*.json .

RUN npm ci --only=production

###     --The Production Image--    ###
FROM node:16.17.0-bullseye-slim

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Securing the container by not running it using the root privilage
USER node

WORKDIR /side-car-node

COPY --chown=node:node --from=build /side-car-node/node_modules /side-car-node/node_modules
COPY --chown=node:node . .

ENV PORT=6000
EXPOSE ${PORT}

# Set the entrypoint command to run the script
ENTRYPOINT ["bash", "./init-side-car.sh"]