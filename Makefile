MAKEFLAGS += --no-print-directory --silent
PATH := ./node_modules/.bin:$(PATH)
MKDIR = mkdir -p
RM = rm -rf

# Directory for temporary data. Default: '$(TEMPDIR)'
TEMPDIR = $(PWD)/temp

# TAP reporter to use. Default "$(REPORTER)". One of
#   classic doc dot dump json jsonstream
#   landing list markdown min nyan progress  
#   silent spec tap xunit 
#REPORTER = spec
REPORTER = tap

# All Tests. Default: '$(TESTS)'
TESTS = $(shell find . -mindepth 1 -maxdepth 2 -name '*.test.js')

SITEDIR = gh-pages

# BEGIN-EVAL makefile-parser --make-help Makefile

help:
	@echo ""
	@echo "  Targets"
	@echo ""
	@echo "    bootstrap                 lerna bootstrap and check for binaries"
	@echo "    anno-fixtures/index.json  Setup test fixtures"
	@echo "    start\:%                  cd anno-% && make start"
	@echo "    stop\:%                   cd anno-% && make stop"
	@echo "    start-all                 start mongodb and server"
	@echo "    stop-all                  stop mongodb and server"
	@echo "    test-all                  Run all unit/integration tests."
	@echo "    test                      Run all tests set as TESTS."
	@echo "    test\:%                   Run all unit/integration tests in <MODULE>, e.g. make test:store-sql"
	@echo "    clean                     Remove tempdir"
	@echo "    webpack                   webpack dev, min, fixtures"
	@echo "    webpack-dev               webpack -s"
	@echo "    webpack-watch             webpack -d -w"
	@echo "    webpack-fixtures          webpack fixtures"
	@echo "    webpack-min               webpack production version"
	@echo "    site                      Generate static website in $(SITEDIR)"
	@echo "    site-deploy               Generate site and deploy to github"
	@echo ""
	@echo "  Variables"
	@echo ""
	@echo "    TEMPDIR   Directory for temporary data. Default: '$(TEMPDIR)'"
	@echo "    REPORTER  TAP reporter to use. Default "$(REPORTER)". One of"
	@echo "                classic doc dot dump json jsonstream"
	@echo "                landing list markdown min nyan progress  "
	@echo "                silent spec tap xunit "
	@echo "    TESTS     All Tests. Default: '$(TESTS)'"

# END-EVAL

# lerna bootstrap and check for binaries
.PHONY: bootstrap
bootstrap:
	@if ! which rapper >/dev/null;then echo "rapper not installed. try 'apt install raptor2-utils'" ; exit 1 ;fi
	lerna bootstrap

# Setup test fixtures
.PHONY: bootstrap-test
bootstrap-test: bootstrap anno-fixtures/index.json
	
anno-fixtures/index.json:
	cd $(dir $@) && make $(notdir $@)

#
# Starting / Stopping
#

# cd anno-% && make start
start\:%: anno-%
	cd $< && make start

# cd anno-% && make stop
stop\:%: anno-%
	cd $< && make stop

# start mongodb and server
start-all: start\:store-mongodb start\:server
	sleep 2

# stop mongodb and server
stop-all: stop\:store-mongodb stop\:server


#
# Tests
#

# Run all unit/integration tests.
.PHONY: test-all
test-all: $(TESTS)
	$(MAKE) start-all
	$(MAKE) test TESTS="$(TESTS)"
	$(MAKE) stop-all

# Run all tests set as TESTS.
.PHONY: test
test: $(TESTS)
	-tap -R$(REPORTER) $^ | grep -v async

# Run all unit/integration tests in <MODULE>, e.g. make test:store-sql
.PHONY: anno-%
test\:%: anno-%
	-$(MAKE) -siC $< start 2>/dev/null && sleep 2
	-tap -R$(REPORTER) "$</"*.test.js "$</test/"*.test.js | grep -v async
	-$(MAKE) -siC $< stop 2>/dev/null

# Remove tempdir
.PHONY: clean
clean:
	$(RM) $(TEMPDIR)

#
# Webpack
#

# webpack dev, min, fixtures
.PHONY: webpack
webpack: webpack-dev webpack-fixtures webpack-min 

# webpack -s
.PHONY: webpack-dev
webpack-dev:
	cd anno-webpack && webpack -d

# webpack -d -w
.PHONY: webpack-watch
webpack-watch:
	cd anno-webpack && webpack -d -w

# webpack fixtures
.PHONY: webpack-fixtures
webpack-fixtures:
	cd anno-webpack && webpack --config webpack.config.fixtures.js

# webpack production version
.PHONY: webpack-min
webpack-min:
	cd anno-webpack && webpack -p --output-filename anno.min.js

#
# Github pages
#

$(SITEDIR):
	git clone --branch gh-pages https://github.com/kba/anno $(SITEDIR)

# Generate static website in $(SITEDIR)
.PHONY: site
site: $(SITEDIR)
	cp anno-schema/context.json $(SITEDIR)/context.jsonld
	$(MKDIR) $(SITEDIR)/dist/
	cp anno-webpack/dist/* $(SITEDIR)/dist/
	$(MAKE) -C $(SITEDIR) clean
	cd $(SITEDIR) && $(MAKE) -j4 STAGE=prod all

# Generate site and deploy to github
.PHONY: site-deploy
site-deploy: site
	cd $(SITEDIR) && git add . && git commit --edit -m "updated docs `date`" && git push
