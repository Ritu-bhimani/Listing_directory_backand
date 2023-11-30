const express = require("express");
const category = require("../functions/category.js");
const common = require("../functions/common.js");

const router = express.Router();

router.post("/add", async (req, res) => {  //  categoryName

    if (!req.body.categoryName) {
        return res.status(400).send({ success: false, message: "Category Name is required" })
    }

    try {
        var auth = common.validAuthHeader(req)

        if (auth.validated == true) {
            const payloadData = jwtDecode(req.headers["authorization"]?.split(' ')[1])?.data;

            if (payloadData.role !== "admin") {
                return res.status(403).send({ success: false, message: "Unauthorized access" });
            }

            var result = await category.addCategory(req.body)
            return res.send(result)
        } else {
            var resmsg = { success: false, message: "Failed auth validation" }
            return res.status(401).send(resmsg)
        }
    }
    catch (err) {
        var result = { success: false, error: err }
        return res.send(result)
    }
});

router.put("/edit", async (req, res) => {

    const reqUserData = req.body;  // categoryID, categoryName
    const { errors, isValid } = category.validateEditCategory(reqUserData);

    if (!isValid) {
        return res.status(400).send({ success: false, error: errors })
    }

    try {
        var auth = common.validAuthHeader(req)

        if (auth.validated == true) {
            const payloadData = jwtDecode(req.headers["authorization"]?.split(' ')[1])?.data;

            if (payloadData.role !== "admin") {
                return res.status(403).send({ success: false, message: "Unauthorized access" });
            }

            var result = await category.editCategory(req.body)
            return res.send(result)
        } else {
            var resmsg = { success: false, message: "Failed auth validation" }
            return res.status(401).send(resmsg)
        }
    }
    catch (err) {
        var result = { success: false, error: err }
        return res.send(result)
    }
})

router.delete("/remove", async (req, res) => {

    const reqUserData = req.body;  // categoryID

    if (!reqUserData.categoryID) {
        return res.status(400).send({ success: false, message: 'categoryID is required' })
    }

    try {
        var auth = common.validAuthHeader(req)

        if (auth.validated == true) {
            const payloadData = jwtDecode(req.headers["authorization"]?.split(' ')[1])?.data;

            if (payloadData.role !== "admin") {
                return res.status(403).send({ success: false, message: "Unauthorized access" });
            }

            var result = await category.deleteCategory(req.body)
            return res.send(result)
        } else {
            var resmsg = { success: false, message: "Failed auth validation" }
            return res.status(401).send(resmsg)
        }
    }
    catch (err) {
        var result = { success: false, error: err }
        return res.send(result)
    }
})

router.get("/allCategory", async (req, res) => {
    try {
        // var auth = common.validAuthHeader(req)

        // if (auth.validated == true) {
        var result = await category.getAllCategory();
        return res.send(result)
        // } else {
        //     var resmsg = { success: false, message: "Failed auth validation" }
        //     return res.status(401).send(resmsg)
        // }
    }
    catch (err) {
        var result = { success: false, error: err }
        return res.send(result)
    }
});

router.get("/", async (req, res) => {
    const reqUserData = req.body;  // categoryID

    if (!reqUserData.categoryID) {
        return res.status(400).send({ success: false, message: 'categoryID is required' })
    }

    try {
        var auth = common.validAuthHeader(req)

        if (auth.validated == true) {
            var result = await category.getCategoryDetail(reqUserData.categoryID)
            return res.send(result)
        } else {
            var resmsg = { success: false, message: "Failed auth validation" }
            return res.status(401).send(resmsg)
        }
    }
    catch (err) {
        var result = { success: false, error: err }
        return res.send(result)
    }
})

module.exports = router