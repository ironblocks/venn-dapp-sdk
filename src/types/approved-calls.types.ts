export type ApprovedCallsPayload = {
  callHashes: string[]
  expiration: string // date
  txOrigin: string
  nonce: number
  signature: string
}

export type SafeFunctionCallPayload = {
  target: string // address
  targetPayload: string // bytes
  data: string // bytes
}
