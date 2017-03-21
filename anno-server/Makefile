TEMPDIR = $(PWD)/../temp
PIDFILE = $(TEMPDIR)/server.pid

.PHONY: watch
watch: swagger-ui
	nodemon -e "yml js" -w '.' src/server.js

.PHONY: serve
serve: swagger-ui
	node src/server.js

.PHONY: start
start:
	@if [ ! -e $(PIDFILE) ];then \
		ANNO_STORE='@kba/anno-store-nedb' \
		ANNO_NEDB_DIR='$(TEMPDIR)' \
		node src/server.js > $(TEMPDIR)/server.log 2>&1 & echo $$! > $(PIDFILE) \
		&& echo "Server started on localhost:3000"; \
	fi

.PHONY: stop
stop: $(PIDFILE)
	-kill `cat $<`; rm "$<"

.PHONY: swagger-ui
swagger-ui:
	sed -i \
		-e 's,docExpansion: "none",docExpansion: "list",' \
		-e 's,jsonEditor: false,jsonEditor: true,' \
		public/swagger-ui/dist/index.html
