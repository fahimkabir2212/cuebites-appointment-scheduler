export class HttpError extends Error {
    status: number;
    errorDescription?: string;

    constructor(status: number, message: string, errorDescription?: string) {
        super(message);
        this.status = status;
        this.errorDescription = errorDescription ?? message;
    }
}

