# ytfps
##### **YouTube Full Playlist Scraper**

Tiny module to scrap youtube playlist or album metadata and their videos (not limited to 100)

# Install

    npm install ytfps

# Usage

```js
const ytfps = require('ytfps');
// TypeScript: import ytfps from 'ytfps'; //with --esModuleInterop

ytfps('PLAbeRqyTx1rIGWY13HgPyh0VF0LdoTQFp').then(playlist => {
    do_something(playlist);
}).catch(err => {
    throw err;
});
```

# API
    ytfps(id)

Scraps the supplied playlist and returns a promise with its metadata.

* `id`
    * youtube playlist's id
    * or youtube playlist's URL

* [Example response](https://github.com/Caier/ytfps/blob/master/example/output.json)


# License
MIT