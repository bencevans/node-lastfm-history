'use strict';

var assert       = require('assert');
var getScrobbles = require('./');

describe('lastfm-history', function() {

  describe('#createInstance()', function() {

    it('should throw an error when missing a apiKey', function() {
      assert.throws(function() {
        getScrobbles();
      });
      assert.throws(function() {
        getScrobbles({});
      });
      assert.throws(function() {
        getScrobbles('bencevans', null, 0);
      });
    });
    it('should accept an options object', function() {
      var options = {
        username   : 'bencevans',
        apiKey     : 'hufdpoajfdajwepj',
        concurrency: 0
      };
      assert.deepEqual(getScrobbles(options).options, options);
    });
    it('should return an instance of History', function() {
      assert.ok(getScrobbles({ apiKey:'123123', username: 'oij', concurrency: 0 }) instanceof getScrobbles.History);
    });

  });

  describe('#History', function() {
    var scrobbleEmitter;

    this.timeout(10000);

    function justCall(done) {
      return function() {
        done();
      };
    }

    before(function() {
      scrobbleEmitter = getScrobbles({
        username: 'bencevans',
        apiKey  : process.env.LAST_FM_KEY,
        from    : new Date('11/3/13 00:00'),
        to      : new Date('11/10/13 00:00')
      });
    });

    it('should emit a page event', function(done) {
      scrobbleEmitter.once('page', justCall(done));
    });

    it('should emit a scrobble event', function(done) {
      scrobbleEmitter.once('scrobble', justCall(done));
    });

    it('should emit a complete event', function(done) {
      scrobbleEmitter.once('complete', justCall(done));
    });

  });

});