module.exports = {
    Schema: require('@kba/anno-schema'),
    Config: require('@kba/anno-config'),
    Errors: require('@kba/anno-errors'),
    Store: require('@kba/anno-store'),
    HttpStore: require('@kba/anno-store-http'),
    MemoryStore: require('@kba/anno-store-memory'),
    BasicAuthMiddleware: require('@kba/anno-mw-basicauth'),
    HttpHeadersMiddleware: require('@kba/anno-mw-httpheaders'),
}
