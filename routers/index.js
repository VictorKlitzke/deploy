const express = require("express");
const router = express.Router();

const authPost = require('../src/controllers/post');
const authget = require('../src/controllers/get');
const authPut = require('../src/controllers/put');
const authDelete = require('../src/controllers/delete');
const auth = require('../middleware/auth');

router.post('/register', authPost.register);
router.post('/login', authPost.login);
router.post('/registerCategory', auth, authPost.registerCategory);
router.post('/registerAccounts', auth, authPost.registerAccounts);
router.post('/registerExpense', auth, authPost.registerExpense);
router.post('/logout', auth, authPost.logout);

router.delete('/deletetransacao', auth, authDelete.deletetransacao)
router.delete('/deletecategory', auth, authDelete.deletecategory)
router.delete('/deleteAccounts', auth, authDelete.deleteAccounts);

router.put('/updatepassword', auth, authPut.updatepassword);
router.put('/updateemail', auth, authPut.updateemail);
router.put('/verifyEmailCode', auth, authPut.verifyEmailCode);

router.get('/getuser', auth, authget.getuser);
router.get('/getCategorys', auth, authget.getCategorys);
router.get('/getAccounts', auth, authget.getAccounts);
router.get('/getTransition', auth, authget.getTransition);

module.exports = router;