'use strict';

const express = require('express');

const accountsRouter = require('./account/router.js');
const staticMiddleware = require('./static.js');
const letsencryptAcmeRouter = require('./letsencrypt_acme_router.js');

const server = express();

/**
 * A koa server instance, composed of routers and middleware
 */
server
  .use(accountsRouter.routes())
  .use(accountsRouter.allowedMethods())
  .use(staticMiddleware)
  .use(letsencryptAcmeRouter.routes())
  .use(letsencryptAcmeRouter.allowedMethods())
  ;

module.exports = server;
