const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } = require("http-status-codes");

const User = require("../models/user.model");

async function generateHash(password) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        if (hashedPassword) return hashedPassword;
    } catch (error) {
        console.log(error);
    }
}

exports.user_signup = async (req, res, _next) => {
    const [foundExistingUser] = await User.find({ email: req.body.email });
    if (foundExistingUser) {
        res.status(BAD_REQUEST).json({ message: "User already exists" });
        throw new Error("");
    }
    const userToAdd = new User({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        displayName: req.body.displayName,
        password: await generateHash(req.body.password)
    });
    const newUser = await userToAdd.save();
    return res
        .status(OK)
        .json(newUser)
        .end();
};

exports.user_login = (req, res, _next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(UNAUTHORIZED).json({ message: "Auth failed" });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(UNAUTHORIZED).json({ message: "Auth failed" });
                }
                if (result) {
                    const token = jwt.sign({ email: user[0].email, userId: user[0]._id }, "secret", {
                        expiresIn: "1h"
                    });
                    return res.status(OK).json({ message: "Auth Successful", token: token });
                }
                res.status(UNAUTHORIZED).json({ message: "Auth failed" });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(INTERNAL_SERVER_ERROR).json({ error: err });
        });
};

exports.delete_user = (req, res, _next) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then(() => {
            res.status(OK).json({ message: "User DELETED" });
        })
        .catch(err => {
            console.log(err);
            res.status(INTERNAL_SERVER_ERROR).json({ error: err });
        });
};

exports.createPost = async (req, res) => {
    if (!req.params.user_id) throw new Error(BAD_REQUEST);
    const user = await User.findById(req.params.user_id);
    if (!user) throw new Error(BAD_REQUEST);
    const post = req.body.post;
    await User.findByIdAndUpdate(user._id, { $addToSet: { posts: post } });
    return res.status(OK).json({ message: "Post Created" });
};

exports.getUserWithPosts = (req, res) => {
    
}
