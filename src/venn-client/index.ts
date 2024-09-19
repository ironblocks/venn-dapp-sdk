import axios, { AxiosInstance } from 'axios'
import { ethers, isAddress } from 'ethers'

import { parseServerError } from '@/helpers'
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

  protected async getSignature(
    txData: ethers.TransactionRequest,
  ): Promise<SignedTxResponse | { data: ethers.TransactionRequest } | undefined> {
    const requestData: SignTxServerRequest = {
      ...txData,
      approvingPolicyAddress: this.vennPolicyAddress,
    }
    try {
      const { data: signedData } = await this.apiInstance.post<SignedTxResponse>('', requestData)

      // some errors come with 200 status ^_^
      if (signedData.status !== 'Approved') {
        const error = `Request not approved. Status: ${signedData.status}. Message: ${
          signedData.message || 'No message provided'
        }`
        throw new Error(error)
      }

      return signedData
    } catch (error) {
      return this.handleError(error, parseServerError, txData)
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
  public async approve(
    txData: ethers.TransactionRequest,
  ): Promise<ethers.TransactionRequest | { data: ethers.TransactionRequest }> {
    const signedData = (await this.getSignature(txData)) as SignedTxResponse
    try {
      const { data } = signedData
      return data
    } catch (error) {
      return this.handleError(error, () => new Error('Could not parse signature data'), txData)
    }
  }

  private validateRequiredProperties(opts: VennClientCreateOpts) {
    if (!opts.vennURL || !opts.vennPolicyAddress) {
      throw new Error('Missing required properties. Url and vennPolicyAddress are required.')
    }

    if (!this.isValidUrl(opts.vennURL)) {
      throw new Error('Invalid URL provided.')
    }

    if (!this.isValidEthereumAddress(opts.vennPolicyAddress)) {
      throw new Error('Invalid Ethereum address provided for vennPolicyAddress.')
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private isValidEthereumAddress(address: string): boolean {
    return isAddress(address)
  }

  private handleError(
    error: any,
    errorFunction: (error: unknown) => unknown,
    txData: ethers.TransactionRequest,
  ): { data: ethers.TransactionRequest } {
    if (this.strict) {
      throw errorFunction(error)
    }
    // npm unwraps the 'data' property of the object
    return { data: txData }
  }
}
