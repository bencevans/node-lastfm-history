
/**
 * Module Dependencies
 */

var request      = require('request');
var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var async        = require('async');
var qs           = require('querystring');

/**
 * Retrieve Last.fm Scrobble History
 * @param  {String} username username of last.fm history desired
 * @param  {String} apiKey   Last.gm API key
 * @return {EventEmitter}    listen on events 'page', 'error' and 'complete'
 */
var History = function(options) {

  this.options = options || options;
  this.options.concurrency = concurrency || 1;

  if(!options.apiKey) {
    return this.emit('error', new Error('No apiKey provided'));
  }

  function getPage(pageNo, callback) {
    request({
        json: true,
        url: 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + username + '&api_key=' + apiKey + '&format=json&limit=200&page=' + pageNo
      }, function(err, res, body) {
        if(err) return em.emit('error', err);

        try {
          // Parse page and track details to numbers
          body.recenttracks['@attr'].page = parseInt(body.recenttracks['@attr'].page, 10);
          body.recenttracks['@attr'].perPage = parseInt(body.recenttracks['@attr'].perPage, 10);
          body.recenttracks['@attr'].totalPages = parseInt(body.recenttracks['@attr'].totalPages, 10);
          body.recenttracks['@attr'].total = parseInt(body.recenttracks['@attr'].total, 10);
          em.emit('page', body.recenttracks.track, body.recenttracks['@attr']);
        } catch (e) {
          e.statusCode = res.statusCode;
          e.body = body;
          em.emit('error', e);
        }


        if(pageNo === 1) {
          var q = async.queue(getPage, concurrency);
          for (var i = 2; i < body.recenttracks['@attr'].totalPages; i++) {
            q.push(i);
          }
          q.drain = function() {
            em.emit('complete');
          };
        } else {
          callback();
        }
      });
  }

  getPage(1);

};
util.inherits(History, EventEmitter);

/**
 * Helper to create an instance of History
 * @param  {Object | Sting} username    An options object can be specified instead. Else it's your Last.fm username.
 * @param  {String} apiKey              API key provided by Last.fm developer centre.
 * @param  {Number} concurrency         Default=1 How many "workers" should be collecting pages of data.
 * @return {History}
 */
var createInstance = function(username, apiKey, concurrency) {

  var options = {};

  if(typeof username === 'object') {
    options = username;
  } else {
    options.username = username;
    options.apiKey   = apiKey;
    options.concurrency = concurrency;
  }

  return new History(options);
};

/**
 * Exports
 */

module.exports = createInstance;
