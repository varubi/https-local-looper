# https-local-looper
#### Redirect local HTTPS to HTTP
### Usage
```
npm install
```
```
node index.js
```

### Notes
* If you already something configured to listen to port 443 (ie. Apache2) this will not work
* Chrome will automatically redirect `.localhost` to `127.0.0.1` this does not, make sure to add `.localhost` to your HOSTS file.
