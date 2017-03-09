#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const format = require('util').format;
const getIndexes = require('./lib/getIndexes');

if (process.argv.length !== 4) {
	printUsage();
}

getIndexes(process.argv[2], function (err, indexes) {
	if (err) {
		console.error(err);
		process.exit(1);
	}

	const template = fs.readFileSync(path.join(__dirname, 'template.js'), 'utf-8');
	const ensureIndexes = indexes.map((index) => {
		return format(
			'//%s\ncreateIndex(\n\t%s,\n%s,\n%s\n).catch(console.error);',
			index.options.name,
			JSON.stringify(index.collectionName),
			JSON.stringify(index.spec, null, '\t').replace(/^(.)/gm, '\t$1'),
			JSON.stringify(index.options, null, '\t').replace(/^(.)/gm, '\t$1')
		).replace(/^(.)/gm, '\t$1').replace(/"/gm, '\'');
	});
	const output = template.replace('//ENSURE_INDEXES//', ensureIndexes.join('\n\n'));

	fs.writeFileSync(path.resolve(process.argv[3]), output, 'utf-8');

	process.exit(0);
});


function printUsage() {
	console.log('USAGE: mongoindex [mongo_connection_string] [ensure_index_output_file]');
	process.exit(1);
}