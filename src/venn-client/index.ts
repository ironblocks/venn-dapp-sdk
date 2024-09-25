import axios, { AxiosInstance } from 'axios'
import { TransactionRequest } from 'ethers'

import { errors } from '@/errors'
import { isValidEthereumAddress, isValidUrl, parseApiError, parseServerError } from '@/helpers'
import { type SignedTxResponse, type SignTxServerRequest } from '@/types'

export type VennClientCreateOpts = {
    vennURL: string
    vennPolicyAddress: string
    strict?: boolean
}

export class VennClient {
    protected url: string

    protected vennPolicyAddress: string

    protected apiInstance: AxiosInstance

    protected strict: boolean

    /**
     * Creates a new VennClient instance.
     * @param {string} opts.url - The URL of the Venn Node.
     * @param {string} opts.vennPolicyAddress - The address of the policy.
     * @param {boolean} [opts.strict=true] - Optional. Whether to throw an error if the response Venn Network is not 'Approved' or if an error occurs. If set to false, will return the request data on failure. Defaults to true.
     * @throws {Error} If any required property is missing.
     */
    constructor(opts: VennClientCreateOpts) {
        this.validateRequiredProperties(opts)

        this.url = opts.vennURL
        this.vennPolicyAddress = opts.vennPolicyAddress
        this.strict = opts.strict ?? true

        this.apiInstance = axios.create({ baseURL: this.url })
    }

    protected async getSignature(txData: TransactionRequest): Promise<SignedTxResponse> {
        try {
            const requestData: SignTxServerRequest = {
                ...txData,
                approvingPolicyAddress: this.vennPolicyAddress,
            }

            const { data: signedData } = await this.apiInstance.post<SignedTxResponse>('', requestData)

            // some errors come with 200 status ^_^
            if (signedData.status !== 'Approved') {
                throw new errors.TxRejectedError(
                    `Request not approved. Status: ${signedData.status}. Message: ${
                        signedData.message || 'No message provided'
                    }`,
                )
            }

            return signedData
        } catch (error) {
            // first checking default http errors then Venn Node specific ones
            throw parseApiError(error) ?? parseServerError(error)
        }
    }

    /**
     * Approves a transaction request.
     * @param {ethers.TransactionRequest} txData - The transaction request to approve. Must include to, from, value and data
     * @param {string} txData.to - The recipient address of the transaction (required)
     * @param {string} txData.from - The sender address of the transaction (required)
     * @param {string} txData.value - The amount of Ether to send with the transaction (required)
     * @param {string} txData.data - The data payload of the transaction (required)
     * @returns {ethers.TransactionRequest} The approved transaction request. Includes a from, to, value and data
     * @throws {Error} If strict is true, and the transaction request is not approved or an error occurs. If strict set to false, will return the transaction request on failure.
     */
    public async approve(txData: TransactionRequest): Promise<TransactionRequest> {
        try {
            const { data } = await this.getSignature(txData)

            return data
        } catch (error) {
            return this.handleError(error, txData)
        }
    }

    private validateRequiredProperties(opts: VennClientCreateOpts) {
        if (!opts.vennURL || !opts.vennPolicyAddress) {
            throw new errors.InvalidInitParamsError(
                'Missing required properties: `vennURL` and `vennPolicyAddress` are required.',
            )
        }

        if (!isValidUrl(opts.vennURL)) {
            throw new errors.InvalidInitParamsError('Invalid `vennURL` provided.')
        }

        if (!isValidEthereumAddress(opts.vennPolicyAddress)) {
            throw new errors.InvalidInitParamsError('Invalid Ethereum address provided for `vennPolicyAddress`.')
        }
    }

    private handleError(error: unknown, txData: TransactionRequest): TransactionRequest {
        if (this.strict) throw error

        // npm unwraps the 'data' property of the object
        // npm do what?? (c) Mark
        return txData
    }
}
