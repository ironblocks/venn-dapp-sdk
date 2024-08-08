/* 
    TYPES FOR VENN NODE LEGACY SERVER THAT WILL BE USED FOR TESTING ONLY
    DO NOT RELY ON THAT IN PRODUCTION
*/

import { ApprovedCallsPayload } from './approved-calls.types'

export type LEGACY__SignedTxResponse = ApprovedCallsPayload

export type LEGACY__SignTxRequest = {
  from: string
  to: string
  value: string
  data: string // encoded tx data
  chainId: number
  approvingPolicyAddress: string
}
