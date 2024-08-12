/* 
    TYPES FOR VENN NODE LEGACY SERVER THAT WILL BE USED FOR TESTING ONLY
    DO NOT RELY ON THAT IN PRODUCTION
*/

import { ApprovedCallsPayload } from './approved-calls.types'

export type LEGACY__TxStatus = 'Approved' | 'Rejected' | 'Error'

export type LEGACY__SignedTxResponse = {
  status: LEGACY__TxStatus
  message?: string
} & ApprovedCallsPayload

export type LEGACY__SignTxRequest = {
  from: string
  to: string
  value: string
  data: string // encoded tx data
  chainId: number
  approvingPolicyAddress: string
}
