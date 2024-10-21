import LocalStrategy from "passport-local";
import passport from "passport";
import User from "../models/user.js";
import bcrypt from "bcryptjs"
passport.use(new LocalStrategy(
    { usernameField: 'email' },

async function(email, password, done) {
    console.log(email, password)
        const user = await User.findOne({ email: email });
        if (!user) { 
            return done(null, false, 'User not found');
        }
        if(!bcrypt.compareSync(password, user.password)) {
            return done(null, false);
        }
        return done(null, user);
    }

));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done){
    try {
        const user = await User.findOne({ id: id });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport