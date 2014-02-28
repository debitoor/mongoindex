var mongodb = require('mongodb');
var getIndexes = require('../lib/getIndexes');

var connectionString = 'mongodb://127.0.0.1/mongoindex_test';

describe('using test database', function () {
	var db;
	before(function (done) {
		return (new mongodb.MongoClient()).connect(connectionString, function (err, dbReturned) {
			if (err) {
				done(err);
			}
			db = dbReturned;
			db.dropDatabase(done);
		});
	});

	after(function (done) {
		db.dropDatabase(done);
	});

	describe('adding id_test collection', function () {
		before(function (done) {
			db.createCollection('id_test', done);
		});

		describe('getting indexes', function () {
			var indexes;

			get();

			function get() {
				before(function (done) {
					return getIndexes(connectionString, function (err, indexesReturned) {
						if (err) {
							return done(err);
						}
						indexes = indexesReturned;
						return done();
					});
				});
			}

			it('should not get the _id index', function () {
				expect(indexes).to.eql([]);
			});

			var tests = [
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
					options:{
						unique: true
					}
				},
				{
					spec: {
						one: -1,
						two: 1
					},
					options:{
						unique: true,
						dropDups: true
					}
				},
				{
					spec: {
						one: -1,
						two: 1
					},
					options:{
						unique: true,
						dropDups: true,
						min: 10
					}
				},
				{
					spec: {
						one: -1,
						two: 1
					},
					options:{
						unique: true,
						dropDups: true,
						min: 10,
						max: 11
					}
				},
				{
					spec: {
						one: -1,
						two: 1
					},
					options:{
						unique: true,
						dropDups: true,
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
					options:{
						unique: true,
						dropDups: true,
						expireAfterSeconds: 10
					}
				}
			];

			tests = tests
				.map(function (test, index) {
					test.options = test.options || {};
					test.options.name = test.options.name || 'index_test_' + index;
					test.options.v = test.options.v || 1;
					test.collectionName = 'test_' + index;
					return test;
				});

			tests.forEach(function(test){
				describe('ensuring index: ' + JSON.stringify(test), function () {

					before(function (done) {
						db.ensureIndex(test.collectionName, test.spec, test.options, done);
					});

					after(function (done) {
						db.dropIndex(test.collectionName, test.options.name, done);
					});

					describe('getting indexes', function () {
						get();

						it('returns the exact same result as used in ensureIndex', function(){
							expect(indexes[0]).to.eql(test);
						});
					});

				});

			});
		});
	});
});