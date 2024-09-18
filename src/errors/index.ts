import * as apiErrors from './api.errors'
import * as legacyServerErrors from './server.errors'

export const errors = {
  ...legacyServerErrors,
  ...apiErrors,
}
