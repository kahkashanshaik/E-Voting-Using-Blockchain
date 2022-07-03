const express = require("express");
const fs = require('fs');

const router  = express.Router();

/* '/'' indicate default index.html file to render*/
router.get('/', (req, res) => {
	res.render('index');
});

/*Voter Index Screen*/
router.get('/voterIndex', (req, res) => {
	res.render('voterIndex');
});

/*Voter Registration*/
router.get('/voterRegister', (req, res) => {
	res.render('voterRegister');
});

/*Toekn Verification*/
router.get('/tokenVerification', (req, res) => {
	res.render('tokenVerification');
});


/*Random Questioner*/
router.get('/randomauth', (req, res) => {
	res.render('randomauth');
});


/*Voter Login*/
router.get('/voterLogin', (req, res) => {
	res.render('voterIndex');
});

/*Votr Dashboard*/
router.get('/voterdashboard', (req,res) => {
	if(req.session.loggedIn){
			res.render('voterdashboard');
	}else{
		res.render('voterIndex');
	}
});

/*Admin Login Screen*/
router.get('/adminIndex', (req, res) => {
	res.render('adminIndex');
});
/*Admin Dashboard*/
router.get('/admindashboard', (req,res) => {
	if(req.session.loggedIn){
		res.render('admindashboard');
	}else{
		res.render('adminIndex');
	}
});

/*Add Candidate*/
router.get('/addcandidate', (req, res) => {
	if(req.session.loggedIn){
	res.render('addcandidate');
	}else{
		res.render('adminIndex');
	}
});

/*Election Results*/
router.get('/electionresult', (req, res) => {
	if(req.session.loggedIn){
			res.render('electionresult');
	}else{
		res.render('adminIndex');
	}
});

/*Session Destory*/
router.get('/logout', function (req, res) {
		req.session.destroy((err)=>{});
  res.redirect('/adminIndex');
});

/*Session Destory on Voter Logout*/
router.get('/voterlogout', function(req, res){
	req.session.destroy((err)=>{});
  res.redirect('/voterIndex');
});



module.exports = router;