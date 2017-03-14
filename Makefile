PATH := ./node_modules/.bin:$(PATH)
PACKAGES = $(shell find packages -mindepth 1 -maxdepth 1 -type d)
TESTS = $(shell find packages -mindepth 2 -maxdepth 3 -name '*.test.js')
# REPORTER = spec
REPORTER = classic

.PHONY: bootstrap
bootstrap:
	lerna bootstrap

# for pkg in $(PACKAGES);do tap -Rspec $$pkg/test/*.test.js;done
.PHONY: test
test: $(TESTS)
	tap -R$(REPORTER) $^
