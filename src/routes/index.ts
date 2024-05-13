import { Request, Response, Router } from 'express';
import { delegateToController } from './utils/wrappers';
import fs from 'fs';


const DEFAULT_NUMBER_OF_LINES = 25;
const DEFAULT_LOG_FILE_NAME = 'default';

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

const BaseRouter = Router();

// BaseRouter.get(`/logs/file/:fileName`, async (req: Request, res: Response) => {
//     delegateToController(
//         () => {},
//         req,
//         res
//     )
// });


BaseRouter.get(`/logs/file/:fileName`, async (req: Request, res: Response) => {
    delegateToController(
        getFilesFromLog,
        req,
        res)
    });

async function getFilesFromLog(req: IGetLogs): Promise<IGetLogsResponse> {
    const { lines, keyword } = req.query;
    const fileName  = req.params?.fileName ?? 'default' ;

    console.log(req.query)
    if (!fileName) {
        return {
            isSuccessful: false,
            error:'Filename parameter is required.'
        };
    }

    const filePath = `${__dirname}\\..\\..\\var\\log\\${fileName}`;

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        console.log(filePath)
        return {
            isSuccessful: false,
            error: 'File not found',
        };
    }

    const numberOfLines = lines ? (typeof lines === 'string' ? parseInt(lines) : lines) : DEFAULT_NUMBER_OF_LINES
    // Open file for reading
    const fileDescriptor = fs.openSync(filePath, 'r');
    const stats = fs.fstatSync(fileDescriptor);
    const bufferSize = 64 * 1024; // 64 KB buffer size (adjust as needed)
    let buffer = Buffer.alloc(bufferSize);

    // Start reading from the end of the file
    let lastLine = '';
    let linesCount = 0;
    for (let offset = stats.size - 1; offset >= 0; offset -= bufferSize) {
        let chunkSize = Math.min(bufferSize, stats.size - offset);
        let bytesReadSync = fs.readSync(fileDescriptor, buffer, 0, chunkSize, offset);
        // Convert buffer to string and split lines
        let chunk = buffer.toString('utf8', 0, bytesReadSync);
        let linesFromChunk = chunk.split('\n');
        // Concatenate last line of previous chunk with first line of current chunk
        console.log(linesFromChunk)
        if (lastLine) {
            linesFromChunk[0] += lastLine;
        }
        // Process lines in reverse order
        for (let i = linesFromChunk.length - 1; i >= 0; i--) {
            if (linesCount >= numberOfLines) {
                fs.closeSync(fileDescriptor);
                return {
                    logs: lastLine,
                    isSuccessful: true,
                };
            }
            let line = linesFromChunk[i];
            console.log(line);
            // Check if line matches keyword
            // if (!keyword || line.includes(keyword)) {
                lastLine =  lastLine + '\n' + line
                linesCount++;
            // }
        }
    }

    // Close file descriptor
    fs.closeSync(fileDescriptor);

    return {
        logs: lastLine,
        isSuccessful: true,
    };

}

export default BaseRouter