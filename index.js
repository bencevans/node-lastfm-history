
/**
 * Module Dependencies
 */

var request = require('request');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * Retrieve Last.fm Scrobble History
 * @param  {String} username username of last.fm history desired
 * @param  {String} apiKey   Last.gm API key
 * @return {EventEmitter}    listen on events 'page', 'error' and 'complete'
 */
var getHistory = function(username, apiKey) {
  var em = new EventEmitter();

  function getPage(pageNo) {
    request({
        json: true,
        url: 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' + username + '&api_key=' + apiKey + '&format=json&limit=200&page=' + pageNo
      }, function(err, res, body) {
        if(err) return em.emit('error', err);

        // Parse page and track details to numbers
        body.recenttracks['@attr'].page = parseInt(body.recenttracks['@attr'].page, 10);
        body.recenttracks['@attr'].perPage = parseInt(body.recenttracks['@attr'].perPage, 10);
        body.recenttracks['@attr'].totalPages = parseInt(body.recenttracks['@attr'].totalPages, 10);
        body.recenttracks['@attr'].total = parseInt(body.recenttracks['@attr'].total, 10);

        em.emit('page', body.recenttracks.track, body.recenttracks['@attr']);

        if(body.recenttracks['@attr'].page < body.recenttracks['@attr'].totalPages) {
          getPage(pageNo + 1);
        } else {
          em.emit('complete');
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
