const express = require("express");
const bcrypt = require("bcrypt");
const common = require("../functions/common.js");
const user = require("../functions/user.js");
const listing = require("../functions/listing.js");
const db = require("../config/dbConfig.js");
const fs = require('fs');
const path = require('path');
const { uploadMultiple } = require("../functions/upload.js")

const router = express.Router();

router.post("/add", async (req, res) => {    // requird - title, category, description   // Note: need to add array/obj type check and it's content validation from frontend side.
    const reqUserData = req.body;
    const { errors, isValid } = listing.validateAddListing(reqUserData);

    if (!isValid) {
        return res.status(400).json({ success: false, error: errors });
    }

    try {
        var auth = common.validAuthHeader(req)

        if (auth.validated == true) {
            reqUserData.userID = auth.userID
            let result = await listing.addListing(reqUserData)
            return res.send(result)
        } else {
            var resmsg = { success: false, success: false, message: "Failed auth validation" }
            return res.send(resmsg)
        }
    } catch (err) {
        return res.send({ success: false, error: err })
    }
})


module.exports = router;