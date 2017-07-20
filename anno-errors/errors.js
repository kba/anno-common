module.exports = {

    /*
     * ## `badSlug(slug)`
     */
    badSlug(slug) {
        const err = new Error(`Slug Bad: ${JSON.stringify(slug)}`)
        err.code = 400
        return err
    },

    /*
     * ## `annotationDeleted(id, date)`
     */
    annotationDeleted(id, date) {
        const err = new Error(`Annotation was deleted: ${JSON.stringify({id, date})}`)
        err.code = 410
        return err
    },

    /*
     * ## `annotationNotFound(id)`
     */
    annotationNotFound(id) {
        const err = new Error(`Annotation not found in store: ${JSON.stringify(id)}`)
        err.code = 404
        return err
    },

    /*
     * ## `replyNotFound(id)`
     */
    replyNotFound(id) {
        const err = new Error(`Reply not found in store: ${JSON.stringify(id)}`)
        err.code = 404
        return err
    },

    /*
     * ## `revisionNotFound(id, rev)`
     */
    revisionNotFound(id, rev) {
        const err = new Error(`No revision '${rev}' for annotation '${id}'`)
        err.code = 404
        return err
    },

    /*
     * ## `readonlyValue(id, field, valueBefore, value)`
     */
    readonlyValue(id, field, valueBefore, value) {
        const err = new Error(`Client must not change the '${field}' of annotation '${id}' from \n${JSON.stringify(valueBefore)} to ${JSON.stringify(value)}`)
        err.code = 409
        return err
    },

    /*
     * ## `invalidAnnotation(anno, errors)`
     */
    invalidAnnotation(anno, errors) {
        const err = new Error(`Annotation is invalid: ` + JSON.stringify({anno, errors}, null, 2))
        err.validationErrors = errors
        err.code = 415
        return err
    },

    /**
     * ## `mismatch(reason, ctx)`
     *
     * https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.4.13
     */
    mismatch(reason, expected, actual) {
        const err = new Error(`Mismatch: ${reason}\n\tExpected: '${expected}'\n\tActual: ${actual}`)
        err.code = 412
        err.ctx = {expected, actual}
        return err
    },

    /**
     * ## `forbidden(reason, ctx)`
     */
    forbidden(reason, ctx) {
        const err = new Error(`ACL forbids it: ${reason}`)
        err.code = 403
        err.ctx = ctx
        return err
    },


    /**
     * ## `badRequest(reason, errors=[])`
     *
     */
    badRequest(reason, errors) {
        const err = new Error(`[Bad request] ${reason}: ${errors ? JSON.stringify(errors, null, 2) : ''}`)
        err.code = 400
        err.ctx = {errors}
        return err
    },

    /**
     * ## `fileNotFound(filename, error='')`
     *
     */
    fileNotFound(filename, error='') {
        const err = new Error(`[File not found] ${filename}: ${error ? JSON.stringify(error, null, 2) : ''}`)
        err.code = 500
        err.ctx = {error}
        return err
    }

}
