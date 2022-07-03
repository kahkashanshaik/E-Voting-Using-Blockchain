const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var dateTime = require('node-datetime');
var nodemailer = require('nodemailer');
const fast2sms = require('fast-two-sms')
const { exec } = require('child_process');
const url = require('url');
const path = require('path');
const fs = require('fs');



var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hurunnisashaik@gmail.com',
    pass: 'yfzfmykudoojzlrk'
  }
});

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

//current date with time
var dt = dateTime.create();
var formatted = dt.format('Y-m-d H:M:S');


/*Paste Code*/
var filepath  = "http://edutechindia.co.in/awsfreesms/results.php";
var argstring = "?send=ok&api=sVScKbRqGJW7dB2mgUxpy&numbers=6361375923&msg=Hellddddo%20world%20test";
// runner.exec(filepath+""+argstring, function(err, phpResponse, stderr) {
//     console.log(phpResponse);
// });
exec("php " +filepath + "" +argstring, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: `+stdout);
  console.error(`stderr:`+stderr);
});

/*For Admin Login*/
exports.adminlogin = async (req, res) => {
    try {
        const {
            u_email,
            u_password
        } = req.body;
        if (u_email == '' || u_password == '') {
            return res.render('adminlogin', {
                message: 'Please Provide Email and password'
            });
        }

        db.query('SELECT * FROM user WHERE u_email = ?', [u_email], async (error, results) => {
            if (!results || results[0].u_pass != u_password) {
                res.status(401).render('adminlogin', {
                    message: 'Email or password is incorrect'
                });
            } else {
                const id = results[0].id;
                res.locals.id = id;
                res.locals.useremail = u_email;

                req.session.loggedIn = true;
                req.session.useremail = res.locals.useremail;
                req.session.id = res.locals.id;
                console.log(req.session);
                res.status(200).redirect('/admindashboard');
            }
        });

    } catch (error) {
        // console.log(error);
    }
}

/*For Voter Login*/
exports.voterLogin = async (req, res) => {

    try {
        const {
            u_email,
            u_password
        } = req.body;

        if (u_email == '' || u_password == '') {
            return res.render('login', {
                message: 'Please Provide Email and password'
            })
        }

        db.query('SELECT * FROM voters WHERE email = ? and token_status = 1', [u_email], async (error, results) => {
            if(results.length > 0){
                if (!results || !(await bcrypt.compare(u_password, results[0].password))) {
                    res.status(401).render('voterIndex', {
                        message: 'Email or password is incorrect'
                    });
                } else {
                    const id = results[0].id;
                    res.locals.id = id;
                    res.locals.useremail = u_email;

                    req.session.loggedIn = true;
                    req.session.useremail = res.locals.useremail;
                    req.session.id = res.locals.id;
                    res.status(200).redirect("/voterdashboard");

                } 
            }
             else{
                res.status(401).render('voterIndex', {
                    message: 'Account is not verified'
                });
             }   
            
            

        });

    } catch (error) {
        console.log(error);
    }

}

/*For Voter Register*/
exports.voterRegister = (req, res) => {
    const {
        voter_id,
        name,
        email,
        phone,
        adhar_no,
        address,
        password,
        passwordConfirmed
    } = req.body;
    /*Getting posted form data*/
    var formdata = {"voter_id":voter_id ,"name": name, "email": email, "phone": phone, "adhar_no": adhar_no, "address": address};
    /*Form Validation*/
    req.checkBody('phone', 'Number should be min of 10 digits and max 12').isLength({ min: 10, max: 12 });
    req.checkBody('adhar_no', 'Adhar No Should contain 16 digits').isLength({ min: 12, max: 16 });
    var errors = req.validationErrors();
    if(errors){
      req.session.errors = errors;
      req.session.success = false;
      res.render('voterRegister', { success: req.session.success, errors: req.session.errors, formdata: formdata });
   }else{
    db.query('SELECT email FROM voters WHERE email = ?', [email], async (error, results) => {
      db.query('SELECT mobile_no FROM voters WHERE mobile_no = ?',[phone], async (error, phoneno_check) => {
        db.query('SELECT adhar_no FROM voters WHERE adhar_no', [adhar_no], async(error, adhar_check) => {
            if (error) {
            }
            if(phoneno_check.length > 0){
                return res.render('voterRegister', {
                    message: 'Phone Number already in use', formdata: formdata
                })
            }else{
                if (results.length > 0 && adhar_check.length > 0) {
                    return res.render('voterRegister', {
                        message: 'That Email | Adhar| Phone No is already in use', formdata: formdata
                    })
                } else if (password != passwordConfirmed) {
                    return res.render('voterRegister', {
                        message: 'password do not match', formdata: formdata
                    });
                }
            }
            
            let hashPassword = await bcrypt.hash(password, 8);
            db.query('INSERT INTO voters SET ?', {voter_id: voter_id,
                name: name, mobile_no: phone,  address: address, email: email,password: hashPassword, adhar_no: adhar_no,verification_token: '',
                token_status: 0,creation_date: formatted
            }, async (error, results) => {
                if (error) {
                    // console.log(error);
                } else {
                    /*generating 10 digits token number*/
                    // const rand=()=>Math.random(0).toString(36).substr(2);
                    // const token=(length)=>(rand()+rand()+rand()+rand()).substr(0,length);
                    // const verification_token = token(4);

                    const verification_token = Math.floor(1000 + Math.random() * 9000);
                    /*Sending Email For Verification*/
                    var mailOptions = {

                      from: 'hurunnisashaik@gmail.com',
                      to: 'kahkashan1507@gmail.com',
                      subject: 'E-Voting Using Blockchain Registration Verification',
                      html: '<h4 style="text-align:center;color: red;text-transform:uppercase;">Token Verification</h4><br/><br/><br/><h5>Hello '+ name +' Welcome to E-voting platform. And Thanks for registring with us you are one step away to login just verfiy your account with this Verification code. </h5><br/><br/><br/><h3 style="text-align:left;">Here is your Verfication Token: ' + verification_token+ '</h3> <br/><h5><a href="http://localhost:5000/tokenVerification" style="color:blue; text-decoration:underline">Click Here</a></h5>',
                    };

                    var options = {authorization : process.env.API_KEY , message : 'OTP-'+verification_token ,  numbers : [phone]} 
                    var response = await fast2sms.sendMessage(options)
                    if(response){
                        // console.log(response);
                        db.query("UPDATE voters set verification_token = '"+verification_token+"' WHERE email = '"+email+"'", (error, results) => {
                            req.session.success = true;
                                        return res.render('tokenVerification', {
                                             message: 'Registration Successfull'
                                            });
                                     res.status(200).redirect("/tokenVerification");
                            });
                    }else{
                         // console.log(response);
                         return res.render('voterRegister', {
                             message: 'OTP not able to generate try again after some time!! ', formdata: formdata
                         });

                    }
                    // transporter.sendMail(mailOptions, function(error, info){
                    //   if (error) {
                    //     console.log(error);
                    //   } else {
                    //     db.query("UPDATE voters set verification_token = '"+verification_token+"' WHERE email = '"+email+"'", (error, results) => {
                    //         if(error){
                    //             console.log(error);
                    //         }else{
                    //             /*Upon successfull mail sending*/
                    //             console.log('Email sent: ' + info.response);
                    //             req.session.success = true;
                    //             // return res.render('tokenVerification', {
                    //             //     message: 'Registration Successfull'
                    //             // });
                    //             res.status(200).redirect("/tokenVerification");
                    //         }
                    //     });
                    //   }
                    // });

                }
            });
        });
        });
        
    });
   } 
}

/*Token Verification*/
exports.tokenVerification = (req, res) => {
    const token_verification = req.body.token_verification;
    req.checkBody('token_verification', 'Token Should be 10 characters').isLength({ min: 4, max: 4 });
    var errors = req.validationErrors();
      // console.log(token_verification);

    if(errors){
      req.session.errors = errors;
      req.session.success = false;
      res.render('tokenVerification', { success: req.session.success, errors: req.session.errors });
   }else{
     db.query("SELECT * FROM voters WHERE verification_token = '"+token_verification+"'", async (error, results) => {
        if (error) {
            console.log(error);
        }
        if (results.length == 0 ) {
            // console.log(results);
            return res.render('tokenVerification', {
                message: 'incorrect Token Value'
            })
        } else  {
            // console.log(results);
            db.query("UPDATE voters set token_status = 1 WHERE verification_token = '"+token_verification+"'", (error, results) => {
                if(error){
                    // console.log(error);
                }else{
                    req.session.success = true;
                    res.status(200).redirect("/voterdashboard");
                }
            });
        }
     });
   }
}