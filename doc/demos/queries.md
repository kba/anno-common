# Demo for queries

> This demo exposes the interface of the [Anno.Queries](modules/queries) API.

## Demo

<select id="fixture" onchange="loadFixture()"></select>
<a id="load-fixture" onclick='loadFixture()'>Load Fixture</a>

<textarea class="codemirror" id="input" rows=10 cols=40></textarea>

<select id="type"></select>
<select id="method">
  <option>first</option>
  <option>all</option>
  <option>numberOf</option>
</select>
<a id="validate" onclick="query()">Query</a>

<textarea class="codemirror" readonly id="result" rows=10 cols=40></textarea>

## Help

It loads the fixtures of the [Web Platform Tests for the Web Annotation
Protocol](https://github.com/w3c/web-platform-tests/tree/master/annotation-protocol/files/annotations)
via the [Anno.Fixtures](modules/fixtures) module.

Choose an annotation or write/paste your own in the textarea.

Then select a query type and choose whether to return the first, all or the
count of return values.

## HTML

See markdown source

## Javascript

See [/assets/js/queries.js](/assets/js/queries.js) for full source

```js
function query() {
    const input = inputField.editor.getDoc().getValue()
    const anno = JSON.parse(input)
    const queryClass = queryClassList.value
    const method = methodList.value
    const result = Anno.Queries[queryClass][method](anno)
    resultField.innerHTML = JSON.stringify(result, null, 2)
}
```


<script src="../../assets/js/queries.js"></script>
