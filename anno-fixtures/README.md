# anno-fixtures

> Sample data for testing and experimentation

In addition to data stored [in this repository](.), samples from the
`annotation-model` tests in the [web platform
tests](https://github.com/w3c/web-platform-tests/) are fetched.

## Makefile

<!-- BEGIN-EVAL echo '```'; make help ; echo '```' -->
```

  Targets

    fixtures     Download assets from web-platform-tests
    index.json  Create one big JSON file

  Variables

    TEMPDIR     Directory for temporary data. Default: ../temp
```
<!-- END-EVAL -->
