const express = require("express")
const cors = require("cors")
const mysql = require("mysql2")
const dotenv = require("dotenv").config()
const validator = require("validator")
const bcrypt = require("bcrypt")
var nodemailer = require('nodemailer');
const db = require("./config/dbConfig.js");
const serverRoutes = require("./routes/serverRoutes.js");
const jwt = require("jsonwebtoken");
const { jwtDecode } = require('jwt-decode');
const common = require("./functions/common.js")
const { uploadImg } = require("./functions/upload.js")

const app = express()
const port = process.env.PORT || 5001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors())

app.use("/", serverRoutes);
app.use('/public', express.static('uploads/'));    // http://localhost:5000/public/download.jpg   // http://localhost:5000/public/563c1b31-2377-47fd-abcd-b6810c25943a.jpg



db.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }
    console.log('Connected to database as ID ' + db.threadId);
});


app.get("/", async (req, res) => {
    const selectQuery = "SELECT * FROM listing limit 1";

    const result = await new Promise((resolve, reject) => {
        db.query(
            selectQuery, "57", (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            }
        );
    });

    return res.send(result);
})


app.post("/addListing", async (req, res) => {
    try {

        const insertQuery =
            "INSERT INTO listing(listingID, userID, title, address, listingCityID, phone, website, categoryID, price, businessHours, socialMedia, faqs, description, keywords, bsVideoUrl, bsImages, bsLogo, listingStatus, postedDateTime, review, updateDateTime, isListingExists) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";

        const result = await new Promise((resolve, reject) => {
            db.query(
                insertQuery,
                [
                    null,
                    63,
                    "listing title 2 description .....",
                    JSON.stringify({ "lat": "", "lng": "" }),
                    1,
                    "+809934562387",
                    "https://www.listing2.com",
                    1,
                    JSON.stringify({ "range": "$$ - Moderate", "priceFrom": "", "priceTo": "" }),
                    JSON.stringify([{ "day": "Monday", "timeFrom": "09:00 AM", "timeTo": "05:00 PM", "isOpenFullDay": false }, { "day": "Tuesday", "timeFrom": "", "timeTo": "", "isOpenFullDay": true }]),
                    JSON.stringify([{ "socMdaName": "instagram", "url": "https://www.instagram.com" }]),
                    JSON.stringify([{ "faq": "ques1", "answer": "answer1" }]),
                    "listing title 2 description .....",
                    "Entertainment, Art, best art making company",
                    "https:/www.listing2.com/video/1",
                    JSON.stringify(["", ""]),
                    "logo.jpg",
                    "Pending",
                    new Date().toISOString(),
                    JSON.stringify([4, 3, 5]),
                    null,
                    "exists"
                ],
                (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        console.log("addListing insert query result ", result)

        return res.send(result);
    }
    catch (err) {
        return res.send({ success: false, error: err });

    }
})


app.post("/image", uploadImg.single("bsLogo"), async (req, res) => {
    console.log("/image req.file ", req.file)

    return res.send({ file: req.file });
})


app.post("/images", uploadImg.array("bsImages", 5), async (req, res) => {  // if you upload any files more than 5, it will give error Unexpected field.  same error if you don't provide fieldname "bsImages"
    console.log("/images req.files ", req.files)

    return res.send({ file: req.files });
})


app.post("/combineImg", uploadImg.fields(
    [
        { name: 'bsImages', maxCount: 2 },
        { name: 'bsLogo', maxCount: 1 }
    ]),
    async (req, res) => {

        const bsImagesData = req.files?.["bsImages"];
        const bsLogo = req.files?.["bsLogo"][0];

        console.log("/combine bsImagesData ", bsImagesData);
        console.log("/combine bsLogo ", bsLogo);
    }
)


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

