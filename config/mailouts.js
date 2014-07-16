'use strict';

var nodemailer = require('nodemailer'),
    config = require('./config'),
    production = process.env.NODE_ENV === 'production',
    sender = production ? 'cmep@maths.org' : 'gmp26@cam.ac.uk',
    smtpTransport;

if (production) {
    smtpTransport = nodemailer.createTransport('SMTP');
} else {
    smtpTransport = nodemailer.createTransport('SMTP', {
        host: 'smtp.hermes.cam.ac.uk',
        port: 587,
        debug: true,
        auth: {
            user: process.env.crsid,
            pass: process.env.hermesPassword
        }
    });
}

module.exports = {

    sendMail: smtpTransport.sendMail,

    sendOneTimePassword: function(toEmail, oneTimePassword) {
        return {
            from: sender,
            to: toEmail,
            subject: 'CMEP Password Reset Request',
            html: '<p>We received a password reset request for your CMEP account.</p>' +
                '<p>A new password has been generated for you which is good ' +
                'for one sign-in only within the next hour. ' +
                'Your one-time password is</p>' +
                '<div style="font-weight:bold;font-size:1.8em">' + oneTimePassword + '</div>' +
                '<p>Please sign in with this password. ' +
                'You will then be redirected to a page where you can choose a new password</p>' +
                '<p>If this password has already expired, you will be given an opportunity to request another.</p>'
        };
    },

    newCommentNotification: function(toEmail, recipients, url, commenter, markdown) {
        return {
            from: sender,
            to: recipients,
            subject: 'New comment at ' + url + ' from ' + commenter,
            text: markdown
        };
    },

    newReplyNotification: function(toEmail, recipients, url, commenter, markdown) {
        return {
            from: sender,
            to: recipients,
            subject: 'New comment at ' + url + ' from ' + commenter,
            text: markdown
        };
    },

    editNotification: function(toEmail, recipients, url, commenter, markdown) {
        return {
            from: sender,
            to: recipients,
            subject: 'Edited comment at ' + url + ' from ' + commenter,
            text: markdown
        };
    },

    deleteNotification: function(toEmail, recipients, url, commenter, markdown) {
        return {
            from: sender,
            to: recipients,
            subject: 'Deleted comment at ' + url + ' from ' + commenter,
            text: markdown
        };
    }
};

/*
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport("SMTP");

var mailOptions = {
   from: "<ogs22@cam.ac.uk>", // sender address
   to: "ogg@shrunk.com", // list of receivers
   subject: "Hello ", // Subject line
   text: "Hello world ", // plaintext body
   html: "<b>Hello world </b>" // html body
}

// send mail with defined transport object
smtpTransport.sendMail(mailOptions, function(error, response){
   if(error){
       console.log(error);
   }else{
       console.log("Message sent: " + response.message);
   }

   // if you don't want to use this transport object anymore, uncomment following line
   //smtpTransport.close(); // shut down the connection pool, no more messages
});
*/