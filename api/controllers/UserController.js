/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
	get: function (req, res) {
		sails.log.info('inside get');
		return res.ok('everything is good');
	},

	post: function (req, res) {

	}
};

