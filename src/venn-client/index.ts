import axios, { AxiosInstance } from 'axios'
import { TransactionRequest } from 'ethers'

import { errors } from '@/errors'
import { parseApiError, parseErrorMessage, parseLegacyServerError } from '@/helpers'
import {
  type ApprovedCallsPayload,
  ApprovedCallsPolicy__factory,
  FirewallConsumerBase__factory,
  type InspectTxPayload,
  type InspectTxResponse,
  type LEGACY__SignedTxResponse,
  type LEGACY__SignTxRequest,
  type SafeFunctionCallPayload,
} from '@/types'
import { ApprovedCallsPolicyInterface } from '@/types/contracts/ApprovedCallsPolicy'
import { FirewallConsumerBaseInterface } from '@/types/contracts/FirewallConsumerBase'

export type VennClientCreateOpts = {
  url: string
}

export class VennClient {
  public url = ''

  protected apiInstance: AxiosInstance
  protected approvedCallsPolicyInterface: ApprovedCallsPolicyInterface
  protected firewallConsumerInterface: FirewallConsumerBaseInterface

  constructor(opts: VennClientCreateOpts) {
    Object.assign(this, opts)

    this.apiInstance = axios.create({ baseURL: this.url })

    this.approvedCallsPolicyInterface = ApprovedCallsPolicy__factory.createInterface()
    this.firewallConsumerInterface = FirewallConsumerBase__factory.createInterface()
  }

  protected encodeApprovedCalls(data: ApprovedCallsPayload) {
    try {
      const encodedData = this.approvedCallsPolicyInterface.encodeFunctionData(
        'approveCallsViaSignature',
        [data.callHashes, data.expiration, data.txOrigin, data.nonce, data.signature],
      )

      return encodedData
    } catch (error) {
      throw new errors.FailedToEncodeApprovedCallsError(parseErrorMessage(error))
    }
  }

  protected encodeSafeFunctionCall({ target, targetPayload, data }: SafeFunctionCallPayload) {
    try {
      const encodedData = this.firewallConsumerInterface.encodeFunctionData('safeFunctionCall', [
        target,
        targetPayload,
        data,
      ])

      return encodedData
    } catch (error) {
      throw new errors.FailedToEncodeSafeFunctionCallError(parseErrorMessage(error))
    }
  }

  protected async getSignature(txData: LEGACY__SignTxRequest): Promise<ApprovedCallsPayload> {
    try {
      const { data: signedData } = await this.apiInstance.post<LEGACY__SignedTxResponse>(
        '/services/firewall/sign',
        txData,
      )

      // some errors come with 200 status ^_^
      if (signedData.status !== 'Approved') {
        throw signedData
      }

      return signedData
    } catch (error) {
      throw parseApiError(error) ?? parseLegacyServerError(error)
    }
  }

  public async inspectTx(opts: Omit<InspectTxPayload, 'inspectOnly'>) {
    try {
      const { data } = await this.apiInstance.post<InspectTxResponse>('/signer', {
        ...opts,
        inspectOnly: true,
      })

      return data
    } catch (error) {
      throw parseApiError(error) ?? parseLegacyServerError(error)
    }
  }

  public async signTx(txData: LEGACY__SignTxRequest): Promise<TransactionRequest> {
    const signedData = await this.getSignature(txData)

    const approvedPayload = this.encodeApprovedCalls(signedData)

    const wrappedTxData = this.encodeSafeFunctionCall({
      target: txData.approvingPolicyAddress,
      targetPayload: approvedPayload,
      data: txData.data,
    })

    return {
      data: wrappedTxData,
      from: signedData.txOrigin,
      to: txData.to,
      value: txData.value,
    }
  }
}
