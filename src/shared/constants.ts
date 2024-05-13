export const DEFAULT_NUMBER_OF_LINES = 25;
export const MAX_NUMBER_OF_LINES = 500;
export const DEFAULT_LOG_FILE_NAME = 'default';
export const GENERATE_FILE_PATH = (fileName: string): string => {return `${__dirname}/../../var/log/${fileName}`}