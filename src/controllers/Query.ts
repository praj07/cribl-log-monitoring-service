import fs from 'fs';
import {
    GENERATE_FILE_PATH
} from '../shared/constants';
import LogServices from '../services/Logs';

export async function getFilesFromLog(req: IGetLogs): Promise<IGetLogsResponse> {
    const { lines, keyword } = req.query;
    const fileName  = req.params?.fileName ?? 'default' ;


    const filePath = GENERATE_FILE_PATH(fileName) ;

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        return {
            isSuccessful: false,
            error: `File not found: ${fileName}`,
        };
    }

    const logs = LogServices.getLogsFromFile(filePath, lines, keyword);
    return {
        logs: logs,
        isSuccessful: true,
    };

}