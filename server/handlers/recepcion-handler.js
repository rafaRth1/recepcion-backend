import Ticket from '../models/Ticket';

const getTickets = async (req = Request, res = Response) => {
	const tickets = await Ticket.find().select('-createdAt -updatedAt -__v');
	res.json(tickets);
};

const addTicket = async (req, res) => {
	try {
		const tickets = await Ticket.insertMany(req.body);
		res.json(tickets);
	} catch (error) {
		const errorMsg = new Error('Hubo un error en los datos');
		res.status(409).json({ msg: errorMsg.message });
	}
};

export { getTickets, addTicket };
