const { AbstractTransport, Types } = require('@ellementul/uee-core')
const { encode, decode } =  require('@msgpack/msgpack')
const pako = require('pako')

class BaseTransport extends AbstractTransport {
  constructor () {
    super()

    this.open = () => { throw TypeError("You need setup callback via onOpen method!") }

    this.inputQueue = []
  }

  sendToProvider(message) {
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

  zip(data) {
    data = encode(data)
    return pako.deflate(data)
  }

  unzip(compressed) {
    const data = pako.inflate(compressed)
    return decode(data)
  }
}

module.exports = { BaseTransport }