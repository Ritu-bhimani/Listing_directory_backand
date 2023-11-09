const express = require("express");
const path = require("path")
const fs = require("fs")
const { uploadImg, uploadImgs } = require("../functions/upload.js");

const DIR = './uploads/';

const router = express.Router();


router.post("/single", uploadImg.single("file"), async (req, res) => {

    try {
        if (req.file) {
            const allowedExtns = [".jpeg", ".jpg", ".png"];
            let url = req.protocol + "://" + req.get("host");
            let fullUrl = req.file ? `${url}/public/${req.file.filename}` : "";

            if (!allowedExtns?.includes(path.extname(req.file?.originalname))) {
                fs.unlink(`${DIR}${req.file.filename}`, (err) => {
                    if (err) {
                        console.log("img unlink error", err)
                    }
                });
                return res.status(400).send({ success: false, message: "File upload only supports .jpeg .jpg .png format" });
            }

            if (req.file?.size > (1024 * 1024 * 5)) {    // 5MB max
                fs.unlink(`${DIR}${req.file.filename}`, (err) => {
                    if (err) {
                        console.log("img unlink error", err)
                    }
                });
                return res.status(400).send({ success: false, error: "Payload Too Large. Please choose a smaller image." })
            }

            // return res.send({ success: true, fileName: req.filename })
            return res.send({ success: true, fileName: fullUrl })
        }
        else {
            return res.status(400).send({ success: false, message: "File is required" })
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: err.toString() });
    }
});


router.post("/multiple", uploadImgs.array("files"), async (req, res) => {

    try {
        if (req?.files && req.files.length > 0) {
            let url = req.protocol + "://" + req.get("host");
            const allowedExtns = [".jpeg", ".jpg", ".png"];
            let fileNames = [];

            // if any file has not valid size or extension then it will send error msg in response
            // req.files.forEach((file) => {
            //     if (!allowedExtns.includes(path.extname(file.originalname))) {
            //         fs.unlink(file.path, (err) => {
            //             if (err) {
            //                 console.log("img unlink error", err);
            //             }
            //         });
            //         return res.status(400).send({ success: false, message: "File upload only supports .jpeg .jpg .png" });
            //     }
            //     if (file.size > 1024 * 1024 * 5) {
            //         fs.unlink(file.path, (err) => {
            //             if (err) {
            //                 console.log("img unlink error", err);
            //             }
            //         });
            //         return res.status(400).send({ success: false, error: "Payload Too Large. Please choose smaller images." });
            //     }
            //     fileNames.push(`${url}/public/${file.filename}`);
            // });

            req.files.forEach((file) => {
                if (!allowedExtns.includes(path.extname(file.originalname)) || file.size > 1024 * 1024 * 5) {
                    fs.unlink(file.path, (err) => {
                        if (err) {
                            console.log("img unlink error", err);
                        }
                    });
                } else {
                    fileNames.push(`${url}/public/${file.filename}`);
                }
            });

            return res.send({ success: true, fileNames: fileNames });
        } else {
            return res.status(400).send({ success: false, message: "Files are required" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: err.toString() });
    }
});





module.exports = router;
