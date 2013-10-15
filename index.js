#!/usr/bin/env node

var http = require('http')
var around = require('getport')
var fs = require('fs')
var path = require('path')
var mime = require('mime')
var ecstatic = require('ecstatic')
var pipedown = require('pipedown')
var ls = require('./lib/ls')
var watch = require('./lib/watch')
var items= require('./views/items')
var item = require('./views/item')
var filter = require('stream-filter')(function(file) {
  return file.stat.isFile()
})

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
    return ls(directory, false)
      .pipe(filter)
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

// Listen dance

var announce = function() {
  console.log('Listening on ' + this.address().port)
}

var port = process.argv[2]
if (port) {
  server.listen(port, announce)
  return
}

around(1234, function(error, port) {
  server.listen(port, announce)
})
