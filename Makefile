PATH := ./node_modules/.bin:$(PATH)
PACKAGES = $(shell find . -mindepth 1 -maxdepth 1 -name 'anno-*' -type d)
TESTS = $(shell find . -mindepth 1 -maxdepth 2 -name '*.test.js')
# REPORTER = spec
REPORTER = classic

RM = rm -rf

.PHONY: bootstrap
bootstrap:
	lerna bootstrap

# for pkg in $(PACKAGES);do tap -Rspec $$pkg/test/*.test.js;done
.PHONY: test
test: $(TESTS)
	tap -R$(REPORTER) $^

.PHONY: clean
clean:
	$(RM) ./temp
