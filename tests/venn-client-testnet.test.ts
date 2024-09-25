import { errors } from '@/errors'
import { VennClient } from '@/venn-client'

const VENN_NODE_URL = 'http://signer.testnet.venn.build/api/17000/sign'
const POLICY_ADDRESS = '0xf4E5AB115d0775caf24eF25979991516f2283C20'
const VENN_NODE_REJECT_URL = 'http://signer.testnet.venn.build/api/17000/mock/reject'

const TX_DATA = {
    from: '0x6738fA889fF31F82d9Fe8862ec025dbE318f3Fde',
    to: '0xF06Ab383528F51dA67E2b2407327731770156ED6',
    value: '0',
    data: '0x2ebd2116000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000009a5cd1145791b29ac4e68df3bf8e30d2167daa76000000000000000000000000a150a825d425b36329d8294eef8bd0fe68f8f6e000000000000000000000000067c5870b4a41d4ebef24d2456547a03f1f3e094b0000000000000000000000000c6c80d2061afa35e160f3799411d83bdeea0a5a000000000000000000000000000000000000000000000000000004a15724a9fd',
} as const

describe('Venn Client Testnet', () => {
    test('Valid signature', async () => {
        const vennClient = new VennClient({
            vennURL: VENN_NODE_URL,
            vennPolicyAddress: POLICY_ADDRESS,
        })

        const resp = await vennClient.approve(TX_DATA)

        expect(resp.data).not.toBe(TX_DATA.data) // data embedded with signature
        expect(resp.from).toBe(TX_DATA.from)
        expect(resp.to).toBe(TX_DATA.to)
        expect(resp.value).toBe(TX_DATA.value)
    })

    test('Rejection', () => {
        const vennClient = new VennClient({
            vennURL: VENN_NODE_REJECT_URL,
            vennPolicyAddress: POLICY_ADDRESS,
        })

        expect(() => vennClient.approve(TX_DATA)).rejects.toThrow(errors.TxRejectedError)
    })
})
