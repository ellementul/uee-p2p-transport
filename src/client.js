const { AbstractTransport, Types } = require('@ellementul/uee-core')
const { Peer } = require('peerjs')

const CREATED = "CreatedPeers"
const CONNECTED = "ConnectedHOst"

class ClientTransport extends AbstractTransport {
  constructor (peerId) {
    super()

    this.open = () => { throw TypeError("You need setup callback via onOpen method!") }
    this.inputQueue = []

    this.peer = new Peer

    this.peer.on('error', console.error)
    this.peer.on('open', id => this.openPeer(peerId))

    this.state = CREATED
  }

  openPeer(peerId) {
    if(this.state != CREATED)
      throw new Error('Repeat connect!')

    this.connection = this.peer.connect(peerId)
    this.connection.on('open', () => {
      this.connection.on('data', data => this.receive(data))
      this.connection.on('close', () => {
        this.state = CREATED
      })
      this.state = CONNECTED
      this.open()  
    })
  }

  receive(message) {
    if(typeof this._callback != "function")
      this.inputQueue.push(message)
    else
      this._callback(message)
  }

  clearInputQueue() {
    this.inputQueue.forEach(message => this._callback(message))
    this.inputQueue = []
  }

  onOpen (openCallback) {
    if(typeof openCallback != "function")
      throw new TypeError("Open Callback isn't function!")

    this.open = openCallback
  }

  onRecieve (receiveCallback) {
    if(typeof receiveCallback != "function")
      throw new TypeError("Receive Callback isn't function!")

    this._callback = receiveCallback
    this.clearInputQueue()
  }

  send (message) {
    if(this.state != CONNECTED)
      throw new Error("There is't connection!")

    this.connection.send(message)
  }
}

module.exports = { ClientTransport }