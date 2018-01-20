module.exports = {

	attributes: {

		id: { type: 'integer', 
		      primaryKey: true, 
		      unique: true,
		      autoIncrement: true
		},

		user : { 
		    model: 'User',
		    required: true
		},

		hospital_name: {
			type: 'string',
			required: true
		}

		hospital_address: { 
		    type: 'text',
		    required: true 
		},

		blood_group: {
			type: 'string',
			required: true
		},

		urgency: { 
		    type: 'string'
		},

		donor_list: {
			collection: 'Suggestion',
  			via: 'linked_request'
		}
	}  
};