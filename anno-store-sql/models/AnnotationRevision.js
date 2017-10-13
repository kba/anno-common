const Model = require('./Model')
module.exports = class AnnotationRevision extends Model {

  static get tableName() {return 'AnnotationRevision'}

  static get relationMappings() {
    return {

      type: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/Type`,
        join: {
          from: 'AnnotationRevision._id',
          through: {
            from: 'AnnotationType._revId',
            to: 'AnnotationType.typeId',
          },
          to: 'Type._id',
        }
      },

      targetResources: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/Resource`,
        filter: {_prop: 'target'},
        join: {
          from: 'Resource._revId',
          to: 'AnnotationRevision._id',
        }
      },

      bodyResources: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/Resource`,
        filter: {_prop: 'body'},
        join: {
          from: 'Resource._revId',
          to: 'AnnotationRevision._id',
        }
      },

      targetUris: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/Uri`,
        filter: {_prop: 'target'},
        join: {
          from: 'Uri._revId',
          to: 'AnnotationRevision._id',
        }
      },

      bodyUris: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/Uri`,
        filter: {_prop: 'body'},
        join: {
          from: 'Uri._revId',
          to: 'AnnotationRevision._id',
        }
      },


      // creators: {
      //   relation: Model.HasManyRelation,
      //   modelClass: `${__dirname}/Person`,
      //   join: {
      //     from: 'Person._id',
      //     to: 'Annotation._id',
      //   }
      // },

    }
  }

}

