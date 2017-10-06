exports.up = function (knex) {
  return knex.schema

    .createTable('AnnotationCollection', function (table) {
      table.string('id').primary()
      table.string('name')
      table.string('secret')
    })

    .createTable('Annotation', function (table) {
      table.string('id').primary()
    })

    .createTable('AnnotationRevision', function (table) {
      table.increments('id').primary()
      table.string('title')
      table.string('name')
      table.string('ofAnnotationId').references('id').inTable('Annotation')
      table.string('creatorId').references('id').inTable('Person')
    })

    .createTable('Person', function (table) {
      table.string('id').primary()
      table.string('displayName')
    })

    .createTable('PersonAlias', function (table) {
      table.string('personId')
      table.string('alias')
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
