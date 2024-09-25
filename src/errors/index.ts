import * as apiErrors from './api.errors'
import * as serverErrors from './server.errors'
import * as vennClientErrors from './venn-client.errors'

export const errors = {
    ...serverErrors,
    ...apiErrors,
    ...vennClientErrors,
}
