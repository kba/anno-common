PATH := ./node_modules/.bin:$(PATH)
REPORTER ?= tap
.PHONY: test
test:
	tap -R$(REPORTER) test/*.test.js
test\:%:
	tap -R$(REPORTER) test/$*.test.js
