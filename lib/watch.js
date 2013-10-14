var changeling = require('changeling')
var pipedown = require('pipedown')
var escape = require('escape-html')

module.exports = function(file, type, request, response) {
  var markdown = /markdown/.test(type)

  response.setHeader('Content-Type', 'text/event-stream')
  response.setHeader('Transfer-Encoding', 'chunked')

  var watch = changeling(file).on('error', function(error) {
    response.write('event: error\n')
    response.write('data: ' + error.message + '\n\n')
  })

  var content = (markdown ?
    watch.pipe(pipedown()) :
    watch
  )

  content.on('data', function(data) {
    var text = data.toString()
    if (!markdown) {
      text = escape(text)
    }
    response.write('event: message\n') 
    response.write('data: ' + text.replace(/\r|\n/g, '=|=') + '\n\n')
  })

  request.on('close', function() {
    watch.close() 
    response.end()
  })
}
