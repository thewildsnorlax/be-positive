module.exports = {

	attributes: {

		id: { type: 'integer', 
		      primaryKey: true, 
		      unique: true,
		      autoIncrement: true
		},

		name : { 
		    type: 'string',
		    required:true,
		    minLength: 2,
		    maxLength: 256
		},

		password : { 
		    type: 'string',
		    required:true,
		    minLength: 1,
		    maxLength: 30 
		},

		mobile: {
			type: 'string',
			required: true
		},

		address : { 
		    type: 'text',
		    required:true 
		},

		blood_group: {
			type: 'string',
			required: true
		},

		last_donation_date : { 
		    type: 'date'
		},

		contact_list: {
			collection: 'Contact',
  			via: 'linked_users'
		},

		latitute: {
			type: 'float'
		},

		longitude: {
			type: 'float'
		}
	}  
};