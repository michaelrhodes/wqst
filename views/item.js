var fs = require('fs')
var stream = require('stream')
var util = require('util')
var mkdom = require('mkdom')
var escape = require('escape-html')

var template = fs.readFileSync(__dirname + '/template.html')

var Item = function(name, type) {
  if (!(this instanceof Item)) {
    return new Item(name, type)
  }
  stream.Transform.call(this)

  this.markdown = /markdown/.test(type)
  this.dom = mkdom(template)
  this.body = this.dom.querySelector('body')
  this.title = this.dom.querySelector('title')
  
  this.title.textContent = name

  // Swap the <pre> for a <div>
  if (this.markdown) {
    var pre = this.body.querySelector('pre')
    var div = mkdom('<div id="content">')
    this.body.removeChild(pre.nextSibling)
    this.body.removeChild(pre)
    this.body.appendChild(div)
  }

  var script = mkdom('<script src="/assets/updates.js"></script>')
  this.body.appendChild(script)

  this.content = this.body.querySelector('#content')
}

util.inherits(Item, stream.Transform)

Item.prototype._transform = function(data, encoding, done) {
  var text = data.toString()
  if (!this.markdown) {
    text = escape(text)
  }
  this.content.innerHTML += text
  done()
}

Item.prototype._flush = function(done) {
  var html = this.dom.doctype + this.dom.outerHTML
  this.push(html.trim())
  done()
}

module.exports = Item
