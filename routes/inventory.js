const express = require('express');
const router = express.Router();
const userAuth = require('../middleware/user-auth');
const invController = require('../controllers/inventory');

router.get('/allInventory',userAuth, invController.get_all);
router.get('/getById',userAuth, invController.inv_get);
router.post('/add',userAuth, invController.inv_add);
router.post('/edit',userAuth, invController.inv_edit);
router.post('/delete',userAuth, invController.inv_delete);


module.exports = router;