import { Request, Response} from 'express';
import path from "node:path";

export class RootController{
    getWelcomePage = (req: Request, res: Response) : void => {
        res.status(200).sendFile(path.join(__dirname, '../../public/welcome.html'));
    }

    getFile = (req: Request, res: Response) : void => {
        const { folderName, fileName } = req.params;
        res.status(200).sendFile(path.join(__dirname, `../../public/${folderName}/${fileName}`));
    }
}