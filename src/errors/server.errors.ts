export class TxRejectedError extends Error {
    constructor(message?: string) {
        super(message)
    }
}

export class NoPolicyCallInTraceError extends Error {
    constructor(message?: string) {
        super(message)
    }
}

export class NoMonitoredAssetsError extends Error {
    constructor(message?: string) {
        super(message)
    }
}

export class InternalError extends Error {
    constructor(message?: string) {
        super(message)
    }
}
