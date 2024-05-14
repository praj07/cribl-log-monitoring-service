import fs from 'fs';

import {
    DEFAULT_NUMBER_OF_LINES,
    MAX_NUMBER_OF_LINES,
} from '../../shared/constants';

export function getLogsFromFile(filePath: string, lines?: string | number, keyword?: string): string {
    let numberOfLines = Math.min(
        (lines ? (typeof lines === 'string' ? parseInt(lines) : lines) : DEFAULT_NUMBER_OF_LINES),
        MAX_NUMBER_OF_LINES
    );
    //Handling edge case of user inputing a non number in this field
    numberOfLines = isNaN(numberOfLines) ? DEFAULT_NUMBER_OF_LINES : numberOfLines;
    // Open file for reading
    const fileDescriptor = fs.openSync(filePath, 'r');
    const stats = fs.fstatSync(fileDescriptor);
    const bufferSize = 64 * 1024; // 64 KB buffer size (adjust as needed, but this is working for now)
    let buffer = Buffer.alloc(bufferSize);
    
    // Start reading from the end of the file
    let logs;
    let linesCount = 0;
    for (let offset = stats.size; offset >= 0; offset -= bufferSize) {

        let linesFromChunk = getLinesFromDataChunk(bufferSize, stats.size, offset, fileDescriptor, buffer)
        // Concatenate last line of previous chunk with first line of current chunk
        if (logs && logs.length > 0) {
            linesFromChunk[0] += logs;
        }
        // Process lines in reverse order
        for (let i = linesFromChunk.length - 1; i >= 0; i--) {    
            const line = linesFromChunk[i]

            if (!line || line.length === 0) {
                continue;
            };

            // Check if line matches keyword if we have one
            if ((keyword && line.includes(keyword)) || !keyword) {
                logs = (logs ? logs + '\n' : '') + line
                linesCount++;
            }; 
        
            if (linesCount >= numberOfLines) {
                fs.closeSync(fileDescriptor);
                return logs || '';
            };
        };
    }

    // Close file descriptor
    fs.closeSync(fileDescriptor);
    return logs || `No results for keyword ${keyword}`;

} 

function getLinesFromDataChunk(
    bufferSize: number,
    statsSize: number,
    offset: number,
    fileDescriptor: number,
    buffer: Buffer
) { 
    let chunkSize = Math.min(bufferSize, statsSize - offset);
        let bytesReadSync = fs.readSync(fileDescriptor, buffer, 0, chunkSize, offset);
        // Convert buffer to string and split lines
        let chunk = buffer.toString('utf8', 0, bytesReadSync);
        return chunk.split('\n');
}

function appendLogIfContainsKeyword( lineToCheck: string, linesCount: number, keyword?: string, lastLine?: string) {
   
}