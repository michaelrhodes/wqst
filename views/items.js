var fs = require('fs')
var stream = require('stream')
var util = require('util')
var mkdom = require('mkdom')
var template = fs.readFileSync(__dirname + '/template.html')

var Items = function(name, type) {
  if (!(this instanceof Items)) {
    return new Items(name, type)
  }
  stream.Transform.call(this)
  this._writableState.objectMode = true

  this.directory = name

  this.dom = mkdom(template)
  this.body = this.dom.querySelector('body')
  this.title = this.dom.querySelector('title')
  this.content = this.dom.querySelector('#content')

  this.title.textContent = this.directory
}

util.inherits(Items, stream.Transform)

Items.prototype._transform = function(file, encoding, done) {
  var href = file.path.replace(RegExp('.*' + this.directory + '/'), '')
  this.content.innerHTML += '<a href="' + href + '">' + href + '</a><br />'
  done()
}

Items.prototype._flush = function(done) {
  var html = this.dom.doctype + this.dom.outerHTML
  this.push(html.trim())
  done()
}

module.exports = Items
