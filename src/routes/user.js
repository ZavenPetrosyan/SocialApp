const express = require("express");
const router = express.Router();
const chackAuth = require("../middlewere/check_auth");

const UserController = require("../controllers/user.controller");

router.post("/signup", UserController.user_signup);

router.post("/login", UserController.user_login);

router.post("/user/:user_id/cretePost", chackAuth, UserController.createPost);

router.delete("/:userId", chackAuth, UserController.delete_user);

module.exports = router;
