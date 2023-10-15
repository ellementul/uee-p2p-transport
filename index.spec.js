import test from 'ava'

import { HostTransport, ClientTransport } from './index.js'

test("Testing export main classes", t => {
  t.truthy(HostTransport)
  t.truthy(ClientTransport)
})