import { Request, Response, Router } from 'express';
import fs from 'fs';
import { delegateToController } from './utils/wrappers';
import { getFilesFromLog } from '../controllers/Query'; 



const BaseRouter = Router();

BaseRouter.get(`/logs/file/:fileName`, async (req: Request, res: Response) => {
    delegateToController(
        getFilesFromLog,
        req,
        res
    )});



export default BaseRouter