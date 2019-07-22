'use strict';

const fs = require('fs');
const path = require('path');

const express = require('express');

/**
 * The Let's Encrypt Acme Router is responsible for
 * responding to "well known ACME challenges"
 * issued by the Let's Encrypt certificate authority server.
 *
 * This is necessary for the certificate authority to
 * verify that this server owns the previous certificate,
 * which is a prerequsite to issuign this server
 * with the next (renewed) certificate.
 *
 * This works by by the Let's Enrypt client
 * placing a hash in a file within the specified directory,
 * and this server simply responding to a request for that hash
 * at a particular path, as proof of ownership of the
 * current certificate
 *
 * @type {Function} terminating koa middleware
 */
const router = express.Router();

router.get('/.well-known/acme-challenge/:challengeHash', getWellKnownAcmeChallengeRoute);

function* getWellKnownAcmeChallengeRoute(req, res, next) {
  try {
    let key = req.params.challengeHash;
    let val = yield getAcmeChallengeData(key);
    res.type = 'text/plain';
    res.body = `${val}`;
    res.status = 200;
  }
  catch (ex) {
    console.error(`Error: ${ex}`);
    console.error(ex.stack);
    res.body = {
      error: 'Failed to obtain challenge hash',
    };
    res.Status = 500;
  }
  next();
}

function getAcmeChallengeData(key) {
  return new Promise((resolve, reject) => {
    let challengeFilePath =
      path.resolve(
        process.cwd(),
        `.private/certs/webroot/.well-known/acme-challenge/${key}`);
    fs.readFile(challengeFilePath, 'utf8', (err, data) => {
      if (!!err || !data) {
        return reject(`No challenge for key ${key}`);
      }
      val = data.toString();
      return resolve(val);
    });
  });
}

module.exports = router;
