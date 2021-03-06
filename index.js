'use strict';

/**
 * Module Dependencies
 */

var request      = require('request');
var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var async        = require('async');
var url          = require('url');

/**
 * Retrieve Last.fm Scrobble History
 * @param  {String} username username of last.fm history desired
 * @param  {String} apiKey   Last.fm API key
 * @return {EventEmitter}    listen on events 'page', 'error' and 'complete'
 */
var History = function(options) {
  var self = this;
  var firstRun = true;

  this.options = options || options;
  this.options.concurrency = (typeof this.options.concurrency !== 'undefined') ? this.options.concurrency : 1;

  if(!options.apiKey) {
    return this.emit('error', new Error('No apiKey provided'));
  }

  this.worker = function(pageNo, callback) {
    self.getPageAndParseBody(pageNo, function(err, response) {
      var i;

      if(err) {
        return self.emit('error', err);
      }

      self.emit('page', response);

      if(firstRun) { // Queue up rest of pages
        for (i = 2; i < response['@attr'].totalPages + 1; i++) {
          self.queue.push(i);
        }
        firstRun = false;
      }

      for (i = response.tracks.length - 1; i >= 0; i--) {
        self.emit('scrobble', response.tracks[i]);
      }

      return callback();

    });

  };

  this.queue = async.queue(this.worker, options.concurrency);

  this.queue.drain = function() {
    self.emit('complete');
  };

  if(this.options.concurrency !== 0) {
    this.queue.push(1);
  }

};
util.inherits(History, EventEmitter);

/**
 * Generates URL for API Call
 * @param  {Number} pageNo
 * @return {String}        URL to be requested
 */
History.prototype.getPageUrl = function(pageNo) {
  var options = {
    protocol : 'http:',
    host     : 'ws.audioscrobbler.com',
    pathname     : '/2.0',
    query    : {
      method   : 'user.getrecenttracks',
      user : this.options.username,
      api_key  : this.options.apiKey,
      format   : 'json',
      limit    : 200,
      page     : pageNo
    }
  };
  if(this.options.from && this.options.from instanceof Date) {
    options.query.from = Math.round(this.options.from.getTime() / 1000);
  }
  if(this.options.to && this.options.to instanceof Date) {
    options.query.to   = Math.round(this.options.to.getTime() / 1000);
  }
  return url.format(options);
};

/**
 * Requests a given page of a users scrobble history
 * @param  {Number}   pageNo   Page Number
 * @param  {Function} callback (err, body)
 * @return {Void}
 */
History.prototype.getPage = function(pageNo, callback) {
  request({
    json : true,
    url  : this.getPageUrl(pageNo)
  }, function(err, res, body) {
    callback(err, body);
  });
};

/**
 * Parse Last.FM's response into something more JavaScript friendly
 * @param  {Object} body JSON parsed body response from API
 * @return {Object}      {tracks: [...], '@attr': { ... }}
 */
History.prototype.parseBody = function(body) {

  if(!body) {
    throw new Error('No body response to parse');
  } else if(body.error) {
    throw new Error(body.error + ': ' + body.message );
  }

  body.recenttracks.track = body.recenttracks.track.map(function(scrobble) {
    scrobble.date = scrobble.date ? new Date(parseInt(scrobble.date.uts) * 1000) : new Date();
    return scrobble;
  });
  body.recenttracks['@attr'].page = parseInt(body.recenttracks['@attr'].page, 10);
  body.recenttracks['@attr'].perPage = parseInt(body.recenttracks['@attr'].perPage, 10);
  body.recenttracks['@attr'].totalPages = parseInt(body.recenttracks['@attr'].totalPages, 10);
  body.recenttracks['@attr'].total = parseInt(body.recenttracks['@attr'].total, 10);
  return { tracks: body.recenttracks.track, '@attr': body.recenttracks['@attr'] };
};

/**
 * A psuedo function for calling getPage and parseBody
 * @param  {Number}   pageNo   Page Number
 * @param  {Function} callback (err, res)
 * @return {Void}
 */
History.prototype.getPageAndParseBody = function(pageNo, callback) {
  var self = this;
  this.getPage(pageNo, function(err, body) {
    if(err) {
      return callback(err);
    }
    try {
      callback(null, self.parseBody(body));
    } catch (e) {
      callback(e);
    }
  });
};

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
module.exports.History = History;