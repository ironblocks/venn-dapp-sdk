export type InspectTxPayload = {
  requestId: string
  chainId: number
  from: string
  to: string
  data?: string
  value: string // in docs it is stated as `interface{}. WDIM?`
  // https://github.com/ironblocks/IB.Service.Go.BlockBeat?tab=readme-ov-file#1112-request-struct
  inspectOnly?: boolean
}

export type InspectTxResponse = {
  requestId: string
  approved: boolean
  metadata: OperatorResult[]
}

export type SignedTxResponse = InspectTxResponse & {
  signature: SignatureData
}

export type OperatorResult = {
  operator: string
  approved: boolean
  signature?: SignatureData
}

export type SignatureData = {
  x: string
  y: string
}
