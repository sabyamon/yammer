var http = require('http');
var url = require('url');

var databaseUrl = "test";
// "username:password@example.com/mydb"
var collections = ["photo_info", "user_info"];
var db = require("mongojs").connect(databaseUrl, collections);

// Removing a row in MongoDB ::
// db.user_info.remove({name:'Sabya'}) -- it will remove everything that contains name == Sabya

var server = http.createServer(function(req, res) {
	// This is the sample URL for Insert::  http://localhost:8985/?action=insert&name=checker1&email=checker@gmail.com&gender=male&authCode=12345
	var queryData = url.parse(req.url, true).query;
	//console.log(queryData) ;
	var action = queryData.action;
	var name = queryData.name;
	var email = queryData.email;
	var gender = queryData.gender;
	var authCode = queryData.authCode;

	// Extracting params for photo related stuffs.
	var photoTitle = queryData.photoTitle;
	var uploader = queryData.uploader;
	var photoURL = queryData.photoURL;
	var rank = queryData.rank;

	if (action === 'insert') {
		res.writeHead(200, 'content-type:text/plain');
		if (name && email && gender && authCode === '12345') {
			db.user_info.save({
				email : email,
				name : name,
				sex : gender
			}, function(err, saved) {
				if (err || !saved)
					console.log("User not saved");
				else
					console.log("User saved");
			});
			res.end('Hey ' + name + ' !! Welcome to thekker !! ');
		} else {
			console.log('User trying to fool us !! Beware dude !! ');
			res.end('Acting smart ?? aah ?? ');
		}
	} else if (action === 'getAllUsers') {
		var userArr = [];
		console.log('Getting all the user details');
		db.user_info.find(function(err, users) {
			if (err || !users) {
				console.log("No Male users found");
			} else {
				users.forEach(function(maleUser) {
					userArr.push(maleUser);
				});
				console.log(userArr);
				res.write(JSON.stringify({
					users : userArr,
				}));
				res.end();
			}
		});
	} else if (action === 'getUserByEmail') {
		var userArr = [];
		console.log('Getting user detail provided his/her email id');
		db.user_info.find({
			email : email
		}, function(err, users) {
			if (err || !users) {
				console.log("No Male users found");
			} else {
				users.forEach(function(maleUser) {
					userArr.push(maleUser);
				});
				res.write(JSON.stringify({
					users : userArr,
				}));
				res.end();
			}
		});
	} else if (action === 'uploadPhoto') {

		//		http://localhost:8985/?action=uploadPhoto&photoTitle=Testing%20Photo&uploader=sabyamon@gmail.com&photoURL=www.google.com&rank=1&authCode=12345
		console.log('Uploading a photo');
		var photoTitle = queryData.photoTitle;
		var uploader = queryData.uploader;
		var photoURL = queryData.photoURL;
		var rank = queryData.rank;

		if (photoTitle && uploader && photoURL && rank && authCode === '12345') {
			db.photo_info.save({
				photoTitle : photoTitle,
				photo_uploader : uploader,
				photoURL : photoURL,
				photo_rank : rank
			}, function(err, saved) {
				if (err || !saved)
					console.log("Photo not saved");
				else
					console.log("Photo saved");
			});
			res.end('Hey ' + photoTitle + ' !! Photo has been uploaded successfully !! ');
		} else {
			console.log('User trying to fool us !! Beware dude !! ');
			res.end('Acting smart ?? aah ?? ');
		}

	} else if (action === 'getAllPhotos') {
		var photoArr = [];
		console.log('Getting all the Photo details');
		db.photo_info.find(function(err, photos) {
			if (err || !photos) {
				console.log("No Photo Found");
			} else {
				photos.forEach(function(photo) {
					photoArr.push(photo);
				});
				console.log(photoArr);
				res.write(JSON.stringify({
					photo : photoArr,
				}));
				res.end();
			}
		});
	} else {
		res.end('Whatta **** is this ??');
	}
}).listen(8985);
console.log('Server is running on 8985'); 