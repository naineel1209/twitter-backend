import e from "express";
import httpStatus from "http-status";

class CustomError extends Error {
    public statusMessage: string;

    constructor(public message: string, public statusCode: number) {
        super(message);
        this.statusCode = statusCode;

        const statusMessageIndex = `${statusCode}_MESSAGE`;
        this.statusMessage = (httpStatus as any)[statusMessageIndex] || message;
    }
}

export default CustomError;