#!/bin/bash
lerna bootstrap --hoist
# export ANNO_LOGLEVEL="silly"
export ANNO_LOGLEVEL="debug"
export ANNO_STORE_FILE="/tmp/annotest.nedb"
export ANNO_ENABLE_JWT_AUTH="true"
export ANNO_MIDDLEWARE_PLUGINS='@kba/anno-plugins:PreCollectionStatic'
export ANNO_STORE_HOOKS_PRE="
  @kba/anno-plugins:PreUserStatic,
  @kba/anno-plugins:PreAclStatic,
  @kba/anno-plugins:CreatorInjectorStatic
  "
# export ANNO_USER_DATA='{"john":{"public":{"displayName": "T.U.F.K.A. John"}}}'
export ANNO_STORE_HOOKS_POST="@kba/anno-plugins:CreatorInjectorStatic"
export ANNO_COLLECTION_DATA='{
  "default": {
    "secret":"123",
    "doiTemplate": "10.5072/foo.{{ fullid }}",
    "heiperEndpoint": "http://localhost:8989/dummy/dummy"
  },
  "test": {
    "secret":"wfnewjk17y84123hun,m4123781hnjkbnsdvjl.KJII*$!@#UIJWDKXMSdcs",
    "doiTemplate": "10.5072/foo.{{ fullid }}",
    "heiperEndpoint": "http://localhost:8989/dummy/dummy"
  }
}'
nodemon server.js
