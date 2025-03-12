export class InvalidInitParamsError extends Error {
    constructor(message?: string) {
        super(message)
    }
}

export class MissingChainIdError extends Error {
    constructor(message?: string) {
        super(message)
    }
}
