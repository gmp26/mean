pmongo = require 'promised-mongo'

db = pmongo 'foo-dev'

test = db.collection 'test'

foo =test.find({role:'admin'})
.toArray!
.then (docs) ->
  for doc in docs
    console.dir doc

foo.done (d) ->
  console.log 'left'
  console.dir d.0
  db.close!
, (err) ->
  console.log 'right ' + err
  db.close!
  process.exit 1
