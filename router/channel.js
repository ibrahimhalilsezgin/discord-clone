import { Router } from "express";
import "../passport/local.js";
import pssprt from "../passport/check.js";
import channelController from "../controllers/channelController.js";
import User from "../models/user.js";
const router = Router();

router.post('/createGuild/', pssprt.ensureAuthenticated, channelController.createGuild);
router.post('/createChannel/', pssprt.ensureAuthenticated, channelController.createChannel);
router.post('/joinGuild', pssprt.ensureAuthenticated, channelController.joinGuild);
router.get('/@me', pssprt.ensureAuthenticated, async (req, res) => {
    const user = await User.findOne({ id: req.user.id }).populate('guilds')
    res.render('mainScreen', {
        user: user,
        guilds: user.guilds
    });
})
router.get('/:guildID/', pssprt.ensureAuthenticated, channelController.guild);
router.get('/:guildID/:channelID/', pssprt.ensureAuthenticated, channelController.channel);


export default router;