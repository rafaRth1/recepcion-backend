import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import recepcionRoutes from './routes/recepcion-routes.js';
import userRoutes from './routes/user-route.js';
import Ticket from './models/Ticket.js';

const PORT = process.env.PORT || 3600;

dotenv.config();

const app = express();

app.use(express.json());

const server = http.createServer(app);

connectDB();

// const whitelist = [process.env.URL_FRONTEND_DEV, process.env.FRONTEND_URL_PRD];

// console.log(process.env.URL_FRONTEND_DEV);
// console.log(process.env.FRONTEND_URL_PRD);

// const corsOptions = {
// 	origin: function (origin, callback) {
// 		if (whitelist.includes(origin)) {
// 			callback(null, true);
// 		} else {
// 			callback(new Error('Error de cors'));
// 		}
// 	},
// };

app.use(cors());

const io = new SocketServer(server, {
	cors: {
		origin: 'https://recepcion-app.netlify.app',
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true,
	},
});

const onConnection = async (socket) => {
	socket.on('disconnect', () => {
		console.log('client disconnected');
	});

	socket.on('handleFinishticket', async (data) => {
		try {
			const tickets = await Ticket.insertMany(data);
			socket.broadcast.emit('responseFinishTicket', tickets);
			socket.emit('responseFinishTicket', tickets);
		} catch (error) {
			const errorMsg = new Error('Hubo un error en los datos');
			console.log(errorMsg);
		}
	});
};

io.on('connection', async (socket) => onConnection(socket));

app.use('/recepcion', recepcionRoutes);
app.use('/user', userRoutes);

app.use(express.static('/server/public'));

app.get('*', (req, res) => {
	res.sendFile(__dirname + '/server/public/index.html');
});

server.listen(PORT, () => {
	console.log(`servidor corriendo en el puerto ${PORT}`);
});
