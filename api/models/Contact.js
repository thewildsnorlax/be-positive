module.exports = {

	attributes: {

		id: { type: 'integer', 
		      primaryKey: true, 
		      unique: true,
		      autoIncrement: true
		},

		owner: {
			model: 'User',
			required: true
		},

		mobile: {
			type: 'string',
			required: true
		},

		linked_users: {
			collection: 'User',
			via: 'contact_list'
		}
		
	}  
};