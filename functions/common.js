const validator = require('validator');
const isEmpty = require("lodash.isempty");
const nodemailer = require('nodemailer');
const db = require("../config/dbConfig.js");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
const dotenv = require("dotenv").config();


function getDateTimeString() {
    var date = new Date();
    var seconds = date.getSeconds().toString()
    var minutes = date.getMinutes().toString()
    var hour = date.getHours().toString()
    var year = date.getFullYear().toString()
    var month = (date.getMonth() + 1).toString()
    var day = date.getDate().toString()
    var dayOfWeek = date.getDay().toString()
    var milliSeconds = date.getMilliseconds().toString()
    var dtString = year + '-' + month + '-' + day + '-' + hour + '-' + minutes + '-' + seconds + '-' + milliSeconds
    return dtString
}


//get property from object even if sub-object doesn't exist it won't give error
const getProperty = function (obj, key) {
    try {
        return key.split(".").reduce(function (o, x) {
            return (typeof o == "undefined" || o === null) ? o : o[x];
        }, obj);
    } catch (err) {
        return err;
    }
}


const jwtSign = function (payload, expiration, secretKey) {
    console.log("common jwtsign ", payload, expiration)
    try {
        var token = jwt.sign({
            data: payload
        }, secretKey, { expiresIn: expiration });
        return token;
    }
    catch (err) {
        return err;
    }
}

async function writeFile(filePath, data) {
    try {
        await fs.writeFileSync(filePath, data)
    } catch (err) {
        console.log(err);
    }
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USERNAME, pass: process.env.GMAIL_PASSWORD },
    secure: false,
    tls: true
});

// const sendMail = async (to, subject, html, userID, options) => {
//     console.log("sendMail called!")

//     try {
//         var mailOptions = {
//             from: process.env.GMAIL_FROM_ADDRESS,
//             to,
//             subject,
//             html,
//         };

//         if (process.env.ENVIRONMENT == "live") {
//             transporter.sendMail(mailOptions, function (error, info) {
//                 if (error) {
//                 } else {
//                 }
//             });
//         } else {
//             const dtString = getDateTimeString()
//             // mailOptions.userID = options.userID
//             // mailOptions.emailVerificationCode = options.emailVerificationCode
//             // mailOptions.passwordResetCode = options.passwordResetCode
//             mailOptions.verificationCode = options.verificationCode
//             writeFile(process.env.TEST_EMAIL_FOLDER + dtString + '.txt', JSON.stringify(mailOptions))
//             console.log("dtString", dtString)
//             return dtString
//         }
//     }  
//     catch (error) {
//         console.error('Error sending email:', error);
//     }
// }

const validAuthHeader = function (req) {
    // split 'authorization', token verify using secretkey, // token payload obj
    var authHeader = req.headers['authorization']
    var token = authHeader && authHeader.split(' ')[1]
    var tokenObj = jwtTokenVerify(token, "data.userID")
    return tokenObj
}

const jwtVerify = function (token) {
    // verify token using secretkey & retutn token payload obj
    try {
        var payload = jwt.verify(token, process.env.SECRET_KEY);
        return payload;
    }
    catch (err) {
        return err;
    }
}

const jwtTokenVerify = function (token, property) {
    try {
        var tokenObj = jwtVerify(token)     // token payload obj
        var retObj = {}
        retObj.validated = false
        retObj.msg = "not a token"
        if (getProperty(tokenObj, "message")) {
            if (tokenObj.message == "invalid token") {
                retObj.validated = false
                retObj.msg = "invalid token"
            }
        }
        if (getProperty(tokenObj, "expiredAt")) {
            retObj.validated = false
            retObj.msg = "expired token"
        }

        if (getProperty(tokenObj, "data.authenticated") == false) {
            retObj.validated = false
            retObj.msg = "token authentication failed"
        }

        if (token == null) {
            retObj.validated = false
            retObj.msg = 'missing token'
        }

        var result = getProperty(tokenObj, property)
        // console.log("result", result)
        if (result) {
            retObj.validated = true
            retObj.msg = "valid Token"
            retObj.property = getProperty(tokenObj, property) //can't this just be result?
            retObj.userID = tokenObj.data.userID
        }

        return retObj
    } catch (err) {
        return err;
    }
}

const validateEmail = (email) => {
    const emailErrs = {};
    email = email ? email.toString() : "";

    if (validator.isEmpty(email)) {
        emailErrs.email = "Email field is required";
    } else if (!validator.isEmail(email)) {
        emailErrs.email = "Email is invalid"; emailErrs
    }

    return { emailErrs, isValidEmail: isEmpty(emailErrs) };
};

const validatePswd = (password) => {
    const pswdErrs = {};

    password = password ? password.toString() : "";

    if (validator.isEmpty(password)) {
        pswdErrs.password = "Password field is required";
    } else if (!validator.isLength(password, { min: 6, max: 30 })) {
        pswdErrs.password = "Password must be at least 6 characters long";
    }

    return { pswdErrs, isValidPswd: isEmpty(pswdErrs) };
};

const validateConfirmPswd = (password, confirmPassword) => {
    const cnfPswdErrs = {};
    confirmPassword = confirmPassword ? confirmPassword.toString() : "";

    if (validator.isEmpty(confirmPassword)) {
        cnfPswdErrs.confirmPassword = "Confirm password field is required";
    } else if (!validator.equals(password, confirmPassword)) {
        cnfPswdErrs.confirmPassword = "Passwords must match";
    }

    return { cnfPswdErrs, isValidConfirmPswd: isEmpty(cnfPswdErrs) };
};


module.exports = {
    // generateVerificationCode,
    jwtSign,
    uuidv4,
    getDateTimeString,
    writeFile,
    // sendMail,
    validAuthHeader,
    getProperty,
    validatePswd,
    validateEmail,
    validateConfirmPswd
}