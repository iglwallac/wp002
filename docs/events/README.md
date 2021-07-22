#Events

The following events are sent by the web app to the event tracking endpoint.

##Video Played

```javascript
{
  "context": {
    "app": {
      "name": "Gaia Web App",
      "version": "1.0.0"
    },
    "page": {
      "hash": "hash",
      "path": "pathname",
      "search": "search",
      "title": "Test Page",
      "url": "http://localhost/test?test=1#test"
    }
  },
  "properties": {
    "gaiaContext": []
  },
  "timestamp": "2017-04-27T16:49:32.872Z",
  "userId": 1,
  "event": "Video Played",
  "videoId": 2
}
```

##Shelf Expanded

```javascript
{
  "context": {
    "app": {
      "name": "Gaia Web App",
      "version": "1.0.0"
    },
    "page": {
      "hash": "hash",
      "path": "pathname",
      "search": "search",
      "title": "Test Page",
      "url": "http://localhost/test?test=1#test"
    }
  },
  "properties": {
    "gaiaContext": []
  },
  "timestamp": "2017-04-27T16:49:32.872Z",
  "userId": 1,
  "event": "Shelf Expanded",
  "contentType": "test",
  "contentId": 3
}
```

##Video Visited

```javascript
{
  "context": {
    "app": {
      "name": "Gaia Web App",
      "version": "1.0.0"
    },
    "page": {
      "hash": "hash",
      "path": "pathname",
      "search": "search",
      "title": "Test Page",
      "url": "http://localhost/test?test=1#test"
    }
  },
  "properties": {
    "gaiaContext": []
  },
  "timestamp": "2017-04-27T16:49:32.872Z",
  "userId": 1,
  "event": "Video Visited",
  "videoId": 2
}
```

##Video View Qualified

```javascript
{
  "context": {
    "app": {
      "name": "Gaia Web App",
      "version": "1.0.0"
    },
    "page": {
      "hash": "hash",
      "path": "pathname",
      "search": "search",
      "title": "Test Page",
      "url": "http://localhost/test?test=1#test"
    }
  },
  "properties": {
    "gaiaContext": []
  },
  "timestamp": "2017-04-27T16:49:32.872Z",
  "userId": 1,
  "event": "Video View Qualified",
  "videoId": 2
}
```

##Playlist Video Added

```javascript
{
  "context": {
    "app": {
      "name": "Gaia Web App",
      "version": "1.0.0"
    },
    "page": {
      "hash": "hash",
      "path": "pathname",
      "search": "search",
      "title": "Test Page",
      "url": "http://localhost/test?test=1#test"
    }
  },
  "properties": {
    "gaiaContext": []
  },
  "timestamp": "2017-04-27T16:49:32.872Z",
  "userId": 1,
  "event": "Playlist Video Added",
  "videoId": 2
}
```

##Gift Video Viewed

```javascript
{
  "context": {
    "app": {
      "name": "Gaia Web App",
      "version": "1.0.0"
    },
    "page": {
      "hash": "hash",
      "path": "pathname",
      "search": "search",
      "title": "Test Page",
      "url": "http://localhost/test?test=1#test"
    }
  },
  "properties": {
    "gaiaContext": []
  },
  "timestamp": "2017-04-27T16:49:32.872Z",
  "userId": 1,
  "event": "Gift Video Viewed",
  "siteSegment": {
    "id": 4,
    "name": "test"
  }
}
```

##Series Visited

```javascript
{
  "context": {
    "app": {
      "name": "Gaia Web App",
      "version": "1.0.0"
    },
    "page": {
      "hash": "hash",
      "path": "pathname",
      "search": "search",
      "title": "Test Page",
      "url": "http://localhost/test?test=1#test"
    }
  },
  "properties": {
    "gaiaContext": []
  },
  "timestamp": "2017-04-27T16:49:32.872Z",
  "userId": 1,
  "event": "Series Visited",
  "seriesId": 5
}
```

##Page Viewed

```javascript
{
  "context": {
    "app": {
      "name": "Gaia Web App",
      "version": "1.0.0"
    },
    "page": {
      "hash": "hash",
      "path": "pathname",
      "search": "search",
      "title": "Test Page",
      "url": "http://localhost/test?test=1#test"
    }
  },
  "properties": {
    "gaiaContext": []
  },
  "timestamp": "2017-04-27T16:49:32.872Z",
  "userId": 1,
  "event": "Page Viewed"
}
```

