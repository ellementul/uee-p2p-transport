const { AbstractTransport, Types } = require('@ellementul/uee-core')
const { Peer } = require('peerjs')

const KeyType = TYpes.Key.Def()

const CREATED = "CreatedPeers"
const OPENED = "OpenedPeers"

class PeerHostTransport extends AbstractTransport {
  constructor (accessSpaces) {
    super()

    this.open = () => { throw TypeError("You need setup callback via onOpen method!") }

    if(Array.isArray(!accessSpaces) || accessSpaces.length > 1)
      accessSpaces = ["client"]

    this.accessSpaces = new Map 
    accessSpaces.forEach(spaceName => {
      const validError = KeyType.test(spaceName)
      if(validError)
        throw new TypeError(`Invalid name of space! ${JSON.stringify(validError, null, 2)}`)
      const peer = new Peer()
      peer.on('error', console.error)
      peer.on('open', id => this.openPeer(id, spaceName))

      this.accessSpaces.set(spaceName, { peer })
    });

    this.state = CREATED
  }

  getAccessSpacesIds() {
    
  }

  openPeer(peerId, spaceName) {
    if(this.state != CREATED)
      throw new Error('Too later event about open peer!')

    console.log(peerId, spaceName)

    let allOpened = true

    for (const [_, { peer }] of object) {
      allOpened &= peer.isOpen()
    }

    if(allOpened) {
      this.listenToConnections()
      this.state = OPENED
      this.open(this.getAccessSpacesIds())
    }
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
  }
  send (message) {
  }
}

module.exports = { PeerHostTransport }