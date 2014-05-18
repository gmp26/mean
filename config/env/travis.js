'use strict';

module.exports = {
	db: 'mongodb://localhost/mean-travis',
	port: 3001,
	app: {
		title: 'MEAN.JS - Travis Environment'
	},
	facebook: {
		clientID: 'APP_ID',
		clientSecret: 'APP_SECRET',
		callbackURL: 'https://cmep.maths.org/mean/auth/facebook/callback'
	},
	twitter: {
		clientID: 'CONSUMER_KEY',
		clientSecret: 'CONSUMER_SECRET',
		callbackURL: 'https://cmep.maths.org/mean/auth/twitter/callback'
	},
	google: {
		clientID: 'APP_ID',
		clientSecret: 'APP_SECRET',
		callbackURL: 'https://cmep.maths.org/mean/auth/google/callback'
	},
	linkedin: {
		clientID: 'APP_ID',
		clientSecret: 'APP_SECRET',
		callbackURL: 'https://cmep.maths.org/mean/auth/linkedin/callback'
	}
};
