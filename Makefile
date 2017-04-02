PATH := $(PWD)/node_modules/.bin:$(PATH)
STAGE = dev
PUG = pug -P -O src/$(STAGE).json -o $(PWD)
HTML = index.html validator.html

all: $(HTML)

clean:
	rm -f $(HTML)

.PHONY: watch
watch:
	$(PUG) -w src/*.pug

%.html: src/%.pug
	mkdir -p "$(dir $@)"
	$(PUG) $<
