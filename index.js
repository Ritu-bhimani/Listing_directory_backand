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

const abc = async () => {
    // const selectListingQuery = "SELECT count(*) AS listingCount, listingStatus FROM listing WHERE listingID = ? ";
    const selectListingQuery = "SELECT bsLogo, title FROM listing WHERE listingID = ? ";
    const selectListingRes = await new Promise((resolve, reject) => {
        db.query(selectListingQuery, 38, (err, data) => {
            if (err) {
                reject({ success: false, error: err.toString() });
            }
            resolve(data);
        }
        );
    });
    console.log("selectListingRes", selectListingRes);
}
// abc();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

// change listing request status, show all listing, show category wise num of listing(// only Approved, exists)
// userId - admin check,

// need to add this where getListingByID used
// else if (listingDataResult.success == false) {
//     return { ...listingDataResult }
// }

// user details ma admin n moklvo.

// admin profile details, pswd reset.
// listingById -  updateTime, postedTime n moklvo.
// favouritesIDs ma  to   listingID resej if user delete the listing.   How to remove from favouritesArray [].
// getUserPublicInfo - shu shu moklvu?       // current code commented
// if db not exists create automatically
// img - how upload on cloud
// numOfListingInEachCategory -  kya check karravva    only  Approved, only exists,  both ?     // current - only Approved, exists chhe.
// cloudinary img upload, allow only user role, edit listing bsLogo old vs new compare, check all api,  ss documnet


// edit listing -  single/multiple images update, previous remove  - done        //  select query thi old leva,  forntend new array vs old compare, old ma je n mle te unlink krva,  then  frontend new array update to table.
// show all users details - done
// addToFavourite - listingExists, aproved check     - done
// show own all listing reviews, own review add to another listiing - done
// statusChange -  if notExists - return msg               -  done
// listing - not approved, not exists - can't add review - done
// myGivenReview - join query not work  to get ListingTitle - done
