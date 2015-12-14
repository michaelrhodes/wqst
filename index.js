#!/usr/bin/env node

var http = require('http')
var around = require('getport')
var fs = require('fs')
var path = require('path')
var mime = require('mime')
var ecstatic = require('ecstatic')
var pipedown = require('pipedown')
var ls = require('ls-stream')
var through = require('through')
var open = require('open')
var argv = require('minimist')(process.argv.slice(2))
var watch = require('./lib/watch')
var items = require('./views/items')
var item = require('./views/item')

var files = ecstatic({
  handleError: false,
  root: __dirname + '/public',
  gzip: true
})

var file, type
var directory = process.cwd()

var server = http.createServer(function(request, response) {
  
  // The actual file being requested
  var filepath = path.resolve(
    directory + decodeURIComponent(request.url)
  )

  // Server-sent events
  if (file && /^\/updates/.test(request.url)) {
    return watch(file, type, request, response)
  }

  // Directory listing w/links
  else if (request.url === '/') {
    var render = items(path.basename(directory))
    return ls(directory)
      .pipe(through(function(entry) {
        entry.stat.isDirectory() ?
          entry.ignore() :
          this.queue(entry)
      }))
      .pipe(render)
      .pipe(response)
  }

  // Static assets
  else if (!fs.existsSync(filepath)) {
    return files(request, response, function() {
      response.statusCode = 404
      response.end()
    })
  }
 
  file = filepath
  type = mime.lookup(file)

  // Item view
  var render = item(path.basename(file), type)
  var read = fs.createReadStream(file)
  var content = (/markdown/.test(type) ?
    read.pipe(pipedown()) :
    read
  )
  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  })
  content
    .pipe(render)
    .pipe(response)
})

var announce = function() {
  var details = this.address()
  console.log('Listening on ' + details.port)

  if (argv.open) {
    var file = typeof argv.open === 'string' ? argv.open : null
    var root = 'http://localhost:' + details.port
    var url = file ? root + '/' + file : root
    open(url)
  }
}

var port = argv._[0]
if (port) {
  server.listen(port, announce)
  return
}

around(1234, function(error, port) {
  server.listen(port, announce)
})
