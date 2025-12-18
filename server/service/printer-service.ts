import { Ticket } from './../interfaces/ticket/index';
import net from 'net';

export class PrinterService {
	constructor(private printerIp: string, private printerPort: number = 9100) {}

	async printTicket(ticket: Ticket): Promise<void> {
		return new Promise((resolve, reject) => {
			const client = new net.Socket();
			client.setTimeout(5000);

			client.connect(this.printerPort, this.printerIp, () => {
				const ESC = '\x1B';
				const GS = '\x1D';

				let data = '';

				// Inicialización
				data += ESC + '@';

				// ---------------------------
				//      ENCABEZADO
				// ---------------------------
				// data += ESC + 'a' + '\x01'; // Centrar
				// data += ESC + '!' + '\x10'; // Texto grande
				// data += 'COCINA\n';
				// data += ESC + '!' + '\x00'; // Texto normal

				// Tipo de pedido
				const tipoPedido = this.getTipoPedido(ticket.type);
				data += ESC + '!' + '\x10';
				data += `*** ${tipoPedido} ***\n`;
				data += ESC + '!' + '\x00';

				data += '==========================================\n';

				// ---------------------------
				//     DATOS DEL PEDIDO
				// ---------------------------
				data += ESC + 'a' + '\x00'; // Alinear izquierda

				data += `Cliente: ${ticket.nameTicket}\n`;
				data += `Fecha: ${ticket.momentaryTime}\n`;
				data += `Pago: ${ticket.paymentType || '----'}\n`;

				data += '==========================================\n';

				// ---------------------------
				//      PLATOS
				// ---------------------------
				data += ESC + '!' + '\x10'; // Texto grande
				data += 'PLATOS:\n';
				data += ESC + '!' + '\x00';

				data += this.pad('NOMBRE', 20) + this.pad('ARR', 5) + this.pad('ENS', 5) + 'PRECIO\n';
				data += '------------------------------------------\n';

				ticket.dishes.forEach((dish) => {
					const name = dish.dishFood.slice(0, 20);
					data += this.pad(name, 20);
					data += this.pad(dish.rice ? 'Si' : 'No', 5);
					data += this.pad(dish.salad ? 'Si' : 'No', 5);
					data += `S/${dish.price.toFixed(2)}\n`;
				});

				// ---------------------------
				//      BEBIDAS
				// ---------------------------
				if (ticket.drinks && ticket.drinks.length > 0) {
					data += '\n';
					data += ESC + '!' + '\x10';
					data += 'BEBIDAS:\n';
					data += ESC + '!' + '\x00';
					data += '------------------------------------------\n';

					ticket.drinks.forEach((drink) => {
						data += this.pad(drink.name, 30);
						data += `S/${drink.price.toFixed(2)}\n`;
					});
				}

				// ---------------------------
				//      CREMAS
				// ---------------------------
				if (ticket.creams && ticket.creams.length > 0) {
					data += '\n';
					data += ESC + '!' + '\x10';
					data += 'CREMAS:\n';
					data += ESC + '!' + '\x00';
					data += '------------------------------------------\n';

					ticket.creams.forEach((cream) => {
						const cremasList = cream.creams.join(', ');
						data += `${cremasList}\n`;
					});
				}

				// ---------------------------
				//      EXCEPCIÓN
				// ---------------------------
				if (ticket.exception && ticket.exception.trim() !== '') {
					data += '\n';
					data += ESC + '!' + '\x10';
					data += '*** NOTA ***\n';
					data += ESC + '!' + '\x00';
					data += `${ticket.exception}\n`;
				}

				// ---------------------------
				//      TOTAL
				// ---------------------------
				data += '==========================================\n';
				data += ESC + 'a' + '\x02'; // Alinear derecha
				data += ESC + '!' + '\x10'; // Texto grande
				data += `TOTAL: S/${ticket.totalPrice.toFixed(2)}\n`;
				data += ESC + '!' + '\x00';

				// ---------------------------
				//      ESPACIO Y CORTE
				// ---------------------------
				data += '\n\n\n\n\n\n';
				data += GS + 'V' + '\x00'; // Cortar papel

				client.write(Buffer.from(data, 'binary'));
				client.end();
				resolve();
			});

			client.on('error', (err) => {
				reject(new Error('Error conectando a la impresora: ' + err.message));
			});

			client.on('timeout', () => {
				client.destroy();
				reject(new Error('Timeout al conectar a la impresora'));
			});
		});
	}

	private getTipoPedido(type: string): string {
		const tipos: Record<string, string> = {
			table: 'MESA',
			delivery: 'DELIVERY',
			pickup: 'PARA LLEVAR',
		};
		return tipos[type] || type.toUpperCase();
	}

	private pad(text: string, length: number): string {
		text = text || '';
		if (text.length >= length) return text.slice(0, length);
		return text + ' '.repeat(length - text.length);
	}
}
