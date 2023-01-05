const WSServer = require('@ellementul/uee-ws-server/WsServer')
const { WsTransport } = require('./index.js')

describe('System Testing', () => {
  const port = 8081
  const server = new WSServer(port)
  
  beforeAll(async () => {
    await server.start(false)
  });

  test('Run transport', done => {
    const message = { CheckingTransport: "Succseful!" }
    const callback = jest.fn(payload => {
      expect(payload).toEqual(message)
      done()
    })

    const transport = new WsTransport(server.domain.url)
    transport.onRecieve(callback)
    transport.send(message)
    transport.close()
  });

  afterAll(async () => {
    await server.close()
  });
});