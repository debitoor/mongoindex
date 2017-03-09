const format = require('util').format;
const deepEqual = require('deep-equal');
const MongoClient = require('mongodb').MongoClient;

module.exports = getIndexes;

function getIndexes(connectionString, callback) {
	connectionString = normalizeConnectionString(connectionString);

	(new MongoClient())
		.connect(connectionString)
		.then((db) => db.collections())
		.then((collections) =>
			Promise
				.all(collections.map((collection) => collection.listIndexes().toArray()))
				.then((arrays) => Array.prototype.concat.apply([], arrays))
		)
		.then((indexes) => {
			const mappedIndexes = indexes
				.filter((index) => !deepEqual(index.key, {_id: 1})) //ignore _id only indexes
				.map((index) => {
					const options = JSON.parse(JSON.stringify(index));

					delete options.key;
					delete options.ns;
					return {
						spec: index.key,
						options,
						collectionName: index.ns.substr(index.ns.indexOf('.') + 1)
					};
				});
			return callback(null, mappedIndexes);
		})
		.catch((err) =>
			callback(new Error(format('ERROR: %s., %s', connectionString, err)))
		);
}

function normalizeConnectionString(cs) {
	cs = cs.replace(/^\//, '');
	if (cs.indexOf('/') < 0) {
		return normalizeConnectionString('127.0.0.1/' + cs);
	}
	if (cs.indexOf('mongodb://') !== 0) {
		return normalizeConnectionString('mongodb://' + cs);
	}
	return cs;
}