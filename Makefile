MAKEFLAGS += --no-print-directory
TEMPDIR = $(PWD)/temp

PATH := ./node_modules/.bin:$(PATH)
PACKAGES = $(shell find . -mindepth 1 -maxdepth 1 -name 'anno-*' -type d)
TESTS = $(shell find . -mindepth 1 -maxdepth 2 -name '*.test.js')
# REPORTER = spec
REPORTER = tap
# REPORTER = classic

MKDIR = mkdir -p
RM = rm -rf

help:
	@echo
	@echo "  Targets"
	@echo
	@echo "    bootstrap   lerna bootstrap"
	@echo "    start-all   Start mongodb and server"
	@echo "    stop-all    Stop mongodb and server"
	@echo "    clean       Remove tempdir"
	@echo "    test        Run all unit/integration tests"
	@echo "    docs        Generate static website in $(DOCDIR)"
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

stop-all:
	$(MAKE) -sC anno-store-mongodb stop
	$(MAKE) -sC anno-server stop

.PHONY: test
test: $(TESTS)
	$(MAKE) start-all && sleep 2
	-tap -R$(REPORTER) $^
	$(MAKE) stop-all

.PHONY: anno-%
test\:%: anno-%
	-$(MAKE) bootstrap
	-$(MAKE) -sC $< start && sleep 2
	-tap -R$(REPORTER) "$</"*.test.js "$</test/"*.test.js
	-$(MAKE) -sC $< stop

.PHONY: clean
clean:
	$(RM) $(TEMPDIR)

.PHONY: docs
docs:
	$(MKDIR) docs
	node -e 'console.log(JSON.stringify(require("./anno-schema/schema.js").jsonldContext, null, 2));' \
		> docs/context.jsonld
	git commit -m 'updated docs' docs && git push
