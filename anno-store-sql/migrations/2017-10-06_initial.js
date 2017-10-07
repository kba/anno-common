exports.up = function (knex) {
  return knex.schema

    .createTable('Annotation', function (table) {
      table.string('_id').primary()
      table.string('via')
    })

    .createTable('AnnotationType', function (table) {
      table.increments('_id').primary()
      table.string('ofAnnotationId').references('_id').inTable('Annotation')
      table.string('type')
    })

    .createTable('AnnotationTarget', function (table) {
      table.string('ofAnnotationId').references('_id').inTable('Annotation')
    })

    .createTable('AnnotationTextualBody', function (table) {
      table.string('ofAnnotationId').references('_id').inTable('Annotation')
    })

    .createTable('AnnotationRevision', function (table) {
      table.increments('_id').primary()
      table.string('title')
      table.string('name')
      table.string('ofAnnotationId').references('_id').inTable('Annotation')
      table.string('creatorId').references('_id').inTable('Person')
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
