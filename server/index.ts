import express from 'express';
import http from 'http';
import { Socket, Server as SocketServer, type DefaultEventsMap } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db';
import recepcionRoutes from './routes/ticket-routes';
import printerRoutes from './routes/printer-route';
import productRoutes from './routes/product-routes';
import userRoutes from './routes/user-route';
import Ticket from './models/Ticket';
import errorHandler from './middleware/error-handler';
import responseHandler from './middleware/response-handler';

dotenv.config();

const PORT = process.env.PORT || 3600;

const app = express();
app.use(express.json());

// Necesario para reemplazar __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(app);

const allowedOrigins = [
	'http://localhost:5173',
	'http://192.168.18.14:5173',
	'http://192.168.18.14:4173',
	'http://192.168.18.14:3600',
	process.env.URL_FRONTEND_DEV!,
	process.env.URL_FRONTEND_PREVIEW!,
	process.env.URL_FRONTEND_PROD!,
];
// const allowedOrigins = ['https://recepcion-app.netlify.app', 'http://localhost:5173', 'https://sz359dd5-5173.brs.devtunnels.ms'];

connectDB();

// app.use(
// 	cors({
// 		origin: function (origin, callback) {
// 			if (!origin || allowedOrigins.includes(origin)) {
// 				return callback(null, true);
// 			}
// 			return callback(new Error('CORS bloqueado por seguridad'));
// 		},
// 		credentials: true,
// 		methods: ['GET', 'POST', 'PUT', 'DELETE'],
// 		allowedHeaders: ['Content-Type', 'Authorization'],
// 		preflightContinue: false,
// 		optionsSuccessStatus: 200,
// 	})
// );

app.use((req, res, next) => {
	console.log(`REQUEST: ${req.method} ${req.url} ORIGIN: ${req.headers.origin}`);
	next();
});

app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
	})
);

app.use((req, res, next) => {
	console.log(`REQUEST: ${req.method} ${req.url} ORIGIN: ${req.headers.origin}`);
	next();
});

const io = new SocketServer(server, {
	cors: {
		origin: allowedOrigins,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true,
	},
});

const onConnection = async (socket: Socket) => {
	console.log('client connected');

	socket.on('disconnect', () => {
		console.log('client disconnected');
	});

	socket.on('handleFinishticket', async (data) => {
		try {
			const tickets = await Ticket.insertMany(data);
			socket.broadcast.emit('responseFinishTicket', tickets);
			socket.emit('responseFinishTicket', tickets);
		} catch (error) {
			console.log(new Error('Hubo un error en los datos'));
		}
	});
};

io.on('connection', onConnection);

app.use(responseHandler);

app.use('/ticket', recepcionRoutes);
app.use('/printer', printerRoutes);
app.use('/product', productRoutes);
app.use('/user', userRoutes);

app.use(errorHandler);

// app.use(express.static(path.join(__dirname, 'server/public')));

// app.all('/*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'server/public/index.html'));
// });

server.listen(
	{
		port: PORT,
		host: '0.0.0.0',
	},
	() => {
		// console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
	}
);

// server.listen(PORT, () => {
// 	console.log(`Servidor corriendo en el puerto ${PORT}`);
// });
