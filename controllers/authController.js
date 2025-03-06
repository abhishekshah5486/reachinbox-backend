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
        const saltRounds = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        req.body.password = hashedPassword;
        const newUser = new userModel({
            email: req.body.email,
            password: req.body.password,
        })
        const savedUser = await newUser.save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            data: savedUser
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
        
    }
}

exports.login_user = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await userModel.findOne({email: email});

        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
                resolution: "Email is not registered, please register."
            });
        }
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);  
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials (Email/Password)",
                resolution: "Please try again"
            });
        }
        // Update isLoggedIn status
        const updatedUser = await userModel.findOneAndUpdate({email: email}, {isLoggedIn: true}, {new: true});

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: updatedUser
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}