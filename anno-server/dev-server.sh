#!/bin/bash
lerna bootstrap
# export ANNO_LOGLEVEL="silly"
export ANNO_LOGLEVEL="debug"
export ANNO_STORE_FILE="/tmp/annotest.nedb"
export ANNO_ENABLE_JWT_AUTH="true"
export ANNO_MIDDLEWARE_PLUGINS='@kba/anno-plugins:PreCollectionStatic'
export ANNO_STORE_HOOKS_PRE="
  @kba/anno-plugins:PreUserStatic,
  @kba/anno-plugins:CreatorInjectorStatic
  "
export ANNO_USER_DATA='{"john":{"public":{"displayName": "T.U.F.K.A. John"}}}'
export ANNO_STORE_HOOKS_POST=""
export ANNO_COLLECTION_DATA='{
  "default": {
    "secret":"not really secret",
    "doiTemplate": "10.5072/foo.{{ fullid }}",
    "heiperEndpoint": "http://localhost:8989/dummy/dummy"
  }
}'
nodemon server.js
