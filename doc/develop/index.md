# Development

The project is organized as a set of modules inside a monorepo. To build the
core services like stores, server and browser library, you need to clone this
repo and build/develop what you want.

Other projects of interest are:

* [anno-frontend](https://github.com/kba/anno-frontend) - A web user interface based on Vue.js

## Bootstrap

You need the lerna tool to bootstrap all the modules:

```sh
# Install lerna
npm install

# Bootstrap dependencies of all modules
lerna bootstrap --hoist
```

!!! warning
    This might take a while

## Makefile

Testing and building is orchestrated with a self-documenting Makefile. Running `make` in the root of the repository will give you an overview:

<!-- BEGIN-EVAL make help -->

  Targets

    bootstrap                 lerna bootstrap and check for binaries
    anno-fixtures/index.json  Setup test fixtures
    start\:%                  cd anno-% && make start
    stop\:%                   cd anno-% && make stop
    start-all                 start mongodb, sql and server
    stop-all                  stop mongodb, sql and server
    test-all                  Run all unit/integration tests.
    test                      Run all tests set as TESTS.
    test\:%                   Run all unit/integration tests in <MODULE>, e.g. make test:store-sql
    clean                     Remove tempdir
    webpack                   webpack dev, min, fixtures
    webpack-dev               webpack -s
    webpack-watch             webpack -d -w
    webpack-fixtures          webpack fixtures
    webpack-min               webpack production version
    webpack/clean             Remove all webpacked files
    site                      Build the documentation in './site'
    site/serve                Continuously serve the site on localhost:8000
    shinclude                 Run shinclude on markdown sources
    site-deploy               Deploy site to Github pages

  Variables

    TEMPDIR   Directory for temporary data. Default: '/home/kba/build/github.com/kba/anno-docker/anno-common/temp'
    REPORTER  TAP reporter to use. Default tap. One of
                classic doc dot dump json jsonstream
                landing list markdown min nyan progress  
                silent spec tap xunit 
    TESTS     All Tests. Default: './anno-queries/queries.test.js ./anno-util/util.test.js ./anno-store-memory/store-memory.test.js ./anno-plugins/rights.test.js ./anno-test/middlewares.test.js ./anno-schema/schema.test.js ./anno-store-file/store-file.test.js ./anno-store-http/store-http.test.js ./anno-store-sql/store-sql.test.js ./anno-store-mongodb/store-mongodb.test.js ./envyconf/envyconf.test.js'

<!-- END-EVAL -->
