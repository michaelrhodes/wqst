# wqst
wqst (watchquest) is a command-line utility that spawns web servers to render text files from the working directory. The files are watched for changes, and then re-rendered using [server-sent events](https://developer.mozilla.org/en-US/docs/Server-sent_events/Using_server-sent_events). Markdown files are automatically detected and transformed.

## Install
``` sh
$ npm install -g wqst
```

### API
`wqst [--open=file] [port]`

Use the `--open` flag without a value if you want the directory listing opened in your default browser. Set the value if you want to view a specific file.

If no port is specified, the web server will spin up on `1234`. If `1234` is unavailable, the port will be incremented until an available port is found.

### License
[MIT](http://opensource.org/licenses/MIT)
