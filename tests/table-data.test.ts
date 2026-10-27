import { strict as assert } from "node:assert"
import {
  compareCells,
  filterError,
  matchesFilter,
  parseJson,
  toCsv,
  type Filter,
} from "../src/lib/table-data"

const data = parseJson(
  '[{"name":"Ayu","profile":{"city":"Bandung"},"active":true,"score":12},{"name":"Bima","score":2,"tags":["a","b"]}]'
)
assert.deepEqual(data.columns, [
  "name",
  "profile.city",
  "active",
  "score",
  "tags",
])
assert.equal(data.rows[0]["profile.city"], "Bandung")
assert.equal(data.rows[1].tags, '["a","b"]')
assert.equal(parseJson('{"data":[{"id":1}]}').rows[0].id, 1)
assert.equal(
  parseJson('{"first":[{"id":1}],"second":[{"id":2}]}', "second").rows[0].id,
  2
)
assert.equal(
  parseJson('{"__proto__":"safe","a.b":1,"a":{"b":2}}').rows[0]["__proto__"],
  "safe"
)
assert.equal(parseJson('{"a.b":1,"a":{"b":2}}').columns.length, 2)
assert.equal(parseJson("[]").rows.length, 0)
for (const input of ["", "null", "[1]", '{"":1}', "{bad}"])
  assert.throws(() => parseJson(input))
assert.throws(() =>
  parseJson(JSON.stringify(Array.from({ length: 20_001 }, () => ({}))))
)

const filter: Filter = {
  id: 1,
  column: "score",
  operator: "gt",
  value: "10",
  upper: "20",
}
assert.equal(matchesFilter(data.rows[0], filter), true)
assert.equal(matchesFilter(data.rows[1], filter), false)
assert.equal(matchesFilter({ score: null }, { ...filter, value: "-1" }), false)
assert.equal(matchesFilter({ score: false }, { ...filter, value: "-1" }), false)
assert.equal(
  matchesFilter(data.rows[0], { ...filter, operator: "between" }),
  true
)
assert.ok(filterError({ ...filter, value: "" }))
assert.ok(filterError({ ...filter, operator: "between", upper: "2" }))
assert.equal(
  matchesFilter(data.rows[0], {
    ...filter,
    column: "name",
    operator: "contains",
    value: "AY",
  }),
  true
)
assert.equal(
  matchesFilter(data.rows[1], {
    ...filter,
    column: "active",
    operator: "empty",
  }),
  true
)
assert.equal(
  matchesFilter(data.rows[0], {
    ...filter,
    column: "active",
    operator: "equals",
    value: "true",
  }),
  true
)
assert.ok(compareCells(2, 12) < 0)
assert.ok(compareCells("item2", "item12") < 0)
const csv = toCsv(
  [{ name: '=HYPERLINK("bad")', ignored: "secret" }, { name: "a,\nb" }],
  ["name"]
)
assert.ok(csv.includes("'=HYPERLINK"))
assert.ok(csv.includes('"a,\nb"'))
assert.ok(!csv.includes("secret"))
assert.ok(toCsv([{ name: "\t=1" }], ["name"]).includes("'\t=1"))
console.log("table-data: all checks passed")
