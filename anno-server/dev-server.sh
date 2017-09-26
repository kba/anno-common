#!/bin/bash
lerna bootstrap
ANNO_LOGLEVEL="silly" \
ANNO_SERVER_AUTH="plain" \
ANNO_STORE_FILE="/tmp/annotest.nedb" \
ANNO_ENABLE_JWT_AUTH="true" \
ANNO_MIDDLEWARE_PLUGINS='@kba/anno-plugins:PreCollectionStatic' \
ANNO_COLLECTION_DATA='{"default":{"secret":"not really secret"}}' \
ANNO_USER_DATA='{"john":{"public":{"displayName": "T.U.F.K.A. John"}}}' \
ANNO_STORE_HOOKS_PRE="@kba/anno-plugins:PreUserStatic,@kba/anno-plugins:CreatorInjectorStatic,@kba/anno-plugins:PreAclStatic" \
node server.js
