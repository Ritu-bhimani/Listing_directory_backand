const express = require("express");
const bcrypt = require("bcrypt");
const common = require("../functions/common.js");
const user = require("../functions/user.js");
const db = require("../config/dbConfig.js");
const fs = require('fs');
const path = require('path');
const { upload } = require("../functions/upload.js")


const router = express.Router();


router.get("/", async (req, res) => {         // need to json.parse "socialNetworks" data in frontend side

    try {
        const auth = common.validAuthHeader(req)

        if (auth.validated == true) {
            // let userID = req.query.userID;          // http://localhost:5000/api/users/user?userID=57
            let userData = await user.getUserByUserID(auth?.userID);

            delete userData.password;
            delete userData.resetPasswordDateTime;
            delete userData.resetPasswordToken;
            // delete userData.birthDate
            // delete userData.emailVerificationCode
            userData.success = true

            let resmsg = userData
            return res.send(resmsg);
        } else {
            let resmsg = { success: false, message: "Failed auth validation" }
            res.send(resmsg)
        }
    } catch (err) {
        return res.json({ success: false, error: err.toString() })
    }
})


router.put("/changePassword", async (req, res) => {    // email, oldPassword, newPassword, confirmPassword

    if (req.body && Object.keys(req.body).length == 0) {
        return res.status(400).json({ success: false, message: "All fields are mandatory" });
    }

    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    try {
        const { emailErrs, isValidEmail } = common.validateEmail(email);
        const { pswdErrs, isValidPswd } = common.validatePswd(newPassword);
        const { cnfPswdErrs, isValidConfirmPswd } = common.validateConfirmPswd(newPassword, confirmPassword);

        if (!req.body?.oldPassword) {
            return res.status(400).json({ success: false, error: "oldPassword is required" });
        }

        if (!isValidEmail) {
            return res.status(400).json({ success: false, error: emailErrs });
        }

        if (!isValidPswd) {
            return res.status(400).json({ success: false, error: pswdErrs });
        }

        if (!isValidConfirmPswd) {
            return res.status(400).json({ success: false, error: cnfPswdErrs });
        }

        const query = "SELECT userID, password FROM users WHERE email = ? limit 1";

        const result = await new Promise((resolve, reject) => {
            db.query(query, email, (err, data) => {
                if (err) {
                    reject({ success: false, error: err });
                }
                resolve(data);
            }
            );
        });

        if (result && result?.length > 0) {

            const isPasswordMatch = bcrypt.compareSync(oldPassword, result[0]?.password);
            const isNewPswdOldPswdMatch = bcrypt.compareSync(newPassword, result[0]?.password);

            if (isPasswordMatch == false) {
                return res.status(400).json({ authenticated: false, message: "Incorrect old password" })
            }

            if (isNewPswdOldPswdMatch == true) {
                return res.status(400).json({ authenticated: false, message: "Old password and New password are same" })
            }

            let retVal = await user.changePassword(result[0]?.userID, newPassword)
            return res.json(retVal)

        }
        else {
            res.status(404).json({ authenticated: false, message: "Email not found" });
        }

    } catch (err) {
        var result = { success: false, error: err.toString() }
        res.send(result)
    }
})


router.put("/updateUser", async (req, res) => {

    if (req.body && Object.keys(req.body).length == 0) {
        res.send({ message: "Records doesn't update" })
    }

    try {
        var auth = common.validAuthHeader(req)

        if (auth.validated == true) {
            var result = await user.updateUser(req.body, auth?.userID)
            res.json(result)
        } else {
            var resmsg = { success: false, message: "Failed auth validation" }
            res.json(resmsg)
        }
    }
    catch (err) {
        var result = { success: false, error: err.toString() }
        res.send(result)
    }
});


router.put("/updateUserSocial", async (req, res) => {         // if you don't pass anything in req_body   then  socialNetworks would be {} thai jse. 

    function isObject(value) {
        return (typeof value === 'object' && value !== null && !Array.isArray(value) && typeof value !== 'strig' && typeof value !== 'number');
    }

    try {

        if (!isObject(req.body)) {
            return res.json({ success: false, message: "Request body must be an json object." });
        }

        var auth = common.validAuthHeader(req)

        if (auth.validated == true) {
            var result = await user.updateUserSocial(req.body, auth.userID);
            res.json(result)
        } else {
            var resmsg = { success: false, message: "Failed auth validation" }
            res.json(resmsg)
        }
    }
    catch (err) {
        var result = { success: false, error: err.toString() };
        res.send(result)
    }
});


router.post("/saveProfileImage", upload.single("avatar"), async (req, res) => {       /* "avatar" - name attribute of <file> element in your form */

    if (!req.file) {
        res.send({ success: false, message: "Profile image doesn't add" })
    }

    try {
        var auth = common.validAuthHeader(req);
        // var data = req.body;
        // console.log("req body", data)

        if (auth.validated == true) {
            let url = req.protocol + "://" + req.get("host");
            let fullUrl = req.file ? `${url}/public/${req.file.filename}` : "";

            console.log("fullUrl", fullUrl);

            if (req.file) {
                // res.status(200).json({ success: true, message: "File uploaded successfully" });
                var retObj = await user.addProfileImage(fullUrl, auth.userID);
                res.json(retObj);
            }
            else {
                res.status(400).json({ success: false, message: "File upload only supports .jpeg .jpg .png format" });
            }

        } else {
            var resmsg = { success: false, message: "Failed auth validation" };
            res.json(resmsg);
        }

    } catch (err) {
        var result = { success: false, error: err.toString() };
        res.json(result);
    }
});


router.put("/removeProfileImage", async (req, res) => {
    console.log("req body", req.body);

    try {
        var auth = common.validAuthHeader(req);

        if (auth.validated == true) {
            let imagePath = req.body.path;
            let resmsg = await user.removeProfileImage(imagePath, auth.userID);
            res.send(resmsg);
        } else {
            var resmsg = { success: false, message: "Failed auth validation" };
            res.send(resmsg);
        }
    } catch (err) {
        var result = { success: false, error: err.toString() };
        res.send(result);
    }
});


router.put("/deleteUserAccount", async (req, res) => {        // this will only change user  "isAccountExists"  status from  exists to  notExists. // not delete the record/account from user table.
    try {
        var auth = common.validAuthHeader(req)

        if (auth.validated == true) {
            var result = await user.delteUserAccount(auth?.userID)
            res.json(result)
        } else {
            var resmsg = { success: false, message: "Failed auth validation" }
            res.json(resmsg)
        }
    }
    catch (err) {
        var result = { success: false, error: err.toString() }
        res.send(result)
    }
});

module.exports = router;
