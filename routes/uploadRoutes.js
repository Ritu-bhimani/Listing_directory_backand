const fs = require("fs");
const express = require("express");
const path = require("path");
const { uploadImg, uploadImgs } = require("../functions/upload.js");
const { uploadToCloudinary } = require("../functions/upload.js");

const DIR = './uploads/';

const router = express.Router();

// save to local folder
// router.post("/single", uploadImg.single("file"), async (req, res) => {
//     try {
//         if (req.file) {
//             const allowedExtns = [".jpeg", ".jpg", ".png"];
//             let url = req.protocol + "://" + req.get("host");
//             let fullUrl = req.file ? `${url}/public/${req.file.filename}` : "";

//             if (!allowedExtns?.includes(path.extname(req.file?.originalname))) {
//                 fs.unlink(`${DIR}${req.file.filename}`, (err) => {
//                     if (err) {
//                         console.log("img unlink error", err)
//                     }
//                 });
//                 return res.status(400).send({ success: false, message: "File upload only supports .jpeg .jpg .png format" });
//             }

//             if (req.file?.size > (1024 * 1024 * 5)) {    // 5MB max
//                 fs.unlink(`${DIR}${req.file.filename}`, (err) => {
//                     if (err) {
//                         console.log("img unlink error", err.toString())
//                     }
//                 });
//                 return res.status(400).send({ success: false, error: "File too Big, please select a file less than 5MB" })
//             }

//             // return res.send({ success: true, fileName: req.filename })
//             return res.send({ success: true, fileUrl: fullUrl })
//         }
//         else {
//             return res.status(400).send({ success: false, message: "File is required" })
//         }
//     } catch (err) {
//         return res.status(500).json({ success: false, error: err });
//     }
// });

// save to cloudinary
router.post("/single", uploadImg.single("file"), async (req, res) => {
    try {
        if (req.file) {
            const allowedExtns = [".jpeg", ".jpg", ".png"];

            if (!allowedExtns?.includes(path.extname(req.file?.originalname).toLowerCase())) {
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
                        console.log("img unlink error", err.toString())
                    }
                });
                return res.status(400).send({ success: false, error: "File too Big, please select a file less than 5MB" })
            }

            const cloudinaryResult = await uploadToCloudinary(req.file.path);

            if (cloudinaryResult?.success !== true) {
                return res.status(500).send({ ...cloudinaryResult });
            }

            const cloudinaryFileUrl = cloudinaryResult?.url;
            return res.send({ success: true, fileUrl: cloudinaryFileUrl })
        }
        else {
            return res.status(400).send({ success: false, message: "File is required" })
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: err });
    }
});

// save to local folder
// router.post("/multiple", uploadImgs.array("files"), async (req, res) => {
//     try {
//         if (req?.files && req.files.length > 0) {
//             let url = req.protocol + "://" + req.get("host");
//             const allowedExtns = [".jpeg", ".jpg", ".png"];
//             let fileUrls = [];

//             // if any file has not valid size or extension then it will send error msg in response
//             // req.files.forEach((file) => {
//             //     if (!allowedExtns.includes(path.extname(file.originalname))) {
//             //         fs.unlink(file.path, (err) => {
//             //             if (err) {
//             //                 console.log("img unlink error", err);
//             //             }
//             //         });
//             //         return res.status(400).send({ success: false, message: "File upload only supports .jpeg .jpg .png" });
//             //     }
//             //     if (file.size > 1024 * 1024 * 5) {
//             //         fs.unlink(file.path, (err) => {
//             //             if (err) {
//             //                 console.log("img unlink error", err);
//             //             }
//             //         });
//             //         return res.status(400).send({ success: false, error: "File too Big, please select a file less than 5MB" });
//             //     }
//             //     fileUrls.push(`${url}/public/${file.filename}`);
//             // });

//             req.files.forEach((file) => {
//                 if (!allowedExtns.includes(path.extname(file.originalname)) || file.size > 1024 * 1024 * 5) {
//                     fs.unlink(file.path, (err) => {
//                         if (err) {
//                             console.log("img unlink error", err.toString());
//                         }
//                     });
//                 } else {
//                     fileUrls.push(`${url}/public/${file.filename}`);
//                 }
//             });

//             return res.send({ success: true, fileUrls: fileUrls });
//         } else {
//             return res.status(400).send({ success: false, message: "Files are required" });
//         }
//     } catch (err) {
//         return res.status(500).json({ success: false, error: err });
//     }
// });

// save to cloudinary
router.post("/multiple", uploadImgs.array("files"), async (req, res) => {
    try {
        if (req?.files && req.files.length > 0) {
            const allowedExtns = [".jpeg", ".jpg", ".png"];
            let fileUrls = [];

            for (var i = 0; i < req.files.length; i++) {
                if (!allowedExtns.includes(path.extname(req.files[i].originalname).toLowerCase()) || req.files[i].size > 1024 * 1024 * 5) {
                    fs.unlink(req.files[i].path, (err) => {
                        if (err) {
                            console.log("img unlink error", err.toString());
                        }
                    });
                } else {
                   const cloudinaryResult = await uploadToCloudinary(req.files[i].path);

                    if (cloudinaryResult?.success === true) {
                        fileUrls.push(cloudinaryResult.url);
                    }
                }
            }

            return res.send({ success: true, fileUrls: fileUrls });

        } else {
            return res.status(400).send({ success: false, message: "Files are required" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: err });
    }
});

module.exports = router;
