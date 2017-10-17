exports.up = function (knex) {
  return knex.schema

  .createTable('Annotation', function (table) {
    table.string('_id').primary()
    table.string('_collectionId').references('_id').inTable('AnnotationCollection')
    table.string('_replyTo').references('_id').inTable('Annotation')
    table.dateTime('modified')
    table.dateTime('deleted')
  })

  .createTable('AnnotationRevision', function (table) {
    table.string('_id').primary()
    table.string('_revOf').references('_id').inTable('Annotation').onDelete('CASCADE')
    table.dateTime('created')
    table.dateTime('modified')
    table.dateTime('generated')
    table.string('generator')
    table.string('purpose')
    table.string('motivation')
    table.string('rights')
    table.string('via')
    table.string('title')
    table.string('canonical')
  })

  .createTable('Type', function (table) {
    table.string('_id').primary()
  })

  .createTable('AnnotationType', function (table) {
    table.string('_revId').references('_id').inTable('AnnotationRevision')
    table.string('typeId').references('_id').inTable('Type')
  })

  .createTable('AnnotationRevisionUri', function (table) {
    table.string('_from').references('_id').inTable('AnnotationRevision').onDelete('CASCADE')
    table.string('_prop').notNull()
    table.string('uri').notNull()
  })

  .createTable('ResourceUri', function (table) {
    table.string('_from').references('_id').inTable('Resource').onDelete('CASCADE')
    table.string('_prop').notNull()
    table.string('uri').notNull()
  })

  .createTable('Resource', function (table) {
    table.increments('_id').primary()
    table.string('id')
    table.string('value')
    table.string('source')
    table.string('format')
    table.string('type')
    table.dateTime('created')
    table.string('accessibility')
    table.string('purpose')
    table.string('rights')
    table.string('processingLanguage')
    table.string('textDirection')
    table.string('motivation')
    table.string('language')
    table.string('scope')
    table.string('styleClass')
    table.integer('_selId').references('_id').inTable('Selector')
    table.integer('_stateId').references('_id').inTable('State')
  })

  .createTable('Choice', function (table) {
    table.integer('_resId').references('_id').inTable('Resource')
    table.integer('_itemId').references('_id').inTable('Resource')
  })

  .createTable('Selector', function (table) {
    table.increments('_id').primary()
    table.string('id')
    table.string('type')
    table.string('startSelector')
    table.string('endSelector')
    table.string('start')
    table.string('end')
    table.string('exact')
    table.string('suffix')
    table.string('prefix')
    table.string('value')
    table.string('conformsTo')
    table.integer('_refinedBy').references('_id').inTable('Selector').onDelete('CASCADE')
  })

  .createTable('State', function (table) {
    table.increments('_id').primary()
    table.dateTime('sourceDate')
    table.string('id')
    table.string('type')
    table.string('cached')
    table.string('value')
    table.string('conformsTo')
    table.integer('_refinedBy').references('_id').inTable('State').onDelete('CASCADE')
  })

  .createTable('Agent', function (table) {
    table.string('_id').primary()
    table.string('homepage')
    table.string('id')
    table.string('name')
    table.string('nickname')
    table.string('type')
    table.string('email_sha1')
    table.string('schema:educationalRole')
  })

  .createTable('AnnotationRevisionAgent', function (table) {
    table.string('_from').references('_id').inTable('AnnotationRevision').onDelete('CASCADE')
    table.string('_prop').notNull()
    table.string('_to').references('_id').inTable('Agent').onDelete('CASCADE')
  })
  .createTable('AnnotationRevisionResource', function (table) {
    table.string('_from').references('_id').inTable('AnnotationRevision').onDelete('CASCADE')
    table.string('_prop').notNull()
    table.string('_to').references('_id').inTable('Resource').onDelete('CASCADE')
  })

  .createTable('ResourceResource', function (table) {
    table.string('_from').references('_id').inTable('Resource').onDelete('CASCADE')
    table.string('_prop').notNull()
    table.string('_to').references('_id').inTable('Resource').onDelete('CASCADE')
  })
  .createTable('ResourceAgent', function (table) {
    table.string('_from').references('_id').inTable('Resource').onDelete('CASCADE')
    table.string('_prop').notNull()
    table.string('_to').references('_id').inTable('Agent').onDelete('CASCADE')
  })

  .createTable('AnnotationCollection', function (table) {
    table.string('_id').primary()
    table.string('name')
    table.string('secret')
  })

}
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('Annotation')
    .dropTableIfExists('AnnotationCollection')
    .dropTableIfExists('AnnotationRevision')
    .dropTableIfExists('Person')
    .dropTableIfExists('PersonAlias')
}
// vim: sw=2 ts=2
