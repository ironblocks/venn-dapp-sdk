export { CanceledError } from 'axios';

export class ConnectionRefusedError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class NetworkError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class TimeoutError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class AbortedError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class BadRequestError extends Error {
    constructor(message?: string) {
        super(message);
    }
}
