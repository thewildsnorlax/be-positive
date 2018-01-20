/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const async = require('async');
const moment = require('moment')
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
		let contactArray = body.contacts;

		//process the contacts sent by request in below format
		//let contacts = [{mobile: '323'}, {mobile: '324'}, {mobile: '225'}, {mobile: '126'}, {mobile: '127'}, {mobile: '128'}];

		let contacts = [];

		contactArray.forEach(function (contact) {

			let object = {
				mobile: contact
			}

			contacts.push(object);
		});

		console.log(contacts);

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

		Request
		.find({user: userId})
		.sort('createdAt DESC')
    	.limit(1)
		.populate('donor_list')
		.exec(function (error, requestRecord) {

			if(error) {
				sails.log.error('error');
				return res.serverError();
			}

			if(requestRecord.length == 0) {
				sails.log.info('you have made no requests yet!');
				return res.ok([]);
			}

			let objectArray = [];

			requestRecord = requestRecord[0];

			let donor_list = requestRecord.donor_list;

			let donorIds = [];

			donor_list.forEach(function (donor) {
				donorIds.push(donor.id);
			});

			Suggestion
			.find({id: donorIds})
			.populate('user')
			.populate('parent')
			.exec(function (error, donors) {

				if(error) {
					sails.log.error(error);
					return res.serverError();
				}

				let response = [];

				donors.forEach(function (donor) {
					
					let object = {
						donor_name : null,
						link : null,
						mobile : null,
						distance : null,
						time : null,
						status : null,
					}

					object.donor_name = donor.user.name;

					if(donor.parent) {
						object.link = donor.parent.mobile;
					}
					else {
						object.link = 'your contact';
					}

					if(donor.status == 'accepted') {
						object.mobile = donor.user.mobile;
					}
					else {
						object.mobile = 'hidden';
					}

					object.distance = donor.distance;
					object.time = donor.time;
					object.status = donor.status; 

					response.push(object);
				});

				return res.ok(response);
			});
		});
	},

	makeRequest: function(req, res)
	{
		const userId = req.body.id
		const userBloodGroup = req.body.blood_group
		const hospitalName = req.body.hospital_name
		const hospitalAddress = req.body.hospital_address
		const urgency = req.body.urgency

		let firstHopContacts = null
		let secondHopContacts = null
		let userLocation = null

		User.findOne({id: userId})
		.then(function(user)
		{
			userLocation = {lat: user.lat, lng: user.lng}
			return getNextHop(userId)
		})
		.then(function(users)
		{
			// First hop contacts
			firstHopContacts = users

			// Obtain second hop contacts for these users
			return getContacts(users)
		})
		.then(function(users)
		{
			// Second hop contacts
			secondHopContacts = users

			// Flatten second hop contacts array
			secondHopContacts = [].concat.apply([], secondHopContacts)

			// Calculate latest eligible donation date
			let latestEligibleDate = moment().subtract(3, 'months').toDate()

			// Filter both set of contacts by last donated and blood group
			firstHopContacts = firstHopContacts.filter(function(contact) {return (contact.blood_group == userBloodGroup && contact.last_donation_date < latestEligibleDate)})
			secondHopContacts = secondHopContacts.filter(function(contact) {return (contact.blood_group == userBloodGroup && contact.last_donation_date < latestEligibleDate)})

			firstHopContacts.forEach(function(contact) {contact.parent = null})

			contacts = firstHopContacts.concat(secondHopContacts)

			let contactPromises = contacts.map(function(contact) {return reflectPromise(assignDistance(contact, userLocation))})
			return Promise.all(contactPromises)
		})
		.then(function(contacts)
		{
			contacts.sort(function(c1, c2)
			{
				if(c1.duration_value < c2.duration_value)
				{
					return -1
				}

				if(c1.duration_value > c2.duration_value)
				{
					return 1
				}

				return 0
			})

			contacts = contacts.slice(0,5)

			let donors = []

			contacts.forEach(function(contact)
			{
				let suggestion = 
				{
					user: contact.id,
					parent: contact.parent,
					distance: contact.distance_text,
					distance_value: contact.distance_value,
					time: contact.duration_text,
					time_value: contact.duration_value,
					status: 'sent'
				}

				donors.push(suggestion)
			})

			let request = 
			{
				user: userId,
				hospital_name: hospitalName,
				hospital_address: hospitalAddress,
				blood_group: userBloodGroup,
				urgency: urgency,
				donor_list: donors
			}

			return Request.create(request)
		})
		.then(function(request)
		{
			console.log(request)
			return res.created(request)
		})
		.catch(function(error)
		{
			console.log(error)
			return res.serverError('Something went wrong')
		})
	}	
};

function assignDistance(contact, location)
{
	return new Promise(function(resolve, reject)
	{
		MapService.getDistance({lat: contact.lat, lng: contact.lng}, location, function(error, output)
		{
			if(error)
			{
				return reject(error)
			}

			else
			{
				contact['distance_text'] = output.distance.text
				contact['distance_value'] = output.distance.value
				contact['duration_text'] = output.duration.text
				contact['duration_value'] = output.duration.value

				return resolve(contact)
			}
		})
	})
}

function getContacts(users)
{
	let userPromises = users.map(function(user) {return reflectPromise(getNextHop(user.id))})
	return Promise.all(userPromises)
}

function getNextHop(userId)
{
	return new Promise(function(resolve, reject)
	{
		// Find the user, populate contacts
		User.findOne({id: userId})
		.populate('contact_list')
		.then(function(user)
		{
			// Find mobile numbers in his contacts
			let userContacts = user.contact_list
			let mobileNumbers = userContacts.map(function(contact) {return contact.mobile})
			return mobileNumbers
		})
		.then(function(mobileNumbers)
		{
			// Fetch users correcponding to mobile numbers
			return User.find({mobile: mobileNumbers})
		})
		.then(function(users)
		{
			// Set parent as calling user
			for(i = 0; i < users.length; i++)
			{
				users[i]['parent'] = userId
			}
			return resolve(users)
		})		
		.catch(function(error)
		{
			return reject(error)
		})
	})
}

// Pattern to handle the problem in which we need to wait for an array of promises to complete,
// irrespective of resolve or reject (success or error). Promise.all does not provide this 
// functionality, hence this method acts as a wrapper.
function reflectPromise(promise)
{
	// sails.log.info('Inside reflect promise method')
	return new Promise(function(resolve, reject)
	{
		promise
		.then(function(resolveValue)
		{
			// sails.log.info('Reflecting promise after resolve')
			// Resolve the promise with correct return value
			return resolve(resolveValue)
		})
		.catch(function(error)
		{
			// sails.log.info('Reflecting promise after reject')
			// Resolve the promise with error
			return resolve(error)
		})
	})
}

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