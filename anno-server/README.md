# anno-server

https://www.w3.org/TR/annotation-protocol/

## Deploy on heroku

E.g. https://anno-server.herokuapp.com/

```sh
# heroku create
heroku config:set APT_CACHING=yes
heroku buildpacks:set https://github.com/ivandeex/heroku-buildpack-apt
heroku buildpacks:add --index 2 heroku/nodejs
```
