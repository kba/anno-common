#!/bin/bash
lerna bootstrap
ANNO_SERVER_AUTH="plain" \
ANNO_STORE_FILE="/tmp/annotest.nedb" \
ANNO_ENABLE_JWT_AUTH="" \
node server.js
