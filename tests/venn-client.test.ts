import { AbiCoder, encodeBytes32String, ZeroAddress } from 'ethers'

import { ApprovedCallsPayload, SafeFunctionCallPayload } from '@/types'
import { VennClient, VennClientCreateOpts } from '@/venn-client'

/* FOR TESTING NON-PUBLIC METHODS AND FIELDS */
class VennClientExposed extends VennClient {
  constructor(data: VennClientCreateOpts) {
    super(data)
  }

  public _encodeApprovedCalls(data: ApprovedCallsPayload) {
    return this.encodeApprovedCalls(data)
  }
  public _encodeSafeFunctionCall(data: SafeFunctionCallPayload) {
    return this.encodeSafeFunctionCall(data)
  }
}

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

let vennClient: VennClientExposed

describe('Venn Client Tests', () => {
  describe('Init tests', () => {
    test('default init', () => {
      const client = new VennClient({ url: VENN_NODE_URL })

      expect(client.url).toBe(VENN_NODE_URL)
      expect(typeof client.inspectTx).toBe('function')
      expect(typeof client.signTx).toBe('function')
    })
  })

  describe('Functionality tests', () => {
    beforeAll(() => {
      vennClient = new VennClientExposed({
        url: VENN_NODE_URL,
      })
    })

    describe('Private methods', () => {
      test('encodeSafeFunctionCall', () => {
        const result = vennClient._encodeSafeFunctionCall({
          target: MOCKED_TX.to,
          targetPayload: AbiCoder.defaultAbiCoder().encode(
            ['string', 'address'],
            ['test string', MOCKED_TX.from],
          ),
          data: MOCKED_TX.data,
        })

        expect(result).toBe(
          '0x1a8828f4000000000000000000000000f06ab383528f51da67e2b2407327731770156ed600000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000400000000000000000000000006738fa889ff31f82d9fe8862ec025dbe318f3fde000000000000000000000000000000000000000000000000000000000000000b7465737420737472696e6700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c42ebd2116000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000009a5cd1145791b29ac4e68df3bf8e30d2167daa76000000000000000000000000a150a825d425b36329d8294eef8bd0fe68f8f6e000000000000000000000000067c5870b4a41d4ebef24d2456547a03f1f3e094b0000000000000000000000000c6c80d2061afa35e160f3799411d83bdeea0a5a000000000000000000000000000000000000000000000000000004a15724a9fd00000000000000000000000000000000000000000000000000000000',
        )
      })

      test('encodeApprovedCalls', () => {
        const result = vennClient._encodeApprovedCalls({
          txOrigin: MOCKED_TX.from,
          nonce: 1,
          expiration: '1723125409',
          signature: '0x',
          callHashes: [encodeBytes32String('0x')],
        })

        expect(result).toBe(
          '0x0c908cff00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000066b4cea10000000000000000000000006738fa889ff31f82d9fe8862ec025dbe318f3fde000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000130780000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        )
      })
    })

    describe('Public methods', () => {
      test('inspect fail', async () => {
        // no working url is available for now
        expect(vennClient.inspectTx(MOCKED_TX)).rejects.toThrow()

        // const inspectionResult = await client.inspectTx(MOCKED_TX)

        // expect(inspectionResult.requestId).toBe(MOCKED_TX.requestId)
      })

      test('sign fail', async () => {
        // no working url is available for now
        expect(
          vennClient.signTx({ ...MOCKED_TX, approvingPolicyAddress: POLICY_ADDRESS }),
        ).rejects.toThrow()
      })
    })
  })
})
