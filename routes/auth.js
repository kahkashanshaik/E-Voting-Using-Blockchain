const express = require("express");
const authController = require("../controllers/auth");

const router  = express.Router();

router.get('/', (req, res) => {
	res.render('index');
});

router.post('/voterRegister', authController.voterRegister);
router.post('/voterLogin', authController.voterLogin);
router.post('/adminlogin',authController.adminlogin);
router.post('/tokenVerification',authController.tokenVerification);

module.exports = router;