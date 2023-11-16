const express = require("express");
const bcrypt = require("bcrypt");
const common = require("../functions/common.js");
const user = require("../functions/user.js");
const db = require("../config/dbConfig.js");
const fs = require('fs');
const path = require('path');
const { uploadImg, uploadProfileImage } = require("../functions/upload.js")


const router = express.Router();


router.get("/", async (req, res) => {

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
        return res.json({ success: false, error: err })
    }
})


router.put("/changePassword", async (req, res) => {    // email, oldPassword, newPassword, confirmPassword

    const { errors, isValid } = user.validateChangePswd(req.body);

    if (!isValid) {
        return res.status(400).json({ success: false, error: errors });
    }

    try {
        const { email, oldPassword, newPassword, confirmPassword } = req.body;

        const query = "SELECT userID, password FROM users WHERE email = ? limit 1";

        const result = await new Promise((resolve, reject) => {
            db.query(query, email, (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            }
            );
        });

        if (result && result?.length > 0) {

            const isPasswordMatch = bcrypt.compareSync(oldPassword, result[0]?.password);
            const isNewPswdOldPswdMatch = bcrypt.compareSync(newPassword, result[0]?.password);

            if (isPasswordMatch == false) {
                return res.status(400).json({ success: false, message: "Incorrect old password" })
            }

            if (isNewPswdOldPswdMatch == true) {
                return res.status(400).json({ success: false, message: "Old password and New password are same" })
            }

            let retVal = await user.changePassword(result[0]?.userID, newPassword)
            return res.json(retVal)

        }
        else {
            res.status(404).json({ success: false, message: "Email not found" });
        }

    } catch (err) {
        var result = { success: false, error: err }
        res.send(result)
    }

})


router.put("/updateUser", async (req, res) => {

    if (req.body && Object.keys(req.body).length == 0) {
        return res.send({ success: false, message: "Records doesn't update" });
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
        var result = { success: false, error: err }
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
        var result = { success: false, error: err };
        res.send(result)
    }
});


router.post("/saveProfileImage", uploadProfileImage.single("avatar"), async (req, res) => {       /* "avatar" - name attribute of <file> element in your form */

    if (!req.file) {
        return res.send({ success: false, message: "Image file is required" })
    }

    try {
        var auth = common.validAuthHeader(req);

        if (auth.validated == true) {

            // if profile image already exist
            const selectQuery = "SELECT profileImage FROM users WHERE userID = ? limit 1";
            const result = await new Promise((resolve, reject) => {
                db.query(
                    selectQuery, auth.userID, (err, data) => {
                        if (err) {
                            reject({ success: false, error: err.toString() });
                        }
                        resolve(data);
                    }
                );
            });
            if (result && result?.length > 0) {
                user.removeProfileImage(result[0]?.profileImage, auth.userID)
            }

            // add new uploadede profile image
            let url = req.protocol + "://" + req.get("host");
            let fullUrl = req.file ? `${url}/public/${req.file.filename}` : "";

            if (req.file) {
                var retObj = await user.addProfileImage(fullUrl, auth.userID);
                return res.json(retObj);
            }
            else {
                return res.status(400).json({ success: false, message: "File upload only supports .jpeg .jpg .png format" });
            }

        } else {
            var resmsg = { success: false, message: "Failed auth validation" };
            return res.json(resmsg);
        }

    } catch (err) {
        var result = { success: false, error: err };
        return res.json(result);
    }
});


router.put("/removeProfileImage", async (req, res) => {

    try {
        var auth = common.validAuthHeader(req);

        if (auth.validated == true) {
            let imagePath = req.body?.profileImage;
            let resmsg = await user.removeProfileImage(imagePath, auth.userID);
            res.send(resmsg);
        } else {
            var resmsg = { success: false, message: "Failed auth validation" };
            res.send(resmsg);
        }
    } catch (err) {
        var result = { success: false, error: err };
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
        var result = { success: false, error: err }
        res.send(result)
    }
});


router.get("/getUserPublicInfo", async (req, res) => {      // api/user/getUserPublicInfo?username=abc
    try {
        let usrObj = await user.getUserPublicInfo(req.query.userName || req.query.id)
        var resmsg = usrObj
        res.send(resmsg)
    }
    catch (error) {
        var result = { success: false, error: err }
        res.send(result)
    }
});


module.exports = router;
