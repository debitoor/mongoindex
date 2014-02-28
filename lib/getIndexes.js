var format = require('util').format;
var deepEqual = require('deep-equal');
var mongodb = require('mongodb');

module.exports = function getIndexes(connectionString, callback) {
	connectionString = normalizeConnectionString(connectionString);
	(new mongodb.MongoClient()).connect(connectionString, function (err, db) {
		if (err) {
			return callback(new Error(
				format('ERROR: Could not connect to %s., %s', connectionString, err)
			));
		}
		db.collection('system.indexes', function (err, indexesCollection) {
			if (err) {
				return callback(new Error(
					format('ERROR: Could not open system.indexes, %s', err)
				));
			}
			indexesCollection.find({}).toArray(function (err, indexes) {
				if (err) {
					return callback(new Error(
						format('ERROR: Could not .find() system.indexes, %s', err)
					));
				}
				var mappedIndexes = indexes
					.filter(function (index) {
						return !deepEqual(index.key, {_id: 1}); //ignore _id only indexes
					})
					.map(function (index) {
						var options = JSON.parse(JSON.stringify(index));
						delete options.key;
						delete options.ns;
						return {
							spec: index.key,
							options: options,
							collectionName: index.ns.substr(index.ns.indexOf('.') + 1)
						};
					});
				return callback(null, mappedIndexes);
			});

		});
	});
};

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