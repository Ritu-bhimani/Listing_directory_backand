const express = require("express");
const common = require("../functions/common.js");
const listing = require("../functions/listing.js");

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
            var resmsg = { success: false, message: "Failed auth validation" }
            return res.send(resmsg)
        }
    } catch (err) {
        return res.send({ success: false, error: err })
    }
})


router.put("/edit", async (req, res) => {

    // if (req.body && Object.keys(req.body).length == 0) {
    //     return res.send({ success: false, message: "Records doesn't update" });
    // }

    const reqUserData = req.body;
    const { errors, isValid } = listing.validateEditListing(reqUserData);

    if (!isValid) {
        return res.status(400).json({ success: false, error: errors });
    }
    try {
        var auth = common.validAuthHeader(req)

        if (auth.validated == true) {
            reqUserData.userID = auth.userID
            let result = await listing.editListing(reqUserData)
            return res.send(result)
        } else {
            var resmsg = { success: false, success: false, message: "Failed auth validation" }
            return res.send(resmsg)
        }
    } catch (err) {
        return res.send({ success: false, error: err })
    }

})


router.put("/remove", async (req, res) => {  // this will only change listing  "isListingExists"  status from  exists to  notExists.  // not delete the record/listing from listing table.       
    if (!req.body?.listingID) {
        return res.status(400).send({ success: false, message: "listingID is required" })
    }

    try {
        var auth = common.validAuthHeader(req)

        if (auth.validated == true) {
            var result = await listing.deleteListing(req.body?.listingID)
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


router.get("/allListing", async (req, res) => {
    try {
        let listingsData = await listing.getAllListing();
        listingsData.success = true
        res.send(listingsData);
    }
    catch (error) {
        var result = { success: false, error: err }
        res.send(result)
    }
});


router.get("/myListing", async (req, res) => {
    try {
        var auth = common.validAuthHeader(req)

        if (auth.validated == true) {
            let listingsData = await listing.getMyListing(auth.userID);
            res.send(listingsData);
        } else {
            var resmsg = { success: false, message: "Failed auth validation" }
            return res.send(resmsg)
        }
    }
    catch (error) {
        var result = { success: false, error: err }
        res.send(result)
    }
})


router.get("/:id", async (req, res) => {            // api/listing/:id
    try {
        let listingID = req.params?.id;
        let result = await listing.getListing(listingID);
        res.send(result);
    } catch (err) {
        var result = { success: false, error: err }
        res.send(result)
    }
});


router.post("/addToFavourite", async (req, res) => {

    if (!req.body?.listingID) {
        return res.status(400).send({ success: false, message: "listingID is required" })
    }

    try {
        var auth = common.validAuthHeader(req)

        if (auth.validated == true) {
            var result = await listing.addToFavourite(auth?.userID, req.body?.listingID)
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
})


router.put("/removeFromFavourite", async (req, res) => {

    if (!req.body.listingID) {
        return res.status(400).send({ success: false, message: "listingID is required" })
    }

    try {
        var auth = common.validAuthHeader(req)

        if (auth.validated == true) {
            var result = await listing.removeFromFavourite(auth?.userID, req.body?.listingID)
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
})


module.exports = router;