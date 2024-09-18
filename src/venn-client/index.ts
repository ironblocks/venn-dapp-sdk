import axios, { AxiosInstance } from 'axios'
import { isAddress } from 'ethers'

import { parseLegacyServerError } from '@/helpers'
import {
  SignedTxData,
  type SignedTxResponse,
  SignTxClientRequest,
  SignTxServerRequest,
} from '@/types'

export type VennClientCreateOpts = {
  vennURL: string
  approvingPolicyAddress: string
  chainId: number
  strict?: boolean
}

export class VennClient {
  protected url: string

  protected approvingPolicyAddress: string

  protected chainId: number

  protected apiInstance: AxiosInstance

  protected strict: boolean

  /**
   * Creates a new VennClient instance.
   * @param {string} opts.url - The URL of the Singer API.
   * @param {string} opts.approvingPolicyAddress - The address of the approved calls policy.
   * @param {number} opts.chainId - The chain ID of the network.
   * @param {boolean} [opts.strict=true] - Optional. Whether to throw an error if the response from the signer is not 'Approved'. Defaults to true. If set to false, will return the request data on failure.
   * @throws {Error} If any required property is missing.
   */
  constructor(opts: VennClientCreateOpts) {
    this.validateRequiredProperties(opts)

    this.url = opts.vennURL
    this.approvingPolicyAddress = opts.approvingPolicyAddress
    this.chainId = opts.chainId
    this.strict = opts.strict ?? true

    this.apiInstance = axios.create({ baseURL: this.url })
  }

  protected async getSignature(
    txData: SignTxClientRequest,
  ): Promise<SignedTxResponse | { data: SignTxClientRequest } | undefined> {
    const requestData: SignTxServerRequest = {
      ...txData,
      chainId: this.chainId,
      approvingPolicyAddress: this.approvingPolicyAddress,
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
      return this.handleError(error, parseLegacyServerError, txData)
    }
  }

  public async approve(
    txData: SignTxClientRequest,
  ): Promise<SignedTxData | { data: SignTxClientRequest }> {
    const signedData = (await this.getSignature(txData)) as SignedTxResponse
    try {
      const { data } = signedData
      return data
    } catch (error) {
      return this.handleError(error, () => new Error('Could not parse signature data'), txData)
    }
  }

  private validateRequiredProperties(opts: VennClientCreateOpts) {
    if (!opts.vennURL || !opts.approvingPolicyAddress || !opts.chainId) {
      throw new Error(
        'Missing required properties. url, approvingPolicyAddress, and chainId are required.',
      )
    }

    if (!this.isValidUrl(opts.vennURL)) {
      throw new Error('Invalid URL provided.')
    }

    if (!this.isValidEthereumAddress(opts.approvingPolicyAddress)) {
      throw new Error('Invalid Ethereum address provided for approvingPolicyAddress.')
    }

    if (!this.isValidChainId(opts.chainId)) {
      throw new Error('Invalid chainId. Must be a positive integer.')
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

  private isValidChainId(chainId: number): boolean {
    return Number.isInteger(chainId) && chainId > 0
  }

  private handleError(
    error: any,
    errorFunction: (error: unknown) => unknown,
    txData: SignTxClientRequest,
  ): { data: SignTxClientRequest } {
    if (this.strict) {
      throw errorFunction(error)
    }
    // npm unwraps the 'data' property of the object
    return { data: txData }
  }
}
