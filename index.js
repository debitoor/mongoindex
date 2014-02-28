#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var format = require('util').format;
var getIndexes = require('./lib/getIndexes');

if (process.argv.length !== 4) {
	printUsage();
}

getIndexes(process.argv[2], function (err, indexes) {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	var template = fs.readFileSync(path.join(__dirname, 'template.js'), 'utf-8');
	var ensureIndexes = indexes.map(function(index){
		return format(
			'//%s\ndb.ensureIndex(%s,%s,%s, function(err){ if(err){ console.error(err); }});',
			index.options.name,
			JSON.stringify(index.collectionName),
			JSON.stringify(index.spec, null, '\t'),
			JSON.stringify(index.options, null, '\t')
		).replace(/^(.)/gm, '\t$1');
	});
	var output = template.replace('//ENSURE_INDEXES//', ensureIndexes.join('\n\n'));
	fs.writeFileSync(path.resolve(process.argv[3]), output, 'utf-8');
	process.exit(0);
});


function printUsage() {
	console.log("USAGE: mongoindex [mongo_connection_string] [ensure_index_output_file]");
	process.exit();
}