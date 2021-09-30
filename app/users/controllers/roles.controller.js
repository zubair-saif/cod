//core imports


//custom imports
const { Role, validate } = require('../models/roles.model');
const { User } = require('../models/users.model');

module.exports.createRole = async (req, res) => {
    const result = validate(req.body);
    if (result.error) {
        res.status(400).json({ message: result.error.details[0].message });
        return;
    }
    // if (req.user.level && req.user.level.isAdmin) {
        // const role = await Role.findOneAndUpdate({ isCommunityAdmin: true }, {
        //     $set: {
        //         role: req.body.role,
        //         isAdmin: req.body.isAdmin,
        //         communityOption: req.body.communityOption,
        //         userOption: req.body.userOption,
        //         alertOption: req.body.alertOption,
        //         listingOption:req.body.listingOption
        //     }
        // })
        // if (!role) {
            const role = await Role.create({
                role: req.body.role,
                isAdmin: req.body.isAdmin,
                communityOption: req.body.communityOption,
                userOption: req.body.userOption,
                alertOption: req.body.alertOption,
                isCommunityAdmin: req.body.isCommunityAdmin,
                listingOption:req.body.listingOption

            });
            await role.save();
            return res.json({ status: true,message: 'succeed', id: role._id });
        // }
        // return res.json({ message: 'succeed', id: role._id });
    // }
    // const role = await Role.create({
    //     role: req.body.role,
    //     isAdmin: req.body.isAdmin,
    //     communityOption: req.body.communityOption,
    //     userOption: req.body.userOption,
    //     alertOption: req.body.alertOption,
    //     listingOption:req.body.listingOption

    // });
    // await role.save();
    // res.json({ message: 'succeed', id: role._id });
}

module.exports.updateRole = async (req, res) => {
    const role = await Role.findOneAndUpdate({ _id: req.params.roleId }, {
        $set: {
            role: req.body.role,
            isAdmin: req.body.isAdmin,
            communityOption: req.body.communityOption,
            userOption: req.body.userOption,
            alertOption: req.body.alertOption,
            listingOption:req.body.listingOption

        }
    })
        res.json({status:true, message: 'Upated!', id: role._id });
}

module.exports.deleteRole = async (req, res) => {
        const role = await Role.findOneAndRemove({ _id: req.params.roleId });
        if (!role) {
            return res.status(200).json({ status: false, message: "No Role Found!" });
        }
        res.json({status:true, message: 'Deleted!' });        
}

module.exports.getRole = async (req, res) => {
    const role = await Role.findById({ _id: req.params.roleId });
    if (!role) {
        return res.status(200).json({ status: false, message: "No Role Found!" });
    }
    res.json({status:true, data:role });        
}

module.exports.updateSystemUserRole = async (req, res) => {
    const updateUserRole = await User.findOneAndUpdate({_id:req.params.userId,isSystem:true}, {
      $set: {lev:req.body.roleId}
    },
      { new: true }
    );
    if (!updateUserRole) {
        return res.json({status:false,message:"No User Found!"})
    }
    res.json({status:true, message: 'Updated!' });
  };

module.exports.getAllRoles = async (req, res) => {
    const roles = await Role.find();
    res.json({status:true, data:roles });        
}