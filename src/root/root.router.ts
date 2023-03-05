import { Router } from 'express';
import {RootController} from "./root.controller";

const router = Router();
const rootController = new RootController();

router.get('/', rootController.getWelcomePage);
router.get('/public/:folderName/:fileName', rootController.getFile);

export default router;