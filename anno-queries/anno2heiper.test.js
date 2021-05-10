const tap = require('tap')
const {anno2heiper} = require('./anno2heiper')

const doiTestAnno1 = {
    "id": "https://anno.ub.uni-heidelberg.de/anno/anno/B-iAh2rbRw-jkvpqWk8D1w",
    "type": "Annotation",
    "hasVersion": [
      {
        "versionOf": "https://anno.ub.uni-heidelberg.de/anno/anno/B-iAh2rbRw-jkvpqWk8D1w",
        "id": "https://anno.ub.uni-heidelberg.de/anno/anno/B-iAh2rbRw-jkvpqWk8D1w~1",
        "type": "Annotation",
        "title": "Zur Altarkammer des Hochaltars im Münster U.L.F. von Radolfzell",
        "collection": "diglit",
        "body": [
          {
            "type": "TextualBody",
            "format": "text/html",
            "value": "Test"
          },
          {
            "purpose": "classifying",
            "source": "http://d-nb.info/gnd/66681-6",
            "value": "radolfzell unserer",
            "label": "Pfarrei Unserer Lieben Frau (Radolfzell am Bodensee)"
          },
          {
            "purpose": "classifying",
            "source": "http://d-nb.info/gnd/4177750-5",
            "value": "reliquiar",
            "label": "Reliquiar"
          },
          {
            "purpose": "classifying",
            "source": "http://d-nb.info/gnd/4160081-2",
            "value": "hochaltar",
            "label": "Hochaltar"
          }
        ],
        "target": "http://digi.ub.uni-heidelberg.de/diglit/braun1924bd1/0228",
        "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
        "creator": {
          "displayName": "Sebastian Bock"
        },
        "created": "2018-05-27T10:24:49.376Z"
      },
      {
        "versionOf": "https://anno.ub.uni-heidelberg.de/anno/anno/B-iAh2rbRw-jkvpqWk8D1w",
        "id": "https://anno.ub.uni-heidelberg.de/anno/anno/B-iAh2rbRw-jkvpqWk8D1w~2",
        "type": "Annotation",
        "title": "Zur Altarkammer des Hochaltars im Münster U.L.F. von Radolfzell",
        "collection": "diglit",
        "body": [
          {
            "type": "TextualBody",
            "format": "text/html",
            "value": "Test"
          },
          {
            "purpose": "classifying",
            "source": "http://d-nb.info/gnd/66681-6",
            "value": "radolfzell unserer",
            "label": "Pfarrei Unserer Lieben Frau (Radolfzell am Bodensee)"
          },
          {
            "purpose": "classifying",
            "source": "http://d-nb.info/gnd/4177750-5",
            "value": "reliquiar",
            "label": "Reliquiar"
          },
          {
            "purpose": "classifying",
            "source": "http://d-nb.info/gnd/4160081-2",
            "value": "hochaltar",
            "label": "Hochaltar"
          }
        ],
        "target": "http://digi.ub.uni-heidelberg.de/diglit/braun1924bd1/0228",
        "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
        "created": "2018-05-27T10:27:11.470Z",
        "via": "https://anno.ub.uni-heidelberg.de/anno/anno/B-iAh2rbRw-jkvpqWk8D1w"
      },
      {
        "versionOf": "https://anno.ub.uni-heidelberg.de/anno/anno/B-iAh2rbRw-jkvpqWk8D1w",
        "id": "https://anno.ub.uni-heidelberg.de/anno/anno/B-iAh2rbRw-jkvpqWk8D1w~3",
        "type": "Annotation",
        "title": "Zur Altarkammer des Hochaltars im Münster U.L.F. von Radolfzell",
        "collection": "diglit",
        "body": [
          {
            "type": "TextualBody",
            "format": "text/html",
            "value": "Test"
          },
          {
            "purpose": "classifying",
            "source": "http://d-nb.info/gnd/4177750-5",
            "value": "reliquiar",
            "label": "Reliquiar"
          },
          {
            "purpose": "classifying",
            "source": "http://d-nb.info/gnd/4160081-2",
            "value": "hochaltar",
            "label": "Hochaltar"
          },
          {
            "purpose": "classifying",
            "source": "http://d-nb.info/gnd/4369095-6",
            "value": "mariä himmelfahrt rad",
            "label": "Mariä Himmelfahrt (Radolfzell am Bodensee)"
          }
        ],
        "target": "http://digi.ub.uni-heidelberg.de/diglit/braun1924bd1/0228",
        "rights": "https://creativecommons.org/publicdomain/zero/1.0/",
        "created": "2018-05-27T10:30:57.903Z",
        "via": "https://anno.ub.uni-heidelberg.de/anno/anno/B-iAh2rbRw-jkvpqWk8D1w"
      },
      {
        "versionOf": "https://anno.ub.uni-heidelberg.de/anno/anno/B-iAh2rbRw-jkvpqWk8D1w",
        "id": "https://anno.ub.uni-heidelberg.de/anno/anno/B-iAh2rbRw-jkvpqWk8D1w~4",
        "type": "Annotation",
        "title": "Zur Altarkammer des Hochaltars im Münster U.L.F. von Radolfzell",
        "collection": "diglit",
        "body": [
          {
            "type": "TextualBody",
            "format": "text/html",
            "value": "Test"
          },
          {
            "purpose": "classifying",
            "source": "http://d-nb.info/gnd/4177750-5",
            "value": "reliquiar",
            "label": "Reliquiar"
          },
          {
            "purpose": "classifying",
            "source": "http://d-nb.info/gnd/4160081-2",
            "value": "hochaltar",
            "label": "Hochaltar"
          },
          {
            "purpose": "classifying",
            "source": "http://d-nb.info/gnd/4369095-6",
            "value": "mariä himmelfahrt rad",
            "label": "Mariä Himmelfahrt (Radolfzell am Bodensee)"
          }
        ],
        "target": "http://digi.ub.uni-heidelberg.de/diglit/braun1924bd1/0228",
        "rights": "https://creativecommons.org/licenses/by/4.0/",
        "created": "2018-05-29T06:44:31.067Z",
        "via": "https://anno.ub.uni-heidelberg.de/anno/anno/B-iAh2rbRw-jkvpqWk8D1w"
      }
    ],
    "body": [
      {
        "type": "TextualBody",
        "format": "text/html",
        "value": "Test"
      },
      {
        "purpose": "classifying",
        "source": "http://d-nb.info/gnd/4177750-5",
        "value": "reliquiar",
        "label": "Reliquiar"
      },
      {
        "purpose": "classifying",
        "source": "http://d-nb.info/gnd/4160081-2",
        "value": "hochaltar",
        "label": "Hochaltar"
      },
      {
        "purpose": "classifying",
        "source": "http://d-nb.info/gnd/4369095-6",
        "value": "mariä himmelfahrt rad",
        "label": "Mariä Himmelfahrt (Radolfzell am Bodensee)"
      }
    ],
    "collection": "diglit",
    "created": "2018-05-27T10:24:49.376Z",
    "creator": {
      "displayName": "Sebastian Bock"
    },
    "modified": "2018-05-29T06:44:31.067Z",
    "rights": "https://creativecommons.org/licenses/by/4.0/",
    "target": "http://digi.ub.uni-heidelberg.de/diglit/braun1924bd1/0228",
    "title": "Zur Altarkammer des Hochaltars im Münster U.L.F. von Radolfzell",
    "via": "https://anno.ub.uni-heidelberg.de/anno/anno/B-iAh2rbRw-jkvpqWk8D1w"
}


