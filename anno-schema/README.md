# anno-schema

[**DEMO**](https://kba.github.io/anno/validator.html)

## Development

The sources are kept as YAML and transformed to JSON before publishing/linking.

* Adapt `./data-model.yml` / `./context.yml`
* Regenerate the JSON by either
  * `node ./scripts/prepublish.js` (in `anno-schema`)
  * `npm run prepublish` (in `anno-schema`)
  * `lerna bootstrap` (anywhere in or below root folder)
* Make sure the tests pass
  * `make test:schema` (in root folder)
  * `npm test` (in `anno-schema`)
