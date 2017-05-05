TEMPDIR ?= ../temp
MKDIR = mkdir -p

WPT_REPO = $(TEMPDIR)/web-platform-tests

help:
	@echo
	@echo "  Targets"
	@echo
	@echo "    fixtures     Download assets from web-platform-tests"
	@echo "    index.json  Create one big JSON file"
	@echo
	@echo "  Variables"
	@echo
	@echo "    TEMPDIR     Directory for temporary data. Default: $(TEMPDIR)"

fixtures: $(WPT_REPO)
	@$(MKDIR) $(TEMPDIR)
	@cp -n $(WPT_REPO)/annotation-protocol/files/annotations/*.json "Annotation/ok"
	@# these are invalid for the current draft (composite/list)
	# @mv Annotation/ok/anno11.json Annotation/ok/anno12.json Annotation/ok/anno13.json Annotation/notOk

index.json: fixtures
	node make-json.js > "$@"

$(WPT_REPO):
	git clone --depth 1 'https://github.com/w3c/web-platform-tests/' "$@"

