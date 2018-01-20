const COUNTRY = 'IN'

const GoogleMapsAPI = require('googlemaps')

let publicConfig = {
	key: 'AIzaSyDGblJ1p3xsBY2gmtI5ekhly5dqf--ZI5A',
	stagger_time:       1000, // for elevationPath 
	encode_polylines:   false
}

let gmAPI = new GoogleMapsAPI(publicConfig)

module.exports = 
{
	geoCode: function(address, postal, cb)
	{
		let geocodeParams = {
			address:    address,
			components: 'components=country:IN',
			language:   'en',
			region:     'uk'
		}

		gmAPI.geocode(geocodeParams, function(err, result){
			
			if(!err && result.status == 'OK' && result.results && result.results.length > 0)
			{
				if(result.results[0] && result.results[0].geometry)
				{
					let location = result.results[0].geometry.location
					return cb(null, location)
				} 
			}

			else
			{
				return cb(new Error('Could not geocode address'), null)
			}
		})					
	},

	getDistance: function(start, end, cb)
	{
		start = (start.lat + ', ' + start.lng)
		end = (end.lat + ', ' + end.lng)

		let distanceParams = {
			origins: start,
			destinations: end
		}

		gmAPI.distance(distanceParams, function(err, result)
		{
			if(!err && result.rows && result.rows[0] && result.rows[0].elements && result.rows[0].elements[0])
			{
				return cb(null, result.rows[0].elements[0])
			}

			else
			{
				return cb(new Error('Could not calculate distance'), null)
			}			
		})
	}
}