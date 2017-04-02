WORKDIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
PATH := $(WORKDIR)node_modules/.bin:$(PATH)
STAGE = dev
PUG = pug -P -O src/$(STAGE).json -o $(WORKDIR)
HTML = \
	$(WORKDIR)index.html \
	$(WORKDIR)validator.html \
	$(WORKDIR)context.html

all: $(HTML)

clean:
	rm -f $(HTML)

.PHONY: watch
watch:
	$(PUG) -w src/*.pug

$(WORKDIR)%.html: $(WORKDIR)src/%.pug
	mkdir -p "$(dir $@)"
	cd $(WORKDIR) && $(PUG) $<
