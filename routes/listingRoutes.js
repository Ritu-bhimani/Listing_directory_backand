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

router.post("/add", async (req, res) => {

    try {
        var itemID = await listing.addListing(data)
        var resmsg = { success: true, itemID: itemID }
        res.send(resmsg)

        if (auth.validated == true) {

        } else {
            let resmsg = { success: false, message: "Failed auth validation" }
            res.send(resmsg)
        }
    } catch (err) {
        return res.json({ success: false, error: err.toString() })
    }

    res.json({ message: "Add listing" })
})


module.exports = router;