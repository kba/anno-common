FROM node:7.9

WORKDIR /anno
ADD [".", "/anno/"]
RUN npm install
RUN cd /anno && ./node_modules/.bin/lerna bootstrap --loglevel silly
