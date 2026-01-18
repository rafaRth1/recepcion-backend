import { CustomerReceipt } from 'interfaces/printer';
import { Ticket } from './../interfaces/ticket/index';
import net from 'net';

export class PrinterService {
	constructor(
		private printerIp: string,
		private printerPort: number = 9100,
	) {}

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
				//      PLATOS
				// ---------------------------
				data += ESC + '!' + '\x10'; // Texto grande
				data += 'PLATOS:\n';
				data += ESC + '!' + '\x00';

				data += this.pad('NOMBRE', 20) + this.pad('ARR', 5) + this.pad('ENS', 5) + 'PRECIO\n';
				data += '------------------------------------------\n';

				ticket.dishes.forEach((dish) => {
					const nameLines = this.wrapText(dish.dishFood, 20);

					// Primera línea (con columnas)
					data += this.pad(nameLines[0], 20);
					data += this.pad(dish.rice ? 'Si' : 'No', 5);
					data += this.pad(dish.salad ? 'Si' : 'No', 5);
					data += `S/${dish.price.toFixed(2)}\n`;

					// Líneas adicionales del nombre
					for (let i = 1; i < nameLines.length; i++) {
						data += this.pad(nameLines[i], 20);
						data += '\n';
					}
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

	async printCustomerReceipt(receipt: CustomerReceipt): Promise<void> {
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
				data += ESC + 'a' + '\x01'; // Centrar
				data += ESC + '!' + '\x18'; // Texto grande y negrita
				data += 'EZECHIS BURGER\n';
				data += ESC + '!' + '\x00';
				data += '\n';

				// Datos del negocio alineados a la izquierda
				data += ESC + 'a' + '\x00';
				data += 'RUC: 10482622670\n';
				data += 'Tel: 924 373 692\n';
				data += 'Sol de Villa Lt 34, Carabayllo 15318\n';
				data += '\n';
				data += `Fecha: ${receipt.date}\n`;

				if (receipt.customerName) {
					data += `Cliente: ${receipt.customerName}\n`;
				}

				data += `Mesa: ${receipt.table}\n`;
				data += `Empleado: ${receipt.employee}\n`;

				data += '----------------------------------------------\n';

				// ---------------------------
				//      TABLA DE ITEMS
				// ---------------------------
				// Encabezado de la tabla
				data += this.pad('#', 3) + this.pad('ITEM', 28) + 'IMPORTE\n';
				data += '----------------------------------------------\n';

				// Items
				receipt.items.forEach((item, index) => {
					const numero = (index + 1).toString();
					const nombre = item.description.slice(0, 28);
					const importe = item.total.toFixed(2);

					data += this.pad(numero, 3);
					data += this.pad(nombre, 28);
					data += `${importe}\n`;

					// Si hay más de 1 unidad, mostrar detalle
					if (item.quantity > 1) {
						data += this.pad('', 3);
						data += `  ${item.quantity} x S/${item.price.toFixed(2)}\n`;
					}
				});

				// ---------------------------
				//      CREMAS (SOLO DELIVERY Y PICKUP)
				// ---------------------------
				if (receipt.creams && receipt.creams.length > 0 && (receipt.type === 'DELIVERY' || receipt.type === 'PICKUP')) {
					data += '----------------------------------------------\n';
					data += ESC + '!' + '\x10'; // Texto grande
					data += 'CREMAS:\n';
					data += ESC + '!' + '\x00';
					data += `${receipt.creams.join(', ')}\n`;
				}

				// ---------------------------
				//      RESUMEN
				// ---------------------------
				data += '----------------------------------------------\n';
				data += `CANTIDAD DE ITEMS: ${receipt.items.reduce((sum, item) => sum + item.quantity, 0)}\n`;
				data += '\n';
				data += ESC + '!' + '\x10'; // Texto grande
				data += `TOTAL: S/${receipt.total.toFixed(2)}\n`;
				data += ESC + '!' + '\x00';
				data += '----------------------------------------------\n';

				// ---------------------------
				//      MENSAJE FINAL
				// ---------------------------
				data += '\n';
				data += ESC + 'a' + '\x01'; // Centrar
				data += 'GRACIAS POR SU VISITA!\n';
				data += '\n';
				data += ESC + 'a' + '\x00'; // Volver a izquierda

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
			TABLE: 'MESA',
			DELIVERY: 'DELIVERY',
			PICKUP: 'PARA LLEVAR',
		};

		return tipos[type] || type.toUpperCase();
	}

	private wrapText(text: string, maxLength: number): string[] {
		const words = text.split(' ');
		const lines: string[] = [];
		let currentLine = '';

		for (const word of words) {
			if ((currentLine + word).length <= maxLength) {
				currentLine += (currentLine ? ' ' : '') + word;
			} else {
				lines.push(currentLine);
				currentLine = word;
			}
		}

		if (currentLine) lines.push(currentLine);
		return lines;
	}

	private pad(text: string, length: number): string {
		text = text || '';
		if (text.length >= length) return text.slice(0, length);
		return text + ' '.repeat(length - text.length);
	}
}
