# anno-store-mongolike

> Store base class for Mongo-like NoSQL databases

MongoDB provides a straightforward interface for interacting with
a JSON database that hase been adapted by others, like NeDB.

This is a partial implementation of an [anno
store](https://github.com/kba/anno-store) that should make it easy to adapt to
backends similar to MongoDB.

For implementations, see:

* [anno-store-mongodb](https://github.com/kba/anno-store-mongodb)
* [anno-store-file](https://github.com/kba/anno-store-file)
* [anno-store-memory](https://github.com/kba/anno-store-memory)

## Subclassing

Subclasses must override

* `_wipe`
