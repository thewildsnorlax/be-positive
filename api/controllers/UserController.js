/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');
//var _ = require('lodash');
//var moment = require('moment');

module.exports = {
	
	get: function (req, res) {
		sails.log.info('inside get');
		return res.ok('everything is good');
	},

	post: function (req, res) {

		const body = req.body;

		//change the date format to yyyy/mm/dd

		let user_object = {
			name: body.name,
			password: body.password,
			mobile: body.mobile,
			address: body.address,
			pincode: body.pincode,
			blood_group: body.blood_group,
			last_donation_date: body.last_donation_date,
			lat: null,
			lng: null
		}

		//find lat lng here

		User
		.create(user_object)
		.exec(function (error, userRecord) {
			
			if(error) {
				sails.log.error(error);
				return res.serverError();
			}

			return res.created(userRecord);
		});
	},

	updateContactList: function (req, res) {

		const body = req.body;

		const userId = body.id;
		let contacts = body.contacts;

		//process the contacts sent by request in below format
		//let contacts = [{mobile: '323'}, {mobile: '324'}, {mobile: '225'}, {mobile: '126'}, {mobile: '127'}, {mobile: '128'}];

		Contact
		.findOrCreate(contacts, contacts)
		.exec(function (error, contactRecords) {
			if(error) {
				sails.log.error(error);
				return res.serverError();
			}

			console.log(contactRecords);

			User
			.update({id: userId}, {contact_list: contactRecords})
			.exec(function (error, userRecord) {
				if(error) {
					sails.log.error(error);
					return res.serverError();
				}

				return res.created();
			});
		});
		
	},


};

/*

{
  "name" : "Ashish",
  "password" : "ashish",
  "mobile" : "6375280425",
  "address" : "address",
  "pincode" : "208021",
  "blood_group" : "B+",
  "last_donation_date": "2017/09/12"
}



{
  "id": "1",
  "contacts": ["123", "124", "125", "126", "127", "128", "129"]
}




*/