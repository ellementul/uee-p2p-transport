const { AbstractTransport } = require('@ellementul/uee-core')
const { Peer } = require('peerjs')

class PeerTransport extends AbstractTransport {
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
    const peer = new Peer(this._url)
    peer.on('open', () => this.open(peer))
    peer.on('data', data => this.message(data))
  }
  open(peer) {
    this._peer = peer
    this.clearQueue()
    console.log('Peer id:', peer.id)
  }
  clearQueue() {
    const queue = this._messages_queue
    this._messages_queue = []

    if(queue.length > 0)
      queue.forEach(message => this.send(message))
  }
  send (message) {
    if(this._peer) {
      this.clearQueue()
      this._send(message)
    }
    else {
      this._messages_queue.push(message)
    }
  }
  _send (message) {
    this._peer.send(JSON.stringify(message))
  }
  message (data) {
    this._callback(JSON.parse(data))
  }
}

module.exports = { PeerTransport }