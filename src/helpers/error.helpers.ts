import { AxiosError, isAxiosError } from 'axios'

import { errors } from '@/errors'
import { API_ERROR_CODE, TxStatus } from '@/types'

type ResponseData = {
    message: string
    status: TxStatus
    data: unknown
}

const isLegacyServerLikeError = (error: AxiosError) =>
    typeof error === 'object' &&
    error !== null &&
    typeof error.response?.data === 'object' &&
    error.response?.data !== null &&
    ['message', 'status'].every(prop => Reflect.has(error.response?.data as object, prop))

export const parseServerError = (error: unknown) => {
    if (!isAxiosError(error)) return error
    if (!isLegacyServerLikeError(error)) return error

    const responseData = (error as AxiosError).response?.data as ResponseData
    const message = responseData.message
    const status = responseData.status

    // not sure if this is still relevant
    const _parseServerError = (message: string) => {
        const _message = message.toLowerCase()

        switch (true) {
            case _message.includes('policy'):
                return new errors.NoPolicyCallInTraceError(message)
            case _message.includes('invalid request'):
                return new errors.BadRequestError(message)
            case _message.includes('monitored assets'):
                return new errors.NoMonitoredAssetsError(message)
            default:
                return new errors.InternalError(message)
        }
    }

    switch (status) {
        case 'Rejected':
            return new errors.TxRejectedError(message)
        case 'Error':
            return _parseServerError(message)
        default:
            return new errors.InternalError(message)
    }
}

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
