const User = require("../models/userSchema");
const jwt = require('jsonwebtoken')
const jwt_decode = require('jwt-decode')

exports.signUp = async (req, res) => {
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
            passwordConfirm: req.body.passwordConfirm
        })
        const token = jwt.sign({ id: newUser._id }, "this is jwt secret", {
            expiresIn: '30d'
        })
        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: newUser
            }
        })
    } catch (err) {
        res.status(502).json({
            message: err.message
        })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            })
        }
        const user = await User.findOne({ email }).select('+password');
        console.log(user);
        const correct = await user.correctPassword(password, user.password);
        // console.log(correct);

        if (!correct || !user) {
            return res.status(400).json({
                message: "Email or password is incorrect"
            })
        }
        const token = jwt.sign({ id: user._id }, "this is jwt secret", {
            expiresIn: '30d'
        })
        res.status(200).json({
            status: 'success',
            token,
            data: {
                user
            }
        })
    } catch (err) {
        res.status(502).json({
            message: err.message
        })
    }
}


exports.restrictTo = (roles) => {
    return async (req, res, next) => {
        const token = req.headers.authorization.split(" ")[1];
        const decode = jwt_decode(token)
        const { id } = decode
        const user = await User.findOne({ _id: id })
        if (!user) {
            return res.status(400).json({
                message: "access denied"
            })
        } else if (user?.role) {
            if (!roles.includes(user.role)) {
                return res.status(403).json({
                    status: "fail",
                    message: "you do not have permission to access this route"
                })
            }
        }
        next();
    }
}
exports.getUsers = async (req, res) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        data: {
            users
        }
    })
}