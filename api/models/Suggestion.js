module.exports = {

	attributes: {

		id: { type: 'integer', 
		      primaryKey: true, 
		      unique: true,
		      autoIncrement: true
		},

		user: {
			model: 'User',
			required: true
		},

		parent: {
			model: 'User',
		},

		distance: {
			type: 'string'
		},

		time: {
			type: 'string'
		},

		distance_value: {
			type: 'float'
		},

		time_value: {
			type: 'float'
		},

		linked_request: {
			model: 'Request',
			required: true
		},

		status: {
			type: 'string',
			enum: ['sent', 'accepted', 'denied'],
			defaultsTo: 'sent'
		}
	}  
};