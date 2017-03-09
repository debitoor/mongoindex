const MongoClient = require('mongodb').MongoClient;
const getIndexes = require('../lib/getIndexes');

const connectionString = 'mongodb://127.0.0.1/mongoindex_test';

describe('using test database', function () {
	let db;

	before((done) =>
		(new MongoClient()).connect(connectionString)
			.then((_db) => db = _db)
			.then((db) => db.dropDatabase(done))
			.catch(done)
	);

	after((done) => db.dropDatabase(done));

	describe('adding id_test collection', () => {

		before((done) => db.createCollection('id_test', done));

		describe('getting indexes', () => {
			let indexes;

			beforeGetIndexes((_indexes) => indexes = _indexes);

			it('should not get the _id index', () => expect(indexes).to.eql([]));

			const tests = [
				{
					spec: {
						test: 1
					}
				},
				{
					spec: {
						one: 1,
						two: 1
					}
				},
				{
					spec: {
						one: -1,
						two: 1
					}
				},
				{
					spec: {
						one: -1,
						two: 1
					},
					options: {
						unique: true
					}
				},
				{
					spec: {
						one: -1,
						two: 1
					},
					options: {
						unique: true
					}
				},
				{
					spec: {
						one: -1,
						two: 1
					},
					options: {
						unique: true,
						min: 10
					}
				},
				{
					spec: {
						one: -1,
						two: 1
					},
					options: {
						unique: true,
						min: 10,
						max: 11
					}
				},
				{
					spec: {
						one: -1,
						two: 1
					},
					options: {
						unique: true,
						min: 10,
						max: 11,
						sparse: true
					}
				},
				{
					spec: {
						one: -1,
						two: 1
					},
					options: {
						unique: true,
						expireAfterSeconds: 10
					}
				}
			].map((test, index) => {
				test.options = test.options || {};
				test.options.name = test.options.name || 'index_test_' + index;
				test.options.v = test.options.v || 1;
				test.collectionName = 'test_' + index;
				return test;
			});

			tests.forEach((test) => {
				describe('ensuring index: ' + JSON.stringify(test), function () {

					before((done) =>
						db.collection(test.collectionName).createIndex(test.spec, test.options, done)
					);

					after((done) =>
						db.collection(test.collectionName).dropIndex(test.options.name, done)
					);

					describe('getting indexes', () => {
						let indexes;

						beforeGetIndexes((_indexes) => indexes = _indexes);

						it('returns the exact same result as used in ensureIndex', () =>
							expect(indexes[0]).to.eql(test)
						);
					});
				});
			});
		});
	});
});


function beforeGetIndexes(callback) {
	let indexes;

	before((done) =>
		getIndexes(connectionString, function (err, indexesReturned) {
			if (err) {
				return done(err);
			}
			indexes = indexesReturned;
			return done();
		})
	);

	before(() => callback(indexes));
}
