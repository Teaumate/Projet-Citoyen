// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

'facebookAuth' : {
	'clientID' 		: '', // your App ID
	'clientSecret' 	: '', // your App Secret
	'callbackURL' 	: 'http://127.0.0.1:8080/auth/facebook/callback'
},

'twitterAuth' : {
	'consumerKey' 		: '',
	'consumerSecret' 	: '',
	'callbackURL' 		: 'http://127.0.0.1:8080/auth/twitter/callback'
},

'googleAuth' : {
	'clientID' 		: '.apps.googleusercontent.com',
	'clientSecret' 	: '',
	'callbackURL' 	: 'http://127.0.0.1:8080/auth/google/callback'
}

};