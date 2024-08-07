import { ZeroAddress } from 'ethers'

import { VennClient } from '@/venn-client'

const VENN_NODE_URL = 'mocked'
const POLICY_ADDRESS = ZeroAddress

const MOCKED_TX = {
  requestId: 'unique-id',
  chainId: 1,
  from: '0x6738fA889fF31F82d9Fe8862ec025dbE318f3Fde',
  to: '0xF06Ab383528F51dA67E2b2407327731770156ED6',
  value: '0',
  data: '0x2ebd2116000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000009a5cd1145791b29ac4e68df3bf8e30d2167daa76000000000000000000000000a150a825d425b36329d8294eef8bd0fe68f8f6e000000000000000000000000067c5870b4a41d4ebef24d2456547a03f1f3e094b0000000000000000000000000c6c80d2061afa35e160f3799411d83bdeea0a5a000000000000000000000000000000000000000000000000000004a15724a9fd',
}

describe('Venn Client Tests', () => {
  test('init no policy', () => {
    const client = new VennClient({ url: VENN_NODE_URL })

    expect(client.url).toBe(VENN_NODE_URL)
    expect(client.policyAddress).toBeUndefined()
  })

  test('init with policy', () => {
    const client = new VennClient({
      url: VENN_NODE_URL,
      policyAddress: POLICY_ADDRESS,
    })

    expect(client.url).toBe(VENN_NODE_URL)

    expect(client.policyAddress).toBe(POLICY_ADDRESS)
  })

  test('inspect tx fail', async () => {
    const client = new VennClient({
      url: VENN_NODE_URL,
    })

    // no working url is available for now
    expect(client.inspectTx(MOCKED_TX)).rejects.toThrow()

    // const inspectionResult = await client.inspectTx(MOCKED_TX)

    // expect(inspectionResult.requestId).toBe(MOCKED_TX.requestId)
  })
})