tap.test('anno2heiper revisions', t => {
    const {heiperJson, anno} = anno2heiper(doiTestAnno1, '10.1001/test.{{ unversioned }}{{ revision }}')    
    t.equals(heiperJson[0].doi, '10.1001/test.B-iAh2rbRw-jkvpqWk8D1w')
    t.equals(heiperJson[1].doi, '10.1001/test.B-iAh2rbRw-jkvpqWk8D1w_1')
    t.equals(heiperJson[2].doi, '10.1001/test.B-iAh2rbRw-jkvpqWk8D1w_2')
    t.equals(heiperJson[3].doi, '10.1001/test.B-iAh2rbRw-jkvpqWk8D1w_3')
    t.equals(heiperJson[4].doi, '10.1001/test.B-iAh2rbRw-jkvpqWk8D1w_4')
    t.end()
})

tap.test('anno2heiper fullid', t => {
    const {heiperJson, anno} = anno2heiper(doiTestAnno1, '10.1001/test.{{ fullid }}')
    t.equals(heiperJson[0].date, doiTestAnno1.modified)
    t.equals(heiperJson[0].doi, '10.1001/test.B-iAh2rbRw-jkvpqWk8D1w')
    t.equals(heiperJson[1].doi, '10.1001/test.B-iAh2rbRw-jkvpqWk8D1w~1')
    t.equals(heiperJson[2].doi, '10.1001/test.B-iAh2rbRw-jkvpqWk8D1w~2')
    t.equals(heiperJson[3].doi, '10.1001/test.B-iAh2rbRw-jkvpqWk8D1w~3')
    t.equals(heiperJson[4].doi, '10.1001/test.B-iAh2rbRw-jkvpqWk8D1w~4')
    t.end()
})
