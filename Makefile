PATH := $(PWD)/node_modules/.bin:$(PATH)
STAGE = dev
PUG = pug -P -O src/$(STAGE).json -o $(PWD)

all: index.html validator.html

.PHONY: watch
watch:
	$(PUG) -w src/*.pug

%.html: src/%.pug
	mkdir -p "$(dir $@)"
	$(PUG) $<
