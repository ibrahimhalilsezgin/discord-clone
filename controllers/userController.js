import User from "../models/user.js";
import bcryptjs from "bcryptjs";


const displayName = async(req, res) => {
    const user = await User.findOne({ id: req.user.id });
    const {displayName} = req.body;


    if(!displayName) {
        await User.findOneAndUpdate({ id: req.user.id }, { displayName: req.user.username });


        return res.send(`Görünen Ad ${user.username} olarak değişti`);
    };

    await User.findOneAndUpdate({ id: req.user.id }, { displayName: displayName });

    return res.send(`Görünen Ad ${displayName} olarak değişti`);
    
}

const username = async(req, res) => {
    const user = await User.findOne({ id: req.user.id });
    const {username} = req.body;


    if(!username) {
        return res.send(`Kullanıcı Adı Boş Olamaz`);
    };

    await User.findOneAndUpdate({ id: req.user.id }, { username: username });

    return res.send(`Kullanıcı Adı ${username} olarak değişti`);
    
}

const email = async(req, res) => {
    const user = await User.findOne({ id: req.user.id });
    const {email} = req.body;


    if(!validateEmail(email)) {
        return res.send(`Geçerli bir Email Giriniz`);
    };
    if(User.findOne({ email: email })) {
        return res.send(`Bu email zaten kullanılıyor`);
    }
    await User.findOneAndUpdate({ id: req.user.id }, { email: email });

    return res.send(`E-Mail ${email} olarak değişti`);
    
}

const password = async(req, res) => {
    const user = await User.findOne({ id: req.user.id });
    const {password} = req.body;
    if(password.length <= 6) {
        return res.status(401).json({ message: 'Password length <= 6' });
    };
    const hashedPassword = bcryptjs.hashSync(password, 10)

    await User.findOneAndUpdate({ id: req.user.id }, { password: hashedPassword });
    return res.send(`Şifre değişti`);    
}
const profilePhoto = async (req, res) => {
    const {pp} = req.body;
    await User.findOneAndUpdate({ id: req.user.id }, { profilePhoto: pp });
    return res.send(`pp değişti`);
    

}
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
   
export default {
    displayName,
    username,
    email,
    password,
    profilePhoto
    // password
}