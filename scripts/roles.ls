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

    collection.insert doc
    console.log 'Mike written'
