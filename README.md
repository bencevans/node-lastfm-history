# node-lastfm-history

Provides an EventEmitter interface to gaining Last.fm scrobble history.

## Installation

`npm install lastfm-history`

## Example

```javascript
ver getHistory = require('lastfm-history');s
var worker = getHistory('bencevans', 'b2093e04f3b01c29f6d01d7b9109579f');

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