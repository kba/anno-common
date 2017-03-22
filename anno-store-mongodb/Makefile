TEMPDIR = $(PWD)/../temp
MONGODIR = $(TEMPDIR)/mongodb
MONGOPORT = 32123
PIDFILE = $(TEMPDIR)/mongo.pid

.PHONY: start
start:
	@mkdir -p $(MONGODIR)
	if [ ! -e $(PIDFILE) ];then \
		mongod --dbpath $(MONGODIR) --port $(MONGOPORT) > $(TEMPDIR)/mongo.log & echo $$! > $(PIDFILE) \
		; echo "Mongo started in $(MONGODIR) on port $(MONGOPORT)"; \
	fi

.PHONY: stop
stop:
	-kill `cat $(PIDFILE)`; rm "$(PIDFILE)"
