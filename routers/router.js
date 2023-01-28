let controller = require('../controllers/controller');
let router  = require('express').Router();
let {checkAuthStatus} = require('../middlewares/authMiddleware');

router.get('/', (req, res) => res.render('home'));
router.get('/smoothies', checkAuthStatus,(req, res) => res.render('smoothies'));
router.route('/signup').get(controller.getSignUp).post(controller.signUp);
router.route('/login').get(controller.getLogin).post(controller.login);
router.get('/logout',controller.logout);



module.exports=router;