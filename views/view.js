var fs = require('fs')
var stream = require('stream')
var util = require('util')
var mkdom = require('mkdom')
var template = fs.readFileSync(__dirname + '/template.html')

var View = function(name) {
  if (!(this instanceof View)) {
    return new View(name)
  }
  stream.Transform.call(this)
  this.dom = mkdom(template)
  this.content = this.dom.querySelector('#content')
  this.title = this.dom.querySelector('title')
  this.title.textContent = name
}

util.inherits(View, stream.Transform)

View.prototype._transform = function(data, encoding, done) {
  this.content.innerHTML += data.toString()
  done()
}

View.prototype._flush = function(done) {
  var html = this.dom.doctype + this.dom.outerHTML
  this.push(html.trim())
  done()
}

module.exports = View
