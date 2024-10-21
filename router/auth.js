import { Router } from "express";
import passport from "passport";
import "../passport/local.js"
import userController from "../controllers/authController.js";
const router = Router();

router.get('/login', (req, res) => {
  res.render('login')
})
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/auth/login');
  });
});
router.get('/register', (req, res) => {
  res.render('register')
})
router.post('/login', (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/channels/@me",
        failureRedirect:"/auth/login"
      })(req,res,next);
})
router.post('/register', userController.register);

export default router;