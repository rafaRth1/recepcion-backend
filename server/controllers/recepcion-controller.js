import Ticket from '../models/Ticket.js';

const getTickets = async (req = Request, res = Response) => {
	const tickets = await Ticket.find().select('-createdAt -updatedAt -__v');
	res.json(tickets);
};

const getTicketsUser = async (req = Request, res = Response) => {
	const tickets = await Ticket.find({ user: req.params.id }).select('-createdAt -updatedAt -__v');
	res.json(tickets);
};

const addTicket = async (req, res) => {
	console.log(req.body);

	// try {
	// 	const tickets = await Ticket.insertMany(req.body);
	// 	res.json(tickets);
	// } catch (error) {
	// 	const errorMsg = new Error('Hubo un error en los datos');
	// 	res.status(409).json({ msg: errorMsg.message });
	// }
};

const editTicket = async (req = Request, res = Response) => {
	const { id } = req.params;
	const ticket = await Ticket.findById(id);

	ticket.status = 'completed';

	try {
		await ticket.save();
		res.json({ msg: 'Ticket completado' });
	} catch (error) {
		console.log(error);
	}
};

const deleteTicket = async (req = Request, res = Response) => {
	const { id } = req.params;
	await Ticket.deleteOne({
		_id: id,
	});

	res.json({ msg: 'Ticket eliminado' });
};

export { addTicket, getTickets, getTicketsUser, editTicket, deleteTicket };
