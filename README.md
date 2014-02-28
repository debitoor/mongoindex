mongoindex
===========

Generare ensureIndex statements based on indexes read from a MongoDB database.

Use it for copying indexes from one db to another. From production to development/staging for example.

installation
------------

```
$ npm install -g mongoindex
```

usage
-----
```
$ mongoindex [mongo_connection_string] [ensure_index_output_file]
```

examples
-------

Generate ensureIndexes.js script from database called `development`on local machine
```
$ mongoindex development ensureIndexes.js
```

Generate ensureIndexes.js script form remote database with auth
```
$ mongoindex mongodb://user:password@mymongserver.com:10022/mydatabase ensureIndexes.js
```

See more about (mongo connectionstrings)[https://www.google.dk/search?q=mongodeb+connectionstring]

running the ensureIndexes.js file generated
-------------------------------------------
You need to actually run the ensureIndexes.js file generated programatically.

You need to pass in a reference to an open Db object from mongodb (needs to have .ensureIndex method):

```js
var mongodb = require('mongodb');
(new mongodb.MongoClient()).connect('mongodb://127.0.0.1/mydb', function(err, db){
	require('./ensureIndexes.js')(db);
};
```