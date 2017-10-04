FROM node:8
WORKDIR /anno
ADD [".", "/anno/"]
RUN npm install
RUN cd /anno && ./node_modules/.bin/lerna bootstrap --loglevel silly
RUN apt-get update && apt-get install -yy raptor2-utils
CMD ["node", "anno-server/server.js"]
