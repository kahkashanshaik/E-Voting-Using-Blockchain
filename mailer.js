var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hurunnisashaik@gmail.com',
    pass: 'yfzfmykudoojzlrk'
  }
});

var mailOptions = {
  from: 'hurunnisashaik@gmail.com',
  to: 'kahkashan1507@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

var dummy ="http://edutechindia.co.in/awsfreesms/results.php?send=ok&api=sVScKbRqGJW7dB2mgUxpy&numbers=6361375923&msg=Hellddddo%20world%20afzal%20test"