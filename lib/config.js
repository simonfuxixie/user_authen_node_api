'use strict';

let lodashDefaults = require('lodash/defaults.js');

/**
 * Uses a default configuration,
 * modified with a custom configuration (if present)
 * found in `/.private/config.js`,
 * and if run via a test runner further modified
 * with a test config found in `/.private/test-config.js`
 */

let customConfig = undefined;
try {
  customConfig = require('../.private/config.js');
}
catch (ex) {
  console.log('Error reading custom config', ex);
  customConfig = {};
}

let testConfig = undefined;
if (typeof global.describe === 'function') {
  // Currently running tests, so override using test options where appropriate
  try {
    testConfig = require('../test/config.js');
  }
  catch (ex) {
    console.log('Error reading test config, using default', ex);
    testConfig = {};
  }
}

let defaultConfig = {
  account: {
    password: {
      minimumLength: 6,
    },
    email: {
      validate: function defaultValidateEmail(input) {
        // very loose validation
        return !!( /^\S+@\S+\.\S+$/ ).test(input);
      },
    },
    rego: {
      pendingExpiry: 24*60*60*1000,
    },
  },
  auth: {
    confirmCode: {
      length: 32,
    },
    key: {
      alg: 'pbkdf2',
      iter: 1200,
      len: 128,
    },
  },
  token: {
    expiry: 24*60*60*1000,
    secret: 'Super-Secure-Secret-yeah!-168@',
    algorithm: 'HS256',
  },
  payments: {
    stripeApiKeyPrivate: 'sk_test_111111111111111111111111',
    stripeApiKeyPublic: 'pk_test_222222222222222222222222',
  },
  database: {
    engine: 'mongodb',
    url: 'localhost/okaccounts',
  },
};

let config = {};
// _.defaults(object, [sources])
// _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
// => { 'a': 1, 'b': 2 }
lodashDefaults(config, testConfig, customConfig, defaultConfig);

module.exports = config;
