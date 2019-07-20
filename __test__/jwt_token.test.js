//load packages
const co = require('co');
const jwt_token = require('../lib/jwt_token');


describe('test jwt_token: create and verify', () => {

  it('should create a JWT token', async () => {
    let jwt = await jwt_token.create({ subject: 'foo' });
    expect(typeof jwt).toBe('string');
    expect(typeof jwt).not.toBeUndefined();
  });

  it('should give err if options.subject is not a string', () => {
    jwt_token.create({ subject: 66 }, function(err){
      console.log(err);
      expect(err).toBe('subject must be set');
    });
  });

  it('should verify a JWT', () => {
    co(function* () {
      let jwt = yield jwt_token.create({ subject: 'fooxfx' });
      let result = yield jwt_token.verify(jwt);
      expect(typeof result).toBe('object');
      expect(result.subject).toEqual('fooxfx');
    });

  });

})
