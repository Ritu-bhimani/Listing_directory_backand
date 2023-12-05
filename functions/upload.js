const fs = require('fs');
const path = require('path');
const multer = require('multer');
const common = require("./common.js");
const { cloudinary } = require("../config/cloudinaryConfig.js");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        var newFilename = common.uuidv4() + path.extname(file.originalname).toLowerCase()
        cb(null, newFilename);
    },
});


const imgFileFilter = (req, file, cb) => {
    const allowedExtns = [".jpeg", ".jpg", ".png"];

    if (allowedExtns?.includes(path.extname(file.originalname).toLowerCase())) {
        return cb(null, true);
    } else {
        return cb(("error: File upload only supports .jpeg .jpg .png"));
        // return cb({ message: "File upload only supports .jpeg .jpg .png" });
        // return cb(null, false);
    }
}


const uploadProfileImage = multer({
    storage: storage,
    fileFilter: imgFileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
});


const uploadImg = multer({
    storage: storage,
    // fileFilter: imgFileFilter,       // uncoment if you want to allow automatic multer filter, limit check
    // limits: {
    //     fileSize: 1024 * 1024 * 5  // 5MB max file upload size
    // },
});


const uploadImgs = multer({
    storage: storage
});


const uploadToCloudinary = async (locaFilePath) => {

    const cloudinaryFolderName = "directory_listing/uploads/";

    // const filePathOnCloudinary = cloudinaryFolderName + path.basename(locaFilePath);    // this will give extname 2 times in uploaded Img Url

    const fileName = path.basename(locaFilePath, path.extname(locaFilePath).toLowerCase());              // storing filename without extension   // this will give extname 1 time in uploaded Img Url
    const filePathOnCloudinary = cloudinaryFolderName + path.basename(fileName);

    return cloudinary.uploader.upload(locaFilePath, { public_id: filePathOnCloudinary })
        .then((result) => {
            fs.unlinkSync(locaFilePath);
            return { success: true, url: result.url };
        })
        .catch((err) => {
            console.log("uploadToCloudinary catch err ", err);
            fs.unlinkSync(locaFilePath);
            return { success: false, error: 'Error uploading to Cloudinary' };
        })
}


module.exports = {
    uploadImg,
    uploadImgs,
    uploadProfileImage,
    uploadToCloudinary
}