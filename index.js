const { AbstractTransport } = require('@ellementul/uee-core')

class WsTransport extends AbstractTransport {
  constructor (url) {
    super()

    this._url = url
    this._messages_queue = []
  }
  onRecieve (recieveCallback) {
    this._callback = recieveCallback
    this.start()
  }
  start() {
    const socket = new WebSocket(this._url)
    socket.onopen = () => this.open(socket)
    socket.onmessage = data => this.message(data)
  }
  open(socket) {
    this._socket = socket
    this.clearQueue()
  }
  clearQueue() {
    const queue = this._messages_queue
    this._messages_queue = []

    if(queue.length > 0)
      queue.forEach(message => this.send(message))
  }
  send (message) {
    if(this._socket) {
      this.clearQueue()
      this._send(message)
    }
    else {
      this._messages_queue.push(message)
    }
  }
  _send (message) {
    this._socket.send(JSON.stringify(message))
  }
  message (data) {
    this._callback(JSON.parse(data))
  }
  close () {
    this._socket.close()
  }
}

module.exports = { WsTransport }