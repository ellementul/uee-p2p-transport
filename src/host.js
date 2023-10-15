import { Types } from '@ellementul/uee-core'
import Peer from 'peerjs'
import { BaseTransport } from './base.js'


const KeyType = Types.Key.Def()

const CREATED = "CreatedPeers"
const OPENED = "OpenedPeers"

class HostTransport extends BaseTransport {
  constructor (accessSpaces) {
    super()

    if(!Array.isArray(accessSpaces) || accessSpaces.length > 1)
      accessSpaces = ["client"]

    this.accessSpaces = new Map 
    accessSpaces.forEach(spaceName => {

      const validError = KeyType.test(spaceName)

      if(validError)
        throw new TypeError(`Invalid name of space! ${JSON.stringify(validError, null, 2)}`)

      const peer = new Peer
      peer.on('error', console.error)
      peer.on('open', id => this.openPeer(id, spaceName))

      this.accessSpaces.set(spaceName, { peer, isOpened: false })
    });

    this.state = CREATED
  }

  getAccessSpacesIds() {
    const accessSpacesIds = {}
    for (const [spaceName, { peer }] of this.accessSpaces) {
      accessSpacesIds[spaceName] = peer.id
    }

    return accessSpacesIds
  }

  openPeer(peerId, spaceName) {
    if(this.state != CREATED)
      throw new Error('Too later event about open peer!')

    this.accessSpaces.get(spaceName).isOpened = true

    let allOpened = true

    for (const [_, { isOpened }] of this.accessSpaces) {
      allOpened &= isOpened
    }

    if(allOpened) {
      this.listenToConnections()
      this.state = OPENED
      this.open(this.getAccessSpacesIds())
    }
  }

  listenToConnections() {
    for (const [_, accessSpace ] of this.accessSpaces) {
      accessSpace.conns = new Map
      accessSpace.peer.on('connection', conn => {
        accessSpace.conns.set(conn.peer, conn)

        conn.on('data', data => {
          this.receive(data)
        })

        conn.on('close', conn => {
          accessSpace.conns.delete(conn.peer)
        })
      })
    }
  }

  receive(message) {
    this.sendToProvider(message)
  }

  onOpen (openCallback) {
    if(typeof openCallback != "function")
      throw new TypeError("Open Callback isn't function!")

    this.open = openCallback
  }

  send (message) {

    if(this.state != OPENED) return

    message = this.zip(message)

    for (const [ spaceName, { conns } ] of this.accessSpaces) {
      for (const [ _, conn] of conns) 
        conn.send(message)
    }
  }
}

export { HostTransport }