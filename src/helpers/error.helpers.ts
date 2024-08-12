import { isAxiosError } from 'axios'

import { errors } from '@/errors'
import { API_ERROR_CODE, LEGACY__TxStatus } from '@/types'

type LegacyServiceLikeError = {
  message: string
  status: LEGACY__TxStatus
}

const isLegacyServerLikeError = (data: unknown): data is LegacyServiceLikeError =>
  typeof data === 'object' &&
  data !== null &&
  ['message', 'status'].every(prop => Reflect.has(data, prop))

export const parseLegacyServerError = (error: unknown) => {
  if (!isLegacyServerLikeError(error)) return error

  const parseServerError = ({ message }: LegacyServiceLikeError) => {
    const _message = message.toLowerCase()

    switch (true) {
      case _message.includes('policy call'):
        return new errors.LEGACY__NoPolicyCallInTraceError(message)
      case _message.includes('invalid request'):
        return new errors.BadRequestError(message)
      case _message.includes('monitored assets'):
        return new errors.LEGACY__NoMonitoredAssetsError(message)
      default:
        return new errors.LEGACY__InternalError(message)
    }
  }

  switch (error.status) {
    case 'Rejected':
      return new errors.LEGACY__TxRejectedError(error.message)
    case 'Error':
      return parseServerError(error)
    default:
      return new errors.LEGACY__InternalError(error.message)
  }
}

export const parseErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

export const parseApiError = (error: unknown) => {
  if (!isAxiosError(error)) return null

  switch (error.code) {
    case API_ERROR_CODE.connectionRefused:
      return new errors.ConnectionRefusedError(error.message)
    case API_ERROR_CODE.network:
      return new errors.NetworkError(error.message)
    case API_ERROR_CODE.timeout:
      return new errors.TimeoutError(error.message)
    case API_ERROR_CODE.aborted:
      return new errors.AbortedError(error.message)
    case API_ERROR_CODE.badRequest:
      return new errors.BadRequestError(error.message)
    default:
      return null
  }
}
