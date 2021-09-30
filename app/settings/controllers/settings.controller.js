//core imports


//custom imports
const { Setting } = require('../models/settings.model');

module.exports.updateSettings = async (req, res) => {
    const settingfound = await Setting.findOne();
    if (!settingfound) {
        const setting = await Setting.create({
            displayMessage: req.body.message,
            terms_conditions: req.body.terms_conditions
        });
        await setting.save();
        return res.json({ message: 'Success!', status: true });
    }
    settingfound.displayMessage = req.body.message;
    settingfound.terms_conditions = req.body.terms_conditions;
    await settingfound.save();
    res.json({ message: 'Success!', status: true });
}

module.exports.getSettings = async (req, res) => {
    const settingfound = await Setting.findOne();
    res.json({ message: 'Success!', status: true, data: settingfound });
}

module.exports.getTermsConditions = async (req, res) => {
    const settingfound = await Setting.findOne().select('-_id terms_conditions');
    res.json({ status: true, data: settingfound });
}