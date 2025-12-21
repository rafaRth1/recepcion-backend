import { Router } from 'express';
import { printCustomerReceiptController, printTicketController } from '../controllers/printer-controller';

const router = Router();

router.post('/print', printTicketController);

router.post('/print-receipt', printCustomerReceiptController);

export default router;
