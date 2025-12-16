import { Router } from 'express';
import { printTicketController } from '../controllers/printer-controller';

const router = Router();

router.post('/print', printTicketController);

export default router;
