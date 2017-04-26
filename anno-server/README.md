# anno-server

https://www.w3.org/TR/annotation-protocol/

## Build with docker

In the base directory of the monorepo:

```sh
npm run docker
```

This will build the base image. Then the server image

```sh
cd anno-server; npm run docker
```

Then run it

```sh
docker run --rm -it -p 3333:3000 \
  -e ANNO_OPENAPI_HOST=localhost:3333 \
  -e ANNO_BASE_URL=http://localhost:3333 \
  kbai/anno-server
```

Will start the server and expose it to port 3333. Visit
[http://localhost:3333/swagger](http://localhost:3333/swagger) to explore.


## Deploy on heroku

E.g. https://anno-server.herokuapp.com/

```sh
# heroku create
heroku config:set APT_CACHING=yes
heroku buildpacks:set https://github.com/ivandeex/heroku-buildpack-apt
heroku buildpacks:add --index 2 heroku/nodejs
```
