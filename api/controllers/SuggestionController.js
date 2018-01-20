/**
 * SuggestionController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');
//var _ = require('lodash');
//var moment = require('moment');

module.exports = {
	
	getNotification: function (req, res) {
		
		const userId = req.query.id;

		Suggestion
		.find({user: userId, status: 'sent'})
		.populate('parent')
		.populate('linked_request')
		.exec(function (error, records) {

			if(error) {
				sails.log.error(error);
				return res.serverError();
			}

			if(records.length == 0) {
				sails.log.info('no new notification');
				return res.ok([]);
			}

			var response = []

			async.each(records,
			function (record, cb) {

				var object = {
					id: record.id,
					name : null,
					mobile : null,
					link : null,
					hospital_name : record.linked_request.hospital_name,
					hospital_address: record.linked_request.hospital_address,
					urgency : record.linked_request.urgency,
					distance : record.distance,
					time : record.time,
				}

				User
				.findOne({id: record.linked_request.user})
				.exec(function (error, requestor) {

					if(error) {
						cb(error);
					}


					object.name = requestor.name;
					object.mobile = requestor.mobile;

					if(record.parent) {
						object.link = record.parent.mobile;
					}
					else {
						object.link = 'your contact'
					}
					
					response.push(object);
					cb()
				});
			},
			function (error) {

				if(error) {
					sails.log.error(error);
					return res.serverError();
				}

				console.log(response);
				return res.ok(response);
			});
		});
	},

	updateStatus: function (req, res) {

		let id = req.body.id;
		let status = req.body.status;

		Suggestion
		.update({id: id}, {status: status})
		.exec(function (error, record) {

			if(error) {
				sails.log.error(error);
				return res.serverError();
			}

			return res.ok(record);
		});
	}


};