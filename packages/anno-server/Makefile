.PHONY: watch
watch: swagger-ui
	nodemon -e "yml js" -w '.' src/server.js

.PHONY: serve
serve: swagger-ui
	node src/server.js

.PHONY: swagger-ui
swagger-ui:
	sed -i \
		-e 's,docExpansion: "none",docExpansion: "list",' \
		-e 's,jsonEditor: false,jsonEditor: true,' \
		public/swagger-ui/dist/index.html
