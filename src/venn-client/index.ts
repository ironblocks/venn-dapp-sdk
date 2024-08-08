import axios, { AxiosInstance } from 'axios'
import { TransactionRequest } from 'ethers'

import {
  type ApprovedCallsPayload,
  ApprovedCallsPolicy__factory,
  FirewallConsumerBase__factory,
  type InspectTxPayload,
  type InspectTxResponse,
  type LEGACY__SignedTxResponse,
  type LEGACY__SignTxRequest,
  SafeFunctionCallPayload,
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
    return this.approvedCallsPolicyInterface.encodeFunctionData('approveCallsViaSignature', [
      data.callHashes,
      data.expiration,
      data.txOrigin,
      data.nonce,
      data.signature,
    ])
  }

  protected encodeSafeFunctionCall({ target, targetPayload, data }: SafeFunctionCallPayload) {
    return this.firewallConsumerInterface.encodeFunctionData('safeFunctionCall', [
      target,
      targetPayload,
      data,
    ])
  }

  public async inspectTx(opts: Omit<InspectTxPayload, 'inspectOnly'>) {
    const { data } = await this.apiInstance.post<InspectTxResponse>('/signer', {
      ...opts,
      inspectOnly: true,
    })

    return data
  }

  public async signTx(txData: LEGACY__SignTxRequest): Promise<TransactionRequest> {
    const { data: signedData } = await this.apiInstance.post<LEGACY__SignedTxResponse>(
      '/services/firewall/sign',
      txData,
    )

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
