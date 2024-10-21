import bcryptjs from "bcryptjs";
import User from "../models/user.js";
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
   
function isUserNameValid(username) {
    const res = /^[a-z0-9_\.]+$/.exec(username);
    const valid = !!res;
    return valid;
}

function generateId() {
    const epoch = 1420070400000;
    const timestamp = Date.now() - epoch;
    const randomBits = Math.floor(Math.random() * (1 << 22));
    const workerId = 1;
    const processId = 1;
  
    const discordId = (timestamp << 22) | (workerId << 17) | (processId << 12) | randomBits;
  
    return discordId.toString();
}
  

const register =  async (req, res) => {
    let {email, username, password} = req.body;

    if(!email || !username || !password) return res.status(400).json({ message: 'All fields required' });
    username = username.replace(/\s+/g, '');
    email = email.replace(/\s+/g, '');
    password = password.replace(/\s+/g, '');
    if(!validateEmail(email)) return res.status(400).json({ message: 'Email format is not aomfgopsdmgomsd'});

    const emailIsUsing = await User.findOne({ email: email });
    if(emailIsUsing) {
        return res.status(403).json({ message: 'E-mail Already Registered'});
    }
    const usernameIsUsing = await User.findOne({ username: username });
    if(usernameIsUsing) {
        return res.status(403).json({ message: 'Username Already Registered'});
    }
    if(password.length <= 6) {
        return res.status(401).json({ message: 'Password length <= 6' });
    };
    if(username.length < 3) {
        return res.status(401).json({ message: 'Username length < 3' });
    }
    // if(isUserNameValid(username)) return res.status(400).json({ message: 'Usernames can only have: - Lowercase Letters (a-z) - Numbers (0-9) - Dots (.) - Underscores (_)'});
    const hashedPassword = bcryptjs.hashSync(password, 10)
    new User({
        id: generateId(),
        username: username,
        email: email,
        password: hashedPassword
    }).save();
    return res.redirect('/auth/login')
}





export default {
    register   
}