let address = 'Maharaja Umaid Singh Statue Circle, Station Rd 342001., Ratanada, Jodhpur, Rajasthan'
// let address = 'Ashish SahooooooooooAshish SahooooooooooAshish SahooooooooooAshish SahooooooooooAshish SahooooooooooAshish SahooooooooooAshish SahooooooooooAshish SahooooooooooAshish SahooooooooooAshish SahooooooooooAshish SahooooooooooAshish SahooooooooooAshish Sahoooooooooo'
let postal_code = 342001

module.exports = {
	
	get: function (req, res) {
		
		MapService.geoCode(address, postal_code, function(error, location)
		{
			console.log(error)
			console.log(location)
		})

		MapService.getDistance({lat: 26.275122, lng: 73.027929}, {lat: 26.282973, lng: 73.019968}, function(error, result)
		{
			console.log(error)
			console.log(result)
		})
	}
};

