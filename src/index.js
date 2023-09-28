const { HostTransport } = require('./host')
const { ClientTransport } = require('./client')

module.exports = {
  PeerHostTransport: HostTransport,
  PeerClientTransport: ClientTransport
}