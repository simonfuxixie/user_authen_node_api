'use strict';
// load jwt package
let jwtSimple = require('jwt-simple');
// load time package
let moment = require('moment');
// load config
let config = require('../config/config.js');
// export module, put methods in an object
module.exports = {
  create,
  verify,
};

/**
 * Constructs a JSON web token
 * This JWT can only be decoded and therefore verified by this server -
 * must know the token secret, so keep it safe
 *
 * Options:
 *
 * - subject (compulsory)
 * - issuedAt (always overwritten)
 * - expiry (always overwritten)
 * - issuer (optional)
 * - issuer (optional)
 * - audience (optional)
 * - notBefore (optional)
 * - jwtId (optional)
 *
 * See http://jwt.io/
 * See http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html
 *
 * @param  {Object}   options  See description above
 * @param  {Function} callback Standard errback
 */
function create(options, callback) {
   // return a Promise
  return new Promise(function (resolve, reject) {
	  // check params
    if (typeof options.subject !== 'string') {
	     // callback(err);
      callback('subject must be set');
      return;
    }
    // Subject
    let sub = options.subject;
    // Issued At, create UTC timestamp via moment.utc(), iat is an object
    let iat = moment.utc();
    // Expiry, exp is an object
    let exp = iat.clone().add(config.token.expiry, 'ms');
	// payload
    let criteria = {
      sub,
      iat: iat.valueOf(),
      exp: exp.valueOf(),
      nbf: options.notBefore || undefined,
      iss: options.issuer || undefined,
      aud: options.audience || undefined,
      jti: options.jwtId || undefined,
    };
	  // sign payload with secret by using specific algorithm
  	async function outputToken() {
  		let outputToken01 = await jwtSimple.encode(criteria, config.token.secret, config.token.algorithm);
  		resolve(outputToken01);
  	}
  	outputToken();
  });
}

/**
 * Decodes and verifies a JSON web token
 * using the secret (hopefully) known only to this server,
 * so keep it safe!
 *
 * Ensures that inputToken can:
 *
 * - be decoded using this server's secret
 * - once decoded matches several criteria
 *   - must have a subject
 *   - must not be expired
 *   - must be after it becomes valid
 * - optionally, checked when specified in criteria
 *   - audience must be amongst the specified ones
 *   - issuer must be amongst the specified ones
 *
 * @param  {String}   inputToken A JSON web token that has been
 *     encoded and serialised to a string
 * @param  {Object}   criteria   If the JSON web token decodes successfully,
 *     it must also pass any criteria required here
 * @param  {Function} callback   Standard errback
 */
function verify(inputToken, criteria) {
  // return a Promise
  return new Promise(function (resolve, reject) {
    criteria = criteria || {};
    // Return an object with more user-friendly key names,
    // and consistent with the `inputToken` expected by `verify()`
  	async function outputToken(){
  		let outputToken01 = await jwtSimple.decode(inputToken, config.token.secret);
  		// Always on criterion: subject (presence)
  		if (!outputToken01.sub) {
  			return reject('Invalid token: subject missing');
  		}
  		// Always-on criterion: expiry (current time)
  		if (!outputToken01.exp) {
  			return reject('Invalid token: expiry missing');
  		}
  		// check expiry
  		if (outputToken01.exp < moment.utc().valueOf()) {
  			return reject('Invalid token: expired');
  		}
  		// Always-on criterion: not before (current time)
  		if (!!outputToken01.nbf && outputToken01.nbf >= moment.utc.valueOf()) {
  			return reject('Invalid token: not yet valid');
  		}
  		// Optional criterion: audiences (list of permitted)
  		if (!!criteria.audiences && criteria.audiences.indexOf(outputToken01.aud) < 0) {
  			return reject('Invalid token: audience mismatch');
  		}
  		// Optional criterion: issuers (list of permitted)
  		if (!!criteria.issuers && criteria.issuers.indexOf(outputToken01.iss) < 0)  {
  			return reject('Invalid token: issuer mismatch');
  		}
  		// resolve
  		resolve({
          subject: outputToken01.sub,
          issuedAt: outputToken01.iat,
          expiry: outputToken01.exp,
          notBefore: outputToken01.nbf,
          issuer: outputToken01.iss,
          audience: outputToken01.aud,
          jwtId: outputToken01.jti,
  		});
  	}

  });
}
