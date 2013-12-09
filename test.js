'use strict';

var assert       = require('assert');
var getScrobbles = require('./');

describe('lastfm-history', function() {

  describe('#createInstance()', function() {
    var scrobbleEmitter;

    it('should throw an error when missing a apiKey', function() {
      assert.throws(function() {
        getScrobbles();
      });
      assert.throws(function() {
        getScrobbles({});
      });
      assert.throws(function() {
        getScrobbles('bencevans', null, 1);
      });
    });
    it('should accept an options object', function() {
      var options = {
        username   : 'bencevans',
        apiKey     : 'hufdpoajfdajwepj',
        concurrency: 1
      }
      assert.deepEqual(getScrobbles(options).options, options);
    });
    it('should return an instance of History', function() {
      assert.ok(getScrobbles({ apiKey:'123123', username: 'oij' }) instanceof getScrobbles.History);
    });

  });

  describe('#History', function() {

    it('should emit a scrobble event');
    it('should emit a complete event');

  });

});