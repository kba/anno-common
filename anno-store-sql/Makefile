PATH:=./node_modules/.bin:$(PATH)

# Migrate to latest schema
start:
	-rm ../temp/example.sqlite3
	./node_modules/.bin/knex migrate:latest
