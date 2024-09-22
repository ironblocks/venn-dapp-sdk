export enum API_ERROR_CODE {
    connectionRefused = 'ECONNREFUSED',
    tooManyRedirects = 'ERR_FR_TOO_MANY_REDIRECTS',
    badOptionValue = 'ERR_BAD_OPTION_VALUE',
    badOption = 'ERR_BAD_OPTION',
    network = 'ERR_NETWORK',
    deprecated = 'ERR_DEPRECATED',
    badResponse = 'ERR_BAD_RESPONSE',
    badRequest = 'ERR_BAD_REQUEST',
    canceled = 'ERR_CANCELED',
    aborted = 'ECONNABORTED',
    timeout = 'ETIMEDOUT',
}
