PATH := ./node_modules/.bin:$(PATH)
PACKAGES = $(shell find . -mindepth 1 -maxdepth 1 -name 'anno-*' -type d)
TESTS = $(shell find . -mindepth 1 -maxdepth 2 -name '*.test.js')
# REPORTER = spec
REPORTER = tap
# REPORTER = classic

MKDIR = mkdir -p
RM = rm -rf

.PHONY: bootstrap
bootstrap:
	lerna bootstrap

start-all:
	$(MAKE) -sC anno-store-mongodb start
	$(MAKE) -sC anno-server start

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
	-tap -R$(REPORTER) "$</"*.test.js "$</test/"*.test.js
	# tap -R$(REPORTER) $(find $^)

.PHONY: clean
clean:
	$(RM) ./temp

.PHONY: docs
docs:
	$(MKDIR) docs
	node -e 'console.log(JSON.stringify(require("./anno-schema/schema.js").jsonldContext, null, 2));' \
		> docs/context.jsonld
	git commit -m 'updated docs' docs && git push
