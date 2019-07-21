'use strict';
// monkii is a fork from monk
const monkii = require('monkii');
// to make them generator friendly
const coMonk = require('co-monk');

const config = require('../config/config');
// connect to MongoDB
let db = monkii(config.database.url);

let tables = {};

/**
 * Tables do not need to be created in order to be used.
 *
 * @param  {String} entityName The name of the entity table
 * @return {CoMonkTable} a MongoDb table that has been wrapped using `co-monk`
 */
function getEntityTable(entityName) {
  let entityTable = tables[entityName];
  if (!entityTable) {
    entityTable = coMonk(db.get(entityName));
    tables[entityName] = entityTable;
  }
  return entityTable;
}

module.exports = {
  db,
  getEntityTable,
};
