'use strict';
// load co package
const co = require('co');
// load email module
const email = require('../lib/email.js');

// test
describe('test module [email]', () => {

  it('should not allow email when "to" is missing', () => {
    co(function* () {
      let err;
      try {
        let msg = yield email.prepare({
          subject: 'hello',
          // to: 'foo@bar.com',
          from: 'baz@bar.com',
          text: 'hello there!',
        });
      }
      catch (error) {
        err = error;
      }
      expect(err).toEqual('Must provide a to');
    });
  });

  it('should allow email when "from" is missing (uses default from config)', function() {
    co(function* () {
      let err;
      try {
        let msg = yield email.prepare({
          subject: 'hello',
          to: 'foo@bar.com',
          // from: 'baz@bar.com',
          text: 'hello there!',
        });
        expect(typeof msg).toBe('object');
        expect(typeof msg.from).toBe('string');
      }
      catch (error) {
        err = error;
      }
      expect(err).toBeUndefined();
    });
  });

  it('should not allow email when "subject" is missing', () => {
    co(function* () {
      let err;
      try {
        let msg = yield email.prepare({
          // subject: 'hello',
          to: 'foo@bar.com',
          from: 'baz@bar.com',
          text: 'hello there!',
        });
      }
      catch (error) {
        err = error;
      }
      expect(err).toEqual('Must provide a subject');
    });
  });

  it('should not allow email when "text" is missing (and no html specified)', () => {
    co(function * () {
      let err;
      try {
        let msg = yield email.prepare({
          subject: 'hello',
          to: 'foo@bar.com',
          from: 'baz@bar.com',
          // text: 'hello there!',
        });
      }
      catch (error) {
        err = error;
      }
      expect(err).toEqual('Must provide text, or html that can be converted to text');
    });
  });

  it('should allow email when all fields present (text without html)', () => {
    co(function* () {
      let err, msg;
      try {
        msg = yield email.prepare({
          subject: 'hello',
          to: 'foo@bar.com',
          from: 'baz@bar.com',
          text: 'hello there!',
        });
      }
      catch (error) {
        err = error;
      }
      expect(err).to.be.undefined;
      expect(msg).to.be.an('object');
    });
  });

  it('should allow email when all fields present (html without text)', () => {
    co(function* () {
      let err, msg;
      try {
        msg = yield email.prepare({
          subject: 'hello',
          to: 'foo@bar.com',
          from: 'baz@bar.com',
          // text: 'hello there!',
          attachment: [
            {
              data:`<html>Foo <em>bar</b> <a href="http://bguiz.com">baz</a>.</html>`,
              alternative: true,
            },
          ],
        });
      }
      catch (error) {
        err = error;
      }
      expect(err).toBeUndefined();
      expect(typeof msg).toBe('object');
      expect(typeof msg.text).toBe('string');
      expect(msg.text).toEqual(`Foo bar baz [ http://bguiz.com ] .`);
    });
  });

  it('should allow email when all fields present (html and text)', () => {
    co(function* () {
      let err, msg;
      try {
        msg = yield email.prepare({
          subject: 'hello',
          to: 'foo@bar.com',
          from: 'baz@bar.com',
          text: 'hello there!',
          attachment: [
            {
              data:`<html>Foo <em>bar</b> <a href="http://bguiz.com">baz</a>.</html>`,
              alternative: true,
            },
          ],
        });
      }
      catch (error) {
        err = error;
      }
      expect(err).toBeUndefined();
      expect(typeof msg).toBe('object');
      expect(typeof msg.text).toBe('string');
      // text, when provided, should not be overridden by html
      expect(msg.text).toEqual('hello there!');
    });
  });

  it('should send email when all fields present', () => {
    // this.timeout(10000);
    co(function* () {
      let err, msg;
      try {
        msg = yield email.send({
          subject: 'okaccounts test',
          to: 'foo@bar.com',
          // from: 'baz@bar.com',
          // text: 'okaccounts test',
          html: `<html>Foo <em>bar</b> <a href="http://bguiz.com">baz</a>.</html>`,
          // attachment: [
          //   {
          //     data: `<html>Foo <em>bar</b> <a href="http://bguiz.com">baz</a>.</html>`,
          //     alternative: true,
          //   },
          // ]
        });
        // console.log('msg', msg);
      }
      catch (error) {
        // console.log(ex, ex && ex.stack);
        err = error;
      }
      expect(err).toBeUndefined();
      expect(typeof msg).toBe('object');
      expect(typeof msg.accepted).toBe('array');
      expect(msg.accepted.length).toEqual(1);
      expect(typeof msg.rejected).toBe('array');
      expect(msg.rejected.length).toEqual(0);
      expect(msg.response).toEqual('250 Message received');
      expect(msg.envelope).toBe({
        from: 'support@bguiz.com',
        to: [ 'foo@bar.com' ],
      });
    });
  });
});
