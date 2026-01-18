import { Request, Response } from 'express';
import { PrinterService } from '../service/printer-service';

const PRINTER_IP = '192.168.18.43';
const PRINTER_PORT = 9100;

const printerService = new PrinterService(PRINTER_IP, PRINTER_PORT);

export const printTicketController = async (req: Request, res: Response) => {
	try {
		const ticket = req.body;

		await printerService.printTicket(ticket);

		res.json({
			ok: true,
			message: 'Ticket enviado a la impresora correctamente',
		});
	} catch (error: any) {
		res.status(500).json({
			ok: false,
			error: error.message || 'Error al imprimir ticket',
		});
	}
};

export const printCustomerReceiptController = async (req: Request, res: Response) => {
	try {
		const receipt = req.body;

		await printerService.printCustomerReceipt(receipt);

		res.json({
			ok: true,
			message: 'Boleta enviada a la impresora correctamente',
		});
	} catch (error: any) {
		res.status(500).json({
			ok: false,
			error: error.message || 'Error al imprimir boleta',
		});
	}
};
