import { AxiosInstance } from 'axios'
import { ethers, ZeroAddress } from 'ethers'

import { errors } from '@/errors'
import { VennClient, VennClientCreateOpts } from '@/venn-client'

jest.mock('axios')

/* FOR TESTING NON-PUBLIC METHODS AND FIELDS */
class VennClientExposed extends VennClient {
    constructor(data: VennClientCreateOpts) {
        super(data)
    }

    public _getSignature(txData: ethers.TransactionRequest) {
        return this.getSignature(txData)
    }

    set _apiInstance(apiInstance: AxiosInstance) {
        this.apiInstance = apiInstance
    }

    get _url() {
        return this.url
    }

    get _vennPolicyAddress() {
        return this.vennPolicyAddress
    }

    get _strict() {
        return this.strict
    }

    set _strict(strict: boolean) {
        this.strict = strict
    }
}

const VENN_NODE_URL = 'http://this-is-a-fake-url.com'
const POLICY_ADDRESS = ZeroAddress

const MOCKED_TX = {
    from: '0x6738fA889fF31F82d9Fe8862ec025dbE318f3Fde',
    to: '0xF06Ab383528F51dA67E2b2407327731770156ED6',
    value: '0',
    data: '0x2ebd2116000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000009a5cd1145791b29ac4e68df3bf8e30d2167daa76000000000000000000000000a150a825d425b36329d8294eef8bd0fe68f8f6e000000000000000000000000067c5870b4a41d4ebef24d2456547a03f1f3e094b0000000000000000000000000c6c80d2061afa35e160f3799411d83bdeea0a5a000000000000000000000000000000000000000000000000000004a15724a9fd',
} as const

const MOCKED_SIGNER_RESPONSE = {
    requestId: 'unique-id',
    status: 'Approved',
    data: MOCKED_TX,
} as const

let vennClient: VennClientExposed

describe('Venn Client Mocked Tests', () => {
    describe('Init tests', () => {
        test('default init', () => {
            const client = new VennClientExposed({
                vennURL: VENN_NODE_URL,
                vennPolicyAddress: POLICY_ADDRESS,
            })

            expect(client._url).toBe(VENN_NODE_URL)
            expect(client._vennPolicyAddress).toBe(POLICY_ADDRESS)
            expect(typeof client.approve).toBe('function')
        })

        describe('Validation tests', () => {
            test('invalid url', () => {
                expect(() => {
                    new VennClient({
                        vennURL: 'invalid-url',
                        vennPolicyAddress: POLICY_ADDRESS,
                    })
                }).toThrow(errors.InvalidInitParamsError)
            })
            test('invalid policy address', () => {
                expect(() => {
                    new VennClient({
                        vennURL: VENN_NODE_URL,
                        vennPolicyAddress: 'invalid-address',
                    })
                }).toThrow(errors.InvalidInitParamsError)
            })
        })
    })

    describe('Functionality tests', () => {
        beforeAll(() => {
            vennClient = new VennClientExposed({
                vennURL: VENN_NODE_URL,
                vennPolicyAddress: POLICY_ADDRESS,
            })
        })

        describe('Private methods', () => {
            describe('_getSignature', () => {
                beforeEach(() => {
                    vennClient._apiInstance = {
                        post: jest.fn().mockResolvedValue({ data: MOCKED_SIGNER_RESPONSE }),
                    } as unknown as AxiosInstance
                })
                afterEach(() => {
                    jest.resetAllMocks()
                })

                test('should return a signature', async () => {
                    const signature = await vennClient._getSignature(MOCKED_TX)

                    expect(signature).toBeDefined()
                    expect(signature.data).toEqual(MOCKED_SIGNER_RESPONSE.data)
                })
            })
        })

        describe('Public methods', () => {
            afterEach(() => {
                jest.resetAllMocks()
            })

            describe('approve', () => {
                test('no connection fail', async () => {
                    vennClient._apiInstance = {
                        post: jest.fn().mockRejectedValue(new errors.ConnectionRefusedError()),
                    } as unknown as AxiosInstance

                    expect(() => vennClient.approve(MOCKED_TX)).rejects.toThrow(errors.ConnectionRefusedError)
                })

                test('should return a return signed data', async () => {
                    vennClient._apiInstance = {
                        post: jest.fn().mockResolvedValue({ data: MOCKED_SIGNER_RESPONSE }),
                    } as unknown as AxiosInstance

                    const signedData = await vennClient.approve(MOCKED_TX)
                    // return value is the same as the input since no signing is done
                    expect(signedData).toBe(MOCKED_TX)

                    jest.resetAllMocks()
                })

                test('strict mode should throw error', async () => {
                    vennClient._apiInstance = {
                        post: jest.fn().mockRejectedValue(new errors.InternalError('API request failed')),
                    } as unknown as AxiosInstance

                    expect(vennClient.approve(MOCKED_TX)).rejects.toThrow(errors.InternalError)
                })

                test('not strict mode should return original data on error', async () => {
                    const client = new VennClientExposed({
                        vennURL: VENN_NODE_URL,
                        vennPolicyAddress: POLICY_ADDRESS,
                        strict: false,
                    })

                    client._apiInstance = {
                        post: jest.fn().mockRejectedValue(new errors.InternalError('API request failed')),
                    } as unknown as AxiosInstance

                    expect(client.approve(MOCKED_TX)).resolves.toEqual(MOCKED_TX)
                })
            })
        })
    })
})
