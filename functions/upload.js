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
        // cb(null, file.originalname);
        var newFilename = common.uuidv4() + path.extname(file.originalname).toLowerCase()
        cb(null, newFilename);
    },
});

const imgFileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png") {
        return cb(null, true);
    } else {
        // return cb(("Error: File upload only supports .jpeg .jpg .png"));
        return cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10  // 10mb max file upload size
    },
    fileFilter: imgFileFilter
});

const uploadMultiple = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10  // 10mb max size
    },
    fileFilter: imgFileFilter
}).array('photos', 5);       // max 5 file            // OR   uploadMultiple.array('photos', 5) while creating routes



module.exports = {
    upload,
    uploadMultiple
}
