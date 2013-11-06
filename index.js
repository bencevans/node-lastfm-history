
/**
 * Module Dependencies
 */

var request = require('request');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var async = require('async');

/**
 * Retrieve Last.fm Scrobble History
 * @param  {String} username username of last.fm history desired
 * @param  {String} apiKey   Last.gm API key
 * @return {EventEmitter}    listen on events 'page', 'error' and 'complete'
 */
var getHistory = function(username, apiKey, concurrency) {

  concurrency = concurrency || 1;

  var em = new EventEmitter();

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

  return em;
};

/**
 * Exports
 */

module.exports = getHistory;
