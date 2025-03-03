const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

exports.register_user = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate if the email is already registered
        const existingUser = await userModel.findOne({email: email});
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered.",
                resolution: "Please login to continue"
            })
        }
        // Salting and hashing of password
        

    } catch (error) {
        
    }
}