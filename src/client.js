const { Peer } = require('peerjs')
const { BaseTransport } = require('./base')

const CREATED = "CreatedPeers"
const CONNECTED = "ConnectedHOst"

class ClientTransport extends BaseTransport {
  constructor (peerId) {
    super()

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
    message = this.unzip(message)

    this.sendToProvider(message)
  }

  send (message) {
    if(this.state != CONNECTED)
      throw new Error("There is't connection!")

    this.connection.send(message)
  }
}

module.exports = { ClientTransport }