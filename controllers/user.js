const mongoose = require('mongoose');
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.user_signup = async (req, res) => {
    try {
        //console.log(req.body);
        const { F_name, L_name, email, password } = req.body;
        if (!(email && password && F_name && L_name)) {
            res.status(400).send("Invalid input, please check all required fields");
        }

        const exists = await User.find({ email });
        if (exists.length >= 1) {
            return res.status(422).send("User Already Exists. Please Login");
        }

        encryptedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            F_name,
            L_name,
            email: email,
            password: encryptedPassword
        });

        const token = jwt.sign(
            { user_id: newUser._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );
        // save user token
        newUser.token = token;
        res.status(201).json(newUser);

    } catch (err) {
        console.log(err);
    }

}

exports.user_login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }
        const validUser = await User.findOne({ email });
        console.log(bcrypt.compareSync(password, validUser.password));
        if (validUser && ( bcrypt.compareSync(password, validUser.password))) {
            const token = jwt.sign(
                { user_id: validUser._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );
            validUser.token = token;
            return res.status(200).json(validUser);
        }
        return res.status(400).send("Invalid Credentials. Try again!");
    } catch (err) {
        res.send({message: 'Server Error, try again after a while.'})
    }
}
