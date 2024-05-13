import { Request, Response, Router } from 'express';
import { delegateToController } from './utils/wrappers';
import fs from 'fs';


const DEFAULT_NUMBER_OF_LINES = 25;
const MAX_NUMBER_OF_LINES = 500;
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
    console.log('keyword', keyword);
    if (!fileName) {
        return {
            isSuccessful: false,
            error:'Filename parameter is required.'
        };
    }

    const filePath = `${__dirname}/../../var/log/${fileName}`;

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        console.log(filePath)
        return {
            isSuccessful: false,
            error: 'File not found',
        };
    }

    const numberOfLines = Math.min((lines ? (typeof lines === 'string' ? parseInt(lines) : lines) : DEFAULT_NUMBER_OF_LINES), MAX_NUMBER_OF_LINES);
    // Open file for reading
    const fileDescriptor = fs.openSync(filePath, 'r');
    const stats = fs.fstatSync(fileDescriptor);
    const bufferSize = 64 * 1024; // 64 KB buffer size (adjust as needed)
    let buffer = Buffer.alloc(bufferSize);

    // Start reading from the end of the file
    let lastLine;
    let linesCount = 0;
    for (let offset = stats.size; offset >= 0; offset -= bufferSize) {

        let chunkSize = Math.min(bufferSize, stats.size - offset);
        let bytesReadSync = fs.readSync(fileDescriptor, buffer, 0, chunkSize, offset);
        // Convert buffer to string and split lines
        let chunk = buffer.toString('utf8', 0, bytesReadSync);
        let linesFromChunk = chunk.split('\n');
        // Concatenate last line of previous chunk with first line of current chunk
        if (lastLine && lastLine.length > 0) {
            linesFromChunk[0] += lastLine;
        }
        // Process lines in reverse order
        for (let i = linesFromChunk.length - 1; i >= 0; i--) {
            if (!linesFromChunk[i] || linesFromChunk[i].length === 0) {
                continue;
            }
            const line = linesFromChunk[i]
            if ((keyword && linesFromChunk[i].includes(keyword)) || !keyword) {
                lastLine = (lastLine ? lastLine + '\n' : '') + line
                linesCount++;
            } 
            // Check if line matches keyword

           
            if (linesCount >= numberOfLines) {
                fs.closeSync(fileDescriptor);
                return {
                    logs: lastLine || `No results for keyword ${keyword}`,
                    isSuccessful: true,
                };
            }
        }
    }

    // Close file descriptor
    fs.closeSync(fileDescriptor);

    return {
        logs: lastLine || `No results for keyword ${keyword}`,
        isSuccessful: true,
    };

}

export default BaseRouter