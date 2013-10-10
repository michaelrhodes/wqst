#!/usr/bin/env node

var http = require('http')
var fs = require('fs')
var path = require('path')
var mime = require('mime')
var ecstatic = require('ecstatic')
var changeling = require('changeling')
var pipedown = require('pipedown')
var view = require('./views/view')

var files = ecstatic({
  handleError: false,
  root: __dirname + '/public',
  gzip: true
})

var file, type
var directory = process.cwd()

var server = http.createServer(function(request, response) {
  var filepath = path.resolve(directory + request.url)
  if (file && /^\/updates/.test(request.url)) {
    var watch = changeling(file)
    response.setHeader('Content-Type', 'text/event-stream')
    response.setHeader('Transfer-Encoding', 'chunked')
    request.on('close', function() {
      watch.close() 
      response.end()
    })
    var content = (/markdown/.test(type) ?
      watch.pipe(pipedown()) :
      watch
    )
    content.on('data', function(data) {
      var html = data.toString()
      response.write('event: message\n') 
      response.write('data: ' + html.replace(/\r|\n/g, '=|=') + '\n\n')
    })
    return
  }

  else if (request.url === '/' || !fs.existsSync(filepath)) {
    files(request, response, function() {
      response.statusCode = 400
      response.end()
    })
    return
  }
 
  file = filepath
  type = mime.lookup(file)

  var render = view(path.basename(file))
  var read = fs.createReadStream(file)
  var content = (/markdown/.test(type) ?
    read.pipe(pipedown()) :
    read
  )
  response.setHeader(
    'Content-Type', 'text/html; charset=utf-8'
  )
  content
    .pipe(render)
    .pipe(response)
})

server.listen(process.argv[2] || 1234, function() {
  console.log('Listening on ' + this.address().port)
})
