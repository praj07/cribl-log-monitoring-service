/** @format */

import { Response } from 'express';


enum ERROR_TYPE {
    Internal = 'internal',
    Missing = 'does not exist',
}

export function handleError(error: Error, res: Response) {
    const message = error.message.toLowerCase();
    if (message.includes(ERROR_TYPE.Internal)) {
        res.status(500).json({ message: error.message });
    } else if (message.includes(ERROR_TYPE.Missing)) {
        res.status(404).json({ message: error.message });
    } else {
        res.status(400).json({ message: error.message });
    }

    const env = process.env.NODE_ENV || 'development';
    if (env != 'production') {
        console.log(error);
    } else {
        // Error monitoring service (Sentry)
    }
}

// TODO, for request data fields that are objects and need parsing, find a way to auto-parse before passing to controller
export async function 

delegateToController(
    controllerMethod: Function,
    requestData: unknown,
    response: Response,
) {
    try {
        const result = await controllerMethod(requestData);
        response.json(result);
    } catch (e) {
        handleError(e as Error, response);
    }
}
