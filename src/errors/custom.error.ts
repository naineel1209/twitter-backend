import httpStatus from "http-status";

class CustomError extends Error {
    public statusMessage: string;
    public type: string = "CustomError";

    constructor(public message: string, public statusCode: number) {
        super(message);
        this.statusCode = statusCode;

        const statusMessageIndex = `${statusCode}_MESSAGE`;
        this.statusMessage = (httpStatus as any)[statusMessageIndex]
    }
};

export default CustomError;