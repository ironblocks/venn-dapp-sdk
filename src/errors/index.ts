import * as apiErrors from './api.errors'
import * as legacyServerErrors from './legacy-server.errors'
import * as vennClientErrors from './venn-client.errors'

export const errors = {
  ...legacyServerErrors,
  ...vennClientErrors,
  ...apiErrors,
}
