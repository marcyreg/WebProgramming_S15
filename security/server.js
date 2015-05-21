// Initialization
var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator'); // See documentation at https://github.com/chriso/validator.js
var app = express();
// See https://stackoverflow.com/questions/5710358/how-to-get-post-query-in-express-node-js
app.use(bodyParser.json());
// See https://stackoverflow.com/questions/25471856/express-throws-error-as-body-parser-deprecated-undefined-extended
app.use(bodyParser.urlencoded({ extended: true }));

// Mongo initialization; mmap is the name of my MongoDB database.  Collection is named "locations"
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mmap';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});

app.post('/sendLocation', function(request, response) {
	// Enabling CORS
	// See http://stackoverflow.com/questions/11181546/node-js-express-cross-domain-scripting
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");

	// Whitelist for class
	//var whitelist = ['mchow','CindyLytle','BenHarris','JeremyMaletic','LeeMiller','EricDapper','RichRumfelt','VanAmmerman','VicJohnson','ErinHolleman','PatFitzgerald','CheriVasquez','HarleyRhoden','JanetGage','HarleyConnell','GlendaMaletic','JeffSoulen','MarkHair','RichardDrake','CalvinStruthers','LeslieDapper','JefflynGage','PaulRamsey','BobPicky','RonConnelly','FrancieCarmody','ColleenSayers','TomDapper','MatthewKerr','RichBiggerstaff','MarkHarris','JerryRumfelt','JoshWright','LindyContreras','CameronGregory','MarkStruthers','TravisJohnson','RobertHeller','CalvinMoseley','HawkVasquez','LayneDapper','HarleyIsdale','GaylaSoulen','MatthewRichards','RoyDuke','GaylaRodriquez','FrancieGeraghty','LisaLytle','ErinHair','CalvinGraham','VanRhoden','KeithRumfelt','GlendaSmith','KathrynJohnson','FredVandeVorde','SheriMcKelvey','RoyMiller','PatIsdale','JoseRodriquez','KelleyRumfelt','JanetKinsey','RonCampbell','BenKerr','RobDennison','BobOwens','CherylLytle','LisaSoulen','TravisDuke','CindyGregory','JoyceVandeVorde','MatthewScholl','RobJohnson','EricHawthorn','CameronRodriquez','JoshRamsey','CalvinDuke','SheriHeller','LeaAmmerman','LayneVasquez','IMConnell','BenHauenstein','ColleenKerr','HawkRichards','LeaIsdale','RickSoulen','RoyMcFatter','KyleContreras','MaryHeller','KathrynFitzgerald','JanetRiedel','PatHawthorn','KeithHauenstein','BenRichards','RickVasquez','KelleyAmmerman','EvanConnelly','KendallRumfelt','TravisIsdale','RobContreras','JavierRussell','ColleenCampbell','JeremyConnelly','BenKinsey','JanetScholl','PaulaLewis','LeslieMcFatter','MatthewMcAda','LeeMuilman','KyleMoseley','JeffRhoden','AnitaHolleman','JefflynMcKelvey','BobContreras','RobFitzgerald','BenJohnson'];
	var login = request.body.login;
	var lat = request.body.lat;
	var lng = request.body.lng;

	//if (whitelist.indexOf(login) != -1 && login != undefined && lat != undefined && lng != undefined && validator.isAlpha(login) && validator.isFloat(lat) && validator.isFloat(lng)) {
	if (login != undefined && lat != undefined && lng != undefined && validator.isAlpha(login) && validator.isFloat(lat) && validator.isFloat(lng)) {
		lat = parseFloat(lat);
		lng = parseFloat(lng);
		if (lat >= -90.0 && lat <= 90 && lng >= -180 && lng <= 180) {
			var toInsert = {
				"login":login,
				"lat":lat,
				"lng":lng,
				"created_at":new Date()
			};
			db.collection('locations', function(error, collection) {
				collection.update({"login":login}, toInsert,  { upsert: true }, function (errorUpdate, result) {
					if (!error) {
						collection.find().sort({"_id":-1}).toArray(function(errorQuery, results) {
							if (!errorQuery) {
								response.send(results);
							}
							else {
								response.send('{"error":"Whoops, something is wrong with the database connection"}');
							}
						});
					}
					else {
						response.send('{"error":"Whoops, something is wrong with the database connection"}');
					}
				});
			});
		}
		else {
			response.send('{"error":"Whoops, something is wrong with your data!"}');
		}
	}
	else {
		response.send('{"error":"Whoops, something is wrong with your data!"}');
	}
});

app.get('/location.json', function(request, response) {
	var loginEntry = request.query.login;
	if (loginEntry == undefined || loginEntry == null) {
		response.send("{}");
	}
	else {
		db.collection('locations', function(error, collection) {
			collection.findOne({login:loginEntry}, function(error, result) {
				if (!result) {
					response.send("{}");
				}
				else {
					response.send(result);
				}
			});
		});
	}
});

app.get('/', function(request, response) {
	response.set('Content-Type', 'text/html');
	var indexPage = '';
	db.collection('locations', function(error, collection) {
		collection.find().sort({"_id":-1}).toArray(function(error, results) {
			if (!error) {
				indexPage += "<!DOCTYPE HTML><html><head><title>Not Foursquare</title></head><body><h1>Not Foursquare</h1><ul>";
				if (results.length == 0) {
					indexPage += "<li>No check-ins</li>";
				}
				else {
					for (var count = 0; count < results.length; count++) {
						indexPage += "<li>" + results[count].login + " checked in at " + results[count].lat + ", " + results[count].lng + " on " + results[count].created_at + "</li>";
					}
				}
				indexPage += "</ul></body></html>"
				response.send(indexPage);
			} else {
				response.send('<!DOCTYPE HTML><html><head><title>Not Foursquare</title></head><body><h1>Not Foursquare</h1><p>Whoops, something went terribly wrong!</p></body></html>');
			}
		});
	});
});

// Oh joy! http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
app.listen(process.env.PORT || 3000);
