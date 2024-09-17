/* 
    TYPES FOR VENN NODE LEGACY SERVER THAT WILL BE USED FOR TESTING ONLY
    DO NOT RELY ON THAT IN PRODUCTION
*/

export type TxStatus = 'Approved' | 'Rejected' | 'Error'

export type SignedTxData = {
  from: string
  to: string
  value: string
  data: string // encoded tx data
}

export type SignedTxResponse = {
  requestId: string
  status: TxStatus
  data: SignedTxData
  message?: string
}

export type SignTxClientRequest = SignedTxData

export type SignTxServerRequest = SignTxClientRequest & {
  chainId: number
  approvingPolicyAddress: string
  mockApproval?: boolean
}
