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
TESTS = $(shell find . -mindepth 1 -maxdepth 2 -name '*.test.js' -and -not -name 'store-sql.test.js')

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
	@echo "    start-all                 start mongodb, sql and server"
	@echo "    stop-all                  stop mongodb, sql and server"
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

# start mongodb, sql and server
start-all:
	make start:store-sql
	make start:store-mongodb
	make start:server
	sleep 2

# stop mongodb, sql and server
stop-all:
	make start:store-sql
	make stop:store-mongodb
	make stop:server


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

# webpack min, fixtures, schema, memory-store, schema
.PHONY: webpack
webpack: webpack-min webpack/fixtures webpack/memory-store webpack/schema

# webpack -s
.PHONY: webpack-dev
webpack-dev:
	cd anno-webpack && webpack -d

# webpack -d -w
.PHONY: webpack-watch
webpack-watch:
	cd anno-webpack && webpack -d -w

.PHONY: webpack/%
webpack/%:
	@echo "# `date` Building anno-$(notdir $@).js"
	cd anno-webpack && webpack -p --config webpack.config.$(notdir $@).js

# webpack production version
.PHONY: webpack-min
webpack-min:
	cd anno-webpack && webpack -p --output-filename anno.min.js

# Remove all webpacked files
webpack-clean:
	rm -rvf anno-webpack/dist

#
# Github pages
#

$(SITEDIR):
	git clone --branch gh-pages https://github.com/kba/anno $(SITEDIR)

# Generate static website in $(SITEDIR)
.PHONY: site
site:
	@if ! which mkdocs >/dev/null;then echo "mkdocs not installed. try 'pip install mkdocs-material'" ; exit 1 ;fi
	mkdocs build

# Continuously serve the site on localhost:8000
.PHONY: site/serve
site/serve:
	@if ! which mkdocs >/dev/null;then echo "mkdocs not installed. try 'pip install mkdocs-material'" ; exit 1 ;fi
	mkdocs serve

# Rebuild the dist folder to be deployed
.PHONY: site-dist
site-dist: webpack-clean webpack
	rm -rvf site/assets/dist
	cp -rv anno-webpack/dist site/assets/dist
	cp -v anno-schema/context.json doc/context.jsonld

# Run shinclude on markdown sources
.PHONY: shinclude
shinclude:
	@if ! which shinclude >/dev/null;then echo "shinclude not installed. See https://github.com/kba/shinclude'" ; exit 1 ;fi
	find doc -name '*.md' -exec shinclude -c xml -i {} \;
	shinclude -c pound -i Makefile
	find . -maxdepth 1 -name 'README.md' -exec shinclude -c xml -i {} \;

# Deploy site to Github pages
.PHONY: site-dist shinclude
site-deploy: site
	cd $(SITEDIR) && git add . && git commit --edit -m "updated docs `date`" && git push
