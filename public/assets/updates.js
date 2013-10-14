var content = document.querySelector('#content')
var updates = new EventSource('/updates')

updates.addEventListener('message', function(message) {
  content.innerHTML = message.data
    .replace(/=\|=/g, '\n')
})
