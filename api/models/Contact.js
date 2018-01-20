module.exports = {

	attributes: {

		id: { type: 'integer', 
		      primaryKey: true, 
		      unique: true,
		      autoIncrement: true
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