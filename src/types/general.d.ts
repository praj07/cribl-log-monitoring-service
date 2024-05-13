
// Requests
interface IRequest {
    body?: unknown,
    params?: unknown,
    query?: unknown,
};

interface IGetLogs extends IRequest {
    query: {
        lines?: number | string,
        keyword?: string
    };

    params: {
        fileName: string,
    }   
};

interface ISuccessResponse {
    isSuccessful: boolean;
    error?: string;
};

interface IGetLogsResponse extends ISuccessResponse {
    logs?: string;
};
