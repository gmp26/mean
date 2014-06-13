MongoClient = require('mongodb').MongoClient

MongoClient.connect 'mongodb://localhost:27017/foo-dev', (err, db) ->
  if err
    console.dir err
    return

  console.log 'connected'

  db.createCollection 'test',  (err, collection) ->

    if err
      console.dir err
      return

    doc = 
      user: 'Mike'
      role: 'admin'

    collection.insert doc, {w:1}, (err, result) ->
      if err
        console.log "error on write"
        console.dir err
        return

      console.log "result"
      console.dir result

    console.log 'end'

  console.log 'the real end'

console.log 'the real real end'