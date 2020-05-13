# Build stage 1
# Install dependencies and build the code.
FROM node:lts-alpine AS appBuild
ENV INSTALL_PATH /usr/src/app
RUN mkdir -p $INSTALL_PATH
WORKDIR $INSTALL_PATH 

# REQUIRED BUILD ARG
# docker build --build-arg "NPM_TOKEN_ARG=$NPM_TOKEN" .
# ARG NPM_TOKEN_ARG
# ENV NPM_TOKEN=$NPM_TOKEN_ARG
# RUN echo "NPM_TOKEN: $NPM_TOKEN"

# Everything needed to setup dependencies
# COPY .npmrc .
COPY package.json .

# COPY rest of code
# NOTE: .dockerignore file reduces the scope of what gets copied here
COPY . . 

# NOTE: What data REMAINS after a step becomes a cached layer.
# So cleaning dev dependencies reduces total image size.
RUN npm install && npm run build && npm prune --production

# Uncomment to debug what is in the final image and what is taking up the space
# RUN ls -lah
# RUN du -h -d 1 .

FROM node:lts-alpine AS production
ENV INSTALL_PATH /usr/src/app
RUN mkdir -p $INSTALL_PATH
COPY --from=appBuild $INSTALL_PATH $INSTALL_PATH
WORKDIR $INSTALL_PATH 

EXPOSE 8888
# NOTE: DO NOT RUN ["npm", "start"] as the ENTRYPOINT
# It does not forward the SIGTERM and SIGINT events to Node
# Requires dependency source-map-support to produce source-mapped stack traces
ENTRYPOINT [ "node", "-r", "source-map-support/register", "dist/server.js" ]


