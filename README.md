# lastfm-history [![Build Status](https://travis-ci.org/bencevans/node-lastfm-history.png?branch=master)](https://travis-ci.org/bencevans/node-lastfm-history)

> Provides an EventEmitter interface to gaining Last.fm scrobble history.



## Installation

    $ npm install lastfm-history

## Example

```javascript
var getHistory = require('lastfm-history');

var user = 'bencevans';
var apiKey = process.env.API_KEY;

var worker = getHistory(user, apiKey);

worker.on('page', function(tracks, meta) {
  console.log(tracks.length + ' scrobbles just pulled');
  console.log('meta:', meta);
  // store into database or file etc.
});

worker.on('complete', function() {
  console.log('complete');
  // start processing knowing you've got the whole dataset
});

worker.on('error', function(err) {
  console.log('err:', err);
});
```

## Licence

MIT © [Ben Evans](http://bensbit.co.uk)
