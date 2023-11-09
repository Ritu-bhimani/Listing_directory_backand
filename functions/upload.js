const multer = require('multer');
const fs = require('fs');
const path = require('path');
const common = require("./common.js")

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

    if (allowedExtns?.includes(path.extname(file.originalname))) {
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


module.exports = {
    uploadImg,
    uploadImgs,
    uploadProfileImage
}
