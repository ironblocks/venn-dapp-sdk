import axios, { AxiosInstance } from 'axios'

import { type InspectTxPayload, type InspectTxResponse } from '@/types'

export type VennClientCreateOpts = {
  url: string
  policyAddress?: string
}

export class VennClient {
  public url = ''
  public policyAddress: string | undefined

  private apiInstance: AxiosInstance

  constructor(opts: VennClientCreateOpts) {
    Object.assign(this, opts)

    this.apiInstance = axios.create({ baseURL: this.url })
  }

  public async inspectTx(opts: Omit<InspectTxPayload, 'inspectOnly'>) {
    const { data } = await this.apiInstance.post<InspectTxResponse>('/signer', {
      ...opts,
      inspectOnly: true,
    })

    return data
  }
}
