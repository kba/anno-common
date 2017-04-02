MAKEFLAGS += --no-print-directory --silent
TEMPDIR = $(PWD)/temp

PATH := ./node_modules/.bin:$(PATH)
PACKAGES = $(shell find . -mindepth 1 -maxdepth 1 -name 'anno-*' -type d)
TESTS = $(shell find . -mindepth 1 -maxdepth 2 -name '*.test.js')
# REPORTER = spec
REPORTER = tap
# REPORTER = classic

SITEDIR = gh-pages

MKDIR = mkdir -p
RM = rm -rf

help:
	@echo
	@echo "  Targets"
	@echo
	@echo "    bootstrap         lerna bootstrap"
	@echo "    start-all         Start mongodb and server"
	@echo "    stop-all          Stop mongodb and server"
	@echo "    clean             Remove tempdir"
	@echo "    test              Run all unit/integration tests"
	@echo "    test:MODULE       Run all unit/integration tests in <MODULE>"
	@echo "    site              Generate static website in $(SITEDIR)"
	@echo "    site-deploy       Generate site and deploy to github"
	@echo "    webpack           dev, min, fixtures"
	@echo "    webpack-dev       webpack -p"
	@echo "    webpack-watch     webpack -d -w"
	@echo "    webpack-min       webpack -p"
	@echo "    webpack-fixtures  webpack for fixtures"
	@echo
	@echo "  Variables"
	@echo
	@echo "    TEMPDIR     Directory for temporary data. Default: $(TEMPDIR)"
	@echo "    REPORTER    TAP Reporter for node-tap (spec, classic, tap...). Default: $(REPORTER)"

.PHONY: bootstrap
bootstrap:
	lerna bootstrap

start-all: bootstrap
	$(MAKE) -sC anno-store-mongodb start
	$(MAKE) -sC anno-server start
	sleep 2

stop-all:
	$(MAKE) -sC anno-store-mongodb stop
	$(MAKE) -sC anno-server stop

.PHONY: test
test: $(TESTS)
	$(MAKE) start-all
	-tap -R$(REPORTER) $^
	$(MAKE) stop-all

.PHONY: anno-%
test\:%: anno-%
	-$(MAKE) bootstrap
	-$(MAKE) -siC $< start 2>/dev/null && sleep 2
	-tap -R$(REPORTER) "$</"*.test.js "$</test/"*.test.js
	-$(MAKE) -siC $< stop 2>/dev/null

.PHONY: clean
clean:
	$(RM) $(TEMPDIR)

#
# Webpack
#

.PHONY: webpack
webpack: webpack-dev webpack-fixtures webpack-min 

.PHONY: webpack-dev
webpack-dev:
	cd anno-webpack && webpack -d

.PHONY: webpack-watch
webpack-watch:
	cd anno-webpack && webpack -d -w

.PHONY: webpack-fixtures
webpack-fixtures:
	cd anno-webpack && webpack --config webpack.config.fixtures.js

.PHONY: webpack-min
webpack-min:
	cd anno-webpack && webpack -p --output-filename anno.min.js

#
# Github pages
#

$(SITEDIR):
	git clone --branch gh-pages https://github.com/kba/anno $(SITEDIR)

.PHONY: site
site: $(SITEDIR)
	cp anno-schema/context.json $(SITEDIR)/context.jsonld
	$(MKDIR) $(SITEDIR)/dist/
	cp anno-webpack/dist/* $(SITEDIR)/dist/

.PHONY: site-deploy
site-deploy: site webpack
	cd $(SITEDIR) && git commit --edit -m 'updated docs' docs && git push
