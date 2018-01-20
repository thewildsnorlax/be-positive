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

	dummy: function (req, res) {
		sails.log.info('inside post');
		return res.ok('mast chal raha hai be');
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

		MapService.geoCode(user_object.address, user_object.pincode, function (error, location) {

			if(error) {
				sails.log.error(error);
				return res.serverError();
			}

			user_object.lat = location.lat;
			user_object.lng = location.lng;

			User
			.create(user_object)
			.exec(function (error, userRecord) {
				
				if(error) {
					sails.log.error(error);
					return res.serverError();
				}

				return res.created(userRecord);
			});	
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

	getStatus: function (req, res) {

		const userId = req.query.id;

		request
		.find({user: userId})
		.populate('donor_list')
		.exec(function (error, requestRecords) {

			if(error) {
				sails.log.error('error');
				return res.serverError();
			}

			if(requestRecords.length == 0) {
				sails.log.info('you have made no requests yet!');
				return response.ok([]);
			}

			

		});
	}
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