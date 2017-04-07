module.exports = {

    annotationNotFound(id) {
        const err = new Error(`Annotation not found in store: ${JSON.stringify(id)}`)
        err.code = 404
        return err
    },

    replyNotFound(id) {
        const err = new Error(`Reply not found in store: ${JSON.stringify(id)}`)
        err.code = 404
        return err
    },

    revisionNotFound(id, rev) {
        const err = new Error(`No revision '${rev}' for annotation '${id}'`)
        err.code = 404
        return err
    },

    readonlyValue(id, field) {
        const err = new Error(`Client must not change the '${field}' of annotation '${id}'`)
        err.code = 409
        return err
    },

    invalidAnnotation(anno, errors) {
        const err = new Error(`Annotation is invalid: ` + JSON.stringify({anno, errors}, null, 2))
        err.validationErrors = errors
        err.code = 415
        return err
    },

    forbidden(reason, ctx) {
        const err = new Error(`ACL forbids it: ${reason}`)
        err.code = 403
        err.ctx = ctx
        return err
    }

}
