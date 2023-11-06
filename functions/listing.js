const express = require("express");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();
const db = require("../config/dbConfig.js");
const auth = require("../functions/auth.js");
const common = require("../functions/common.js");
const jwt = require("jsonwebtoken");
const { jwtDecode } = require("jwt-decode");
const { sendMail } = require("../middlewares/sendMail.js");

const router = express.Router();

let addListing = async (data) => {
    

    try {

    } catch (error) {
        return { success: false, error: err.toString() }
    }
}


module.exports = {
    addListing,
};