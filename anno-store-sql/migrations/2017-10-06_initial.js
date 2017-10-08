exports.up = function (knex) {
  return knex.schema

  .createTable('Annotation', function (table) {
    table.string('_id').primary()
    table.string('_collectionId').references('_id').inTable('AnnotationCollection')
    table.string('_replyTo').references('_id').inTable('Annotation')
    table.string('via')
    table.dateTime('modified')
  })

  .createTable('AnnotationRevision', function (table) {
    table.string('_id').primary()
    table.string('_revOf').references('_id').inTable('Annotation')
    table.string('creatorId').references('_id').inTable('Person')
    table.dateTime('created')
    table.dateTime('generated')
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

  .createTable('Uri', function (table) {
    table.string('_revId').references('_id').inTable('AnnotationRevision').onDelete('CASCADE')
    table.string('_prop').notNull() // body or target
    table.string('uri').notNull()
  })

  .createTable('Resource', function (table) {
    table.string('_revId').references('_id').inTable('AnnotationRevision').onDelete('CASCADE')
    table.string('_prop').notNull() // body or target
    table.string('value')
    table.string('source')
    table.string('format')
    table.string('type')
  })

  .createTable('Person', function (table) {
    table.string('_id').primary()
    table.string('displayName')
  })

  .createTable('PersonAlias', function (table) {
    table.string('personId')
    table.string('alias')
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
