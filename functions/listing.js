const express = require("express");
const validator = require("validator");
const isEmpty = require("lodash.isempty");
const db = require("../config/dbConfig.js");
const user = require("../functions/user.js");
const { uuidv4 } = require("./common.js");
const fs = require("fs");
const { addNotification } = require("./notification.js")

const router = express.Router();

// previous
// let addListing = async (data) => {   // requird - title, category, description 

//     try {
//         const insertQuery =
//             "INSERT INTO listing(listingID, userID, title, address, listingCityID, phone, website, categoryID, price, businessHours, socialMedia, faqs, description, keywords, bsVideoUrl, bsImages, bsLogo, listingStatus, postedDateTime, reviews, updateDateTime, isListingExists) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";

//         const date = new Date();

//         const result = await new Promise((resolve, reject) => {
//             db.query(
//                 insertQuery,
//                 [
//                     null,                                     // listingID
//                     data?.userID,                             // userID
//                     data?.title,                              // title
//                     JSON.stringify(data?.address || {}),      // address
//                     data?.city || null,                       // listingCityID
//                     data?.phone || null,                      // phone
//                     data?.website || null,                    // website
//                     data.category,                            // categoryID      
//                     JSON.stringify(data?.price || {}),         // price
//                     JSON.stringify(data?.businessHours || []),  // businessHours
//                     JSON.stringify(data?.socialMedia || []),    // socialMedia
//                     JSON.stringify(data?.faqs || []),           // faqs
//                     data?.description,                          // description
//                     data?.keywords || null,                   //  keywords
//                     data?.bsVideoUrl || null,                   // bsVideoUrl,
//                     JSON.stringify(data?.bsImages || []),      // bsImages,
//                     data?.bsLogo || null,                       // bsLogo
//                     "Pending",                  // listingStatus  enum('Approved', 'Canceled', 'Pending')
//                     date.toISOString().slice(0, 19).replace('T', ' '),   // postedDateTime       // new Date().toISOString(),   // postedDateTime
//                     JSON.stringify([]),          // reviews
//                     null,                         //  updateDateTime
//                     "exists"                     //  isListingExists
//                 ],
//                 (err, data) => {
//                     if (err) {
//                         if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW" || err.code === "ER_NO_REFERENCED_ROW_1") {
//                             return reject({ success: false, error: "Invalid city or category. Please provide valid city or category." });
//                         }
//                         reject({ success: false, error: err.toString() });
//                     }
//                     resolve(data);
//                 }
//             );
//         });

//         if (result && result?.insertId) {
//             return { success: true, listingID: result?.insertId }
//         }

//     } catch (err) {
//         return { success: false, error: err }
//     }
// }

// changed according to new listing, review tables
// let addListing = async (data) => {   // requird - title, category, description 

//     try {
//         const insertQuery =
//             "INSERT INTO listing(listingID, userID, title, address, listingCityID, phone, website, categoryID, price, businessHours, socialMedia, faqs, description, keywords, bsVideoUrl, bsImages, bsLogo, listingStatus, postedDateTime, updateDateTime, isListingExists, approveTime, rejectTime, tagline) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";

//         const date = new Date();

//         const result = await new Promise((resolve, reject) => {
//             db.query(
//                 insertQuery,
//                 [
//                     null,                                     // listingID
//                     data?.userID,                             // userID
//                     data?.title,                              // title
//                     JSON.stringify(data?.address || {}),      // address
//                     data?.city || null,                       // listingCityID
//                     data?.phone || null,                      // phone
//                     data?.website || null,                    // website
//                     data.category,                            // categoryID      
//                     JSON.stringify(data?.price || {}),         // price
//                     JSON.stringify(data?.businessHours || []),  // businessHours
//                     JSON.stringify(data?.socialMedia || []),    // socialMedia
//                     JSON.stringify(data?.faqs || []),           // faqs
//                     data?.description,                          // description
//                     data?.keywords || null,                   //  keywords
//                     data?.bsVideoUrl || null,                   // bsVideoUrl,
//                     JSON.stringify(data?.bsImages || []),      // bsImages,
//                     data?.bsLogo || null,                       // bsLogo
//                     "Pending",                  // listingStatus  enum('Approved', 'Canceled', 'Pending')
//                     date.toISOString().slice(0, 19).replace('T', ' '),   // postedDateTime       // new Date().toISOString(),   // postedDateTime
//                     null,                         //  updateDateTime
//                     "exists",                     //  isListingExists
//                     null,                         //  approveTime
//                     null,                         //  rejectTime
//                     data?.tagline || null         //  tagline    
//                 ],
//                 (err, data) => {
//                     if (err) {
//                         if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW" || err.code === "ER_NO_REFERENCED_ROW_1") {
//                             return reject({ success: false, error: "Invalid city or category. Please provide valid city or category." });
//                         }
//                         reject({ success: false, error: err.toString() });
//                     }
//                     resolve(data);
//                 }
//             );
//         });

//         if (result && result?.insertId) {
//             return { success: true, listingID: result?.insertId }
//         }

//     } catch (err) {
//         return { success: false, error: err }
//     }
// }


// added notification
let addListing = async (data) => {   // requird - title, category, description 
    try {
        const insertQuery =
            "INSERT INTO listing(listingID, userID, title, address, listingCityID, phone, website, categoryID, price, businessHours, socialMedia, faqs, description, keywords, bsVideoUrl, bsImages, bsLogo, listingStatus, postedDateTime, updateDateTime, isListingExists, approveTime, rejectTime, tagline) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";

        const date = new Date();

        const result = await new Promise((resolve, reject) => {
            db.query(
                insertQuery,
                [
                    null,                                     // listingID
                    data?.userID,                             // userID
                    data?.title,                              // title
                    JSON.stringify(data?.address || {}),      // address
                    data?.city || null,                       // listingCityID
                    data?.phone || null,                      // phone
                    data?.website || null,                    // website
                    data.category,                            // categoryID
                    JSON.stringify(data?.price || {}),         // price
                    JSON.stringify(data?.businessHours || []),  // businessHours
                    JSON.stringify(data?.socialMedia || []),    // socialMedia
                    JSON.stringify(data?.faqs || []),           // faqs
                    data?.description,                          // description
                    data?.keywords || null,                   //  keywords
                    data?.bsVideoUrl || null,                   // bsVideoUrl,
                    JSON.stringify(data?.bsImages || []),      // bsImages,
                    data?.bsLogo || null,                       // bsLogo
                    "Pending",                  // listingStatus  enum('Approved', 'Rejected', 'Pending')
                    date.toISOString().slice(0, 19).replace('T', ' '),   // postedDateTime       // new Date().toISOString(),   // postedDateTime
                    null,                         //  updateDateTime
                    "exists",                     //  isListingExists
                    null,                         //  approveTime
                    null,                         //  rejectTime
                    data?.tagline || null         //  tagline
                ],
                (err, data) => {
                    if (err) {
                        if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW" || err.code === "ER_NO_REFERENCED_ROW_1") {
                            return reject({ success: false, error: "Invalid city or category. Please provide valid city or category." });
                        }
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (result && result?.insertId) {
            let datas = {
                type: "listing_added",
                listingID: result?.insertId,
                listingTitle: data.title,
                createdByID: data.userID,
                notificationView: JSON.stringify([]),
                clearNotification: JSON.stringify([]),
                approvals: null,
                createdFor: null    // for admin
            };
            await addNotification(datas);
            return { success: true, listingID: result?.insertId }
        }

    } catch (err) {
        return { success: false, error: err }
    }
}

const validateAddListingFields = async (data) => {
    let errors = {};

    data.title = data?.title ? data.title.toString() : "";
    data.category = data?.category ? data.category.toString() : "";
    data.description = data?.description ? data.description.toString() : "";

    if (validator.isEmpty(data.title)) {
        errors.title = "title field is required";
    }

    if (validator.isEmpty(data.category)) {
        errors.category = "category field is required";
    }

    if (validator.isEmpty(data.description)) {
        errors.description = "description field is required";
    }

    const additionalErrors = await validateListingRemainFields(data) // address, price, businessHours, socialMedia, faqs, bsImages
    errors = { ...errors, ...additionalErrors }

    return {
        errors,
        isValid: isEmpty(errors),
    };
}

// changed according to new listing, review tables
// const editListing = async (data) => {
//     try {
//         // const listingData = await getListingByID(data.listingID);  +  resolve(data?.[0]);  // if listingID is not valid then not giving err in response
//         // console.log(listingData)

//         const listingDataResult = await getListingByID(data.listingID);

//         if (listingDataResult && listingDataResult.length == 0) {
//             return { success: false, message: "Provided listing id is invalid" };
//         }
//         else if (listingDataResult.success == false) {
//             return { ...listingDataResult };
//         }
//         else if (listingDataResult && listingDataResult[0].isListingExists !== "exists") {
//             return { success: false, message: "Listing doesn't exists" };
//         }

//         const listingData = listingDataResult[0];
//         const date = new Date();

//         listingData.title = data?.title ? data.title : data?.title == "" ? null : listingData.title;
//         listingData.listingCityID = data?.city ? data.city : data.city == "" ? null : listingData.listingCityID;
//         listingData.phone = data?.phone ? data.phone : data.phone == "" ? null : listingData.phone;
//         listingData.website = data?.website ? data.website : data.website == "" ? null : listingData.website;
//         listingData.categoryID = data?.category ? data.category : data.category == "" ? null : listingData.categoryID;
//         listingData.description = data?.description ? data.description : data?.description == "" ? null : listingData.description;
//         listingData.keywords = data?.keywords ? data.keywords : data?.keywords == "" ? null : listingData.keywords;
//         listingData.bsVideoUrl = data?.bsVideoUrl ? data.bsVideoUrl : data.bsVideoUrl == "" ? null : listingData.bsVideoUrl;
//         listingData.bsLogo = data?.bsLogo ? data.bsLogo : data?.bsLogo == "" ? null : listingData.bsLogo;
//         listingData.tagline = data?.tagline ? data.tagline : data?.tagline == "" ? null : listingData.tagline;

//         listingData.businessHours = data?.businessHours ? data.businessHours : listingData.businessHours;
//         listingData.price = data?.price ? data.price : listingData.price;
//         listingData.address = data?.address ? data.address : listingData.address;
//         listingData.faqs = data?.faqs ? data.faqs : listingData.faqs;
//         listingData.bsImages = data?.bsImages ? data.bsImages : listingData.bsImages;
//         listingData.socialMedia = data?.socialMedia ? data.socialMedia : listingData.socialMedia;
//         // listingData.updateDateTime = new Date().toISOString();
//         listingData.updateDateTime = date.toISOString().slice(0, 19).replace('T', ' ')

//         // listingStatus, reviews, postedDateTime, isListingExists, approveTime, rejectTime - user can't change

//         const updateQuery = "UPDATE listing SET title = ?, address = ?, listingCityID = ?, phone = ?, website = ?, categoryID =?, price = ?, businessHours = ?, socialMedia = ?, faqs = ?, description = ?, keywords = ?, bsVideoUrl = ?, bsImages = ?, bsLogo = ?, updateDateTime = ?, tagline = ? WHERE listingID = ? ";

//         const result = await new Promise((resolve, reject) => {
//             db.query(updateQuery,
//                 [
//                     listingData.title,
//                     JSON.stringify(listingData.address),
//                     listingData.listingCityID,
//                     listingData.phone,
//                     listingData.website,
//                     listingData.categoryID,
//                     JSON.stringify(listingData.price),
//                     JSON.stringify(listingData.businessHours),
//                     JSON.stringify(listingData.socialMedia),
//                     JSON.stringify(listingData.faqs),
//                     listingData.description,
//                     listingData.keywords,
//                     listingData.bsVideoUrl,
//                     JSON.stringify(listingData.bsImages),
//                     listingData.bsLogo,
//                     listingData.updateDateTime,
//                     listingData.tagline,
//                     listingData.listingID,
//                 ],
//                 (err, data) => {
//                     if (err) {
//                         if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW" || err.code === "ER_NO_REFERENCED_ROW_1") {
//                             return reject({ success: false, error: "Invalid city or category. Please provide valid city or category." });
//                         }
//                         reject({ success: false, error: err.toString() });
//                     }
//                     resolve(data);
//                 }
//             );
//         });

//         if (result && result?.affectedRows > 0) {
//             return { success: true, listingID: data.listingID };
//         } else if (result && result?.affectedRows == 0) {
//             return { success: false, message: "listingID is invalid" };
//         }
//         else {
//             return { success: false, message: "Internal Server Error" };
//         }

//     } catch (err) {
//         return { success: false, error: err }
//     }
// }


// added notification
const editListing = async (data) => {
    try {
        // const listingData = await getListingByID(data.listingID);  +  resolve(data?.[0]);  // if listingID is not valid then not giving err in response
        // console.log(listingData)

        const DIR = './uploads';

        const listingDataResult = await getListingByID(data.listingID);

        if (listingDataResult && listingDataResult.length == 0) {
            return { success: false, message: "Provided listing id is invalid" };
        }
        else if (listingDataResult.success == false) {
            return { ...listingDataResult };
        }
        else if (listingDataResult && listingDataResult[0].isListingExists !== "exists") {
            return { success: false, message: "Listing doesn't exists" };
        }

        // old bsLogo entry exists in db, then check old/updated same, not same then check old exists in directory then remove
        const oldBsLogo = listingDataResult?.[0]?.bsLogo;
        const updatedBsLogo = data?.bsLogo;

        if (oldBsLogo) {
            const isBsLogoSame = (oldBsLogo === updatedBsLogo);

            // if oldBsLogo not same then check oldBsLogo present in dir, if exists remove
            if (!isBsLogoSame) {
                let fileName = oldBsLogo?.split("/public")?.[1];
                const isOldBsLogoExistsInDir = fs.existsSync(`${DIR}${fileName}`);

                if (isOldBsLogoExistsInDir) {
                    fs.unlink(`${DIR}${fileName}`, (err) => {
                        if (err) {
                            console.log("bsLogo unlink error", err.toString())
                        }
                    });
                }

            }
        }

        // find if any bsImages urls removed from old and if any then remove imgs from folder
        const updatedBsImages = data?.bsImages || [];
        const oldBsImages = JSON.parse(listingDataResult?.[0]?.bsImages) || [];

        if (oldBsImages?.length > 0 && updatedBsImages) {

            const removedUrlIndex = [];
            oldBsImages?.forEach((curr, ind) => {
                if (!updatedBsImages?.includes(curr)) {
                    removedUrlIndex.push(ind);
                }
            });

            if (removedUrlIndex?.length > 0) {
                removedUrlIndex?.forEach((indexNum) => {
                    let fileName = oldBsImages[indexNum]?.split("/public")?.[1];

                    fs.unlink(`${DIR}${fileName}`, (err) => {
                        if (err) {
                            console.log("bsImg unlink error", err.toString())
                        }
                    })
                });
            }
        }

        const listingData = listingDataResult[0];
        const date = new Date();

        listingData.title = data?.title ? data.title : data?.title == "" ? null : listingData.title;
        listingData.listingCityID = data?.city ? data.city : data.city == "" ? null : listingData.listingCityID;
        listingData.phone = data?.phone ? data.phone : data.phone == "" ? null : listingData.phone;
        listingData.website = data?.website ? data.website : data.website == "" ? null : listingData.website;
        listingData.categoryID = data?.category ? data.category : data.category == "" ? null : listingData.categoryID;
        listingData.description = data?.description ? data.description : data?.description == "" ? null : listingData.description;
        listingData.keywords = data?.keywords ? data.keywords : data?.keywords == "" ? null : listingData.keywords;
        listingData.bsVideoUrl = data?.bsVideoUrl ? data.bsVideoUrl : data.bsVideoUrl == "" ? null : listingData.bsVideoUrl;
        listingData.bsLogo = data?.bsLogo ? data.bsLogo : data?.bsLogo == "" ? null : listingData.bsLogo;
        listingData.tagline = data?.tagline ? data.tagline : data?.tagline == "" ? null : listingData.tagline;

        listingData.businessHours = data?.businessHours ? JSON.stringify(data.businessHours) : listingData.businessHours;
        listingData.price = data?.price ? JSON.stringify(data.price) : listingData.price;
        listingData.address = data?.address ? JSON.stringify(data.address) : listingData.address;
        listingData.faqs = data?.faqs ? JSON.stringify(data.faqs) : listingData.faqs;
        listingData.bsImages = data?.bsImages ? JSON.stringify(data.bsImages) : listingData.bsImages;
        listingData.socialMedia = data?.socialMedia ? JSON.stringify(data.socialMedia) : listingData.socialMedia;
        // listingData.updateDateTime = new Date().toISOString();
        listingData.updateDateTime = date.toISOString().slice(0, 19).replace('T', ' ')
        listingData.listingStatus = "Pending"      // if listing already 'approved' then also make 'pending'

        // listingStatus, reviews, postedDateTime, isListingExists, approveTime, rejectTime - user can't change

        const updateQuery = "UPDATE listing SET title = ?, address = ?, listingCityID = ?, phone = ?, website = ?, categoryID =?, price = ?, businessHours = ?, socialMedia = ?, faqs = ?, description = ?, keywords = ?, bsVideoUrl = ?, bsImages = ?, bsLogo = ?, updateDateTime = ?, tagline = ?, listingStatus = ? WHERE listingID = ? ";

        const result = await new Promise((resolve, reject) => {
            db.query(updateQuery,
                [
                    listingData.title,
                    listingData.address,
                    listingData.listingCityID,
                    listingData.phone,
                    listingData.website,
                    listingData.categoryID,
                    listingData.price,
                    listingData.businessHours,
                    listingData.socialMedia,
                    listingData.faqs,
                    listingData.description,
                    listingData.keywords,
                    listingData.bsVideoUrl,
                    listingData.bsImages,
                    listingData.bsLogo,
                    listingData.updateDateTime,
                    listingData.tagline,
                    listingData.listingStatus,      // if listing already 'approved' then also make 'pending'    // need to change approveTime to "" ?
                    listingData.listingID
                ],
                (err, data) => {
                    if (err) {
                        if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW" || err.code === "ER_NO_REFERENCED_ROW_1") {
                            return reject({ success: false, error: "Invalid city or category. Please provide valid city or category." });
                        }
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (result && result?.affectedRows > 0) {
            let datas = {
                type: "listing_updated",
                listingID: listingData.listingID,
                listingTitle: listingData.title,
                createdByID: listingData.userID,
                notificationView: JSON.stringify([]),
                clearNotification: JSON.stringify([]),
                approvals: null,
                createdFor: null  // for admin
            };
            await addNotification(datas);
            return { success: true, listingID: data.listingID };
        } else if (result && result?.affectedRows == 0) {
            return { success: false, message: "listingID is invalid" };
        }
        else {
            return { success: false, message: "Internal Server Error" };
        }

    } catch (err) {
        return { success: false, error: err }
    }
}

const getListingByID = async (listingID) => {
    try {
        const selectQuery = "SELECT * FROM listing WHERE listingID = ? limit 1";

        const result = await new Promise((resolve, reject) => {
            db.query(selectQuery, listingID, (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                // resolve(data?.[0]);
                resolve(data);
            });
        });
        return result;
    } catch (err) {
        return { success: false, error: err };      // here err.toString()  gives obj obj
    }
};

const validateEditListingFields = async (data) => {  // requird fields - listingID, title, category, description
    let errors = {};

    data.listingID = data?.listingID ? data.listingID.toString() : "";
    data.title = data?.title ? data.title.toString() : "";
    data.category = data?.category ? data.category.toString() : "";
    data.description = data?.description ? data.description.toString() : "";

    if (validator.isEmpty(data.listingID)) {
        errors.listingID = "listingID field is required";
    }

    if (validator.isEmpty(data.title)) {
        errors.title = "title field is required";
    }

    if (validator.isEmpty(data.category)) {
        errors.category = "category field is required";
    }

    if (validator.isEmpty(data.description)) {
        errors.description = "description field is required";
    }

    const additionalErrors = await validateListingRemainFields(data) // address, price, businessHours, socialMedia, faqs, bsImages
    errors = { ...errors, ...additionalErrors }

    return {
        errors,
        isValid: isEmpty(errors),
    };
}

const deleteListing = async (listingID) => {     // this will only change user  "isAccountExists"  status from  exists to  notExists. // not delete the record/account from user table.
    try {
        // const deleteQuery = "DELETE FROM listing WHERE listingID = ? ";
        const updateQuery = "UPDATE listing SET isListingExists = ?, updateDateTime = ? WHERE listingID = ? ";

        const date = new Date();
        const updateTime = date.toISOString().slice(0, 19).replace('T', ' ');

        const result = await new Promise((resolve, reject) => {
            db.query(updateQuery, ["notExists", updateTime, listingID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        if (result && result?.affectedRows > 0) {
            return { success: true }
        } else if (result && result?.affectedRows == 0) {
            return { success: false, message: "Provided listingID is invalid" }
        } else {
            return { success: false, message: "Internal server error" }
        }
    } catch (err) {
        return { success: false, error: err }
    }
}

// previous
// const getAllListing = async () => {
//     try {
//         const query = "SELECT * FROM listing";

//         const result = await new Promise((resolve, reject) => {
//             db.query(query, (err, data) => {
//                 if (err) {
//                     reject({ success: false, error: err.toString() });
//                 }
//                 resolve(data);
//             }
//             );
//         });

//         if (result && result?.length > 0) {
//             return { success: true, data: result };
//         } else {
//             return { success: false, message: "No listings found" };
//         }
//     } catch (err) {
//         return { success: false, error: err }
//     }
// }

// changed according to new listing, review tables
const getAllListing = async () => {
    try {
        // const query = "SELECT li.listingID, li.title, r.* FROM listing AS li LEFT JOIN reviews AS r ON li.listingID = r.rwListingID ";
        // const query = `SELECT li.listingID, li.title, r.* As ABC FROM listing AS li LEFT JOIN reviews AS r ON li.listingID = r.rwListingID where r.rwListingID = li.listingID`;

        const reviewQuery = "SELECT * FROM reviews ORDER BY rwListingID ASC";
        // const listingQuery = "SELECT * FROM listing ORDER BY listingID ASC"; 
        const listingQuery = `SELECT li.*, u.userID, u.userName, u.email, u.phone, u.bio, u.socialNetworks, u.verificationStatus, u.profileImage, u.registerDateTime, u.lastName, u.firstName FROM listing AS li JOIN users AS u ON li.userID = u.userID ORDER BY listingID ASC;`;     // listings with owner's few details

        const reviewsResult = await new Promise((resolve, reject) => {
            db.query(reviewQuery, (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        const listingsResult = await new Promise((resolve, reject) => {
            db.query(listingQuery, (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        const combineRecords = listingsResult?.map((listing) => {
            const currListing = listing;
            currListing.reviews = [];
            reviewsResult.forEach((currReview) => {
                if (listing.listingID == currReview.rwListingID) {
                    currListing.reviews.push(currReview);
                }
            })
            return currListing;
        })

        if (combineRecords && combineRecords?.length > 0) {
            return { success: true, data: combineRecords };
        } else {
            return { success: false, message: "No listings found" };
        }

    } catch (err) {
        return { success: false, error: err }
    }
}

// previous
// const getMyListing = async (ownerID) => {
//     try {
//         const query = "SELECT * FROM listing WHERE userID = ?";
//         const result = await new Promise((resolve, reject) => {
//             db.query(
//                 query, ownerID, (err, data) => {
//                     if (err) {
//                         reject({ success: false, error: err.toString() });
//                     }
//                     resolve(data);
//                 }
//             );
//         });

//         if (result && result?.length > 0) {
//             return { success: true, data: result };
//         } else {
//             return { success: false, message: "No listings found" };
//         }
//     } catch (err) {
//         return { success: false, error: err }
//     }
// }

// changed according to new listing, review tables
const getMyListing = async (ownerID) => {
    try {
        // const reviewQuery = "SELECT * FROM reviews WHERE rwListingID IN (SELECT listingID FROM listing WHERE userID = ?)";
        // const listingQuery = "SELECT * FROM listing WHERE userID = ? ORDER BY listingID ASC";
        const reviewQuery = `SELECT * FROM reviews WHERE rwListingID IN (SELECT listingID FROM listing WHERE userID = ? AND isListingExists = "exists" )`;
        const listingQuery = `SELECT * FROM listing WHERE userID = ? AND isListingExists = "exists" ORDER BY listingID ASC`;

        const reviewsResult = await new Promise((resolve, reject) => {
            db.query(reviewQuery, [ownerID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        const listingsResult = await new Promise((resolve, reject) => {
            db.query(listingQuery, [ownerID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        // combine reviews to belonging listing 
        const combineRecords = listingsResult?.map((listing) => {
            const currListing = listing;
            currListing.reviews = [];
            reviewsResult.forEach((currReview) => {
                if (listing.listingID == currReview.rwListingID) {
                    currListing.reviews.push(currReview);
                }
            })
            return currListing;
        })

        if (combineRecords && combineRecords?.length > 0) {
            return { success: true, data: combineRecords };
        } else {
            return { success: false, message: "No listings found" };
        }

    } catch (err) {
        return { success: false, error: err }
    }
}

// according to new listing, review tables
const getMyPendingListing = async (ownerID) => {        // pending listing ma review add n thay.
    try {
        const listingQuery = `SELECT * FROM listing WHERE userID = ? AND isListingExists = "exists" AND listingStatus = "Pending" ORDER BY listingID ASC`;

        const listingsResult = await new Promise((resolve, reject) => {
            db.query(listingQuery, [ownerID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        if (listingsResult && listingsResult?.length > 0) {
            return { success: true, data: listingsResult };
        } else {
            // return { success: false, message: "No listings found" };
            return { success: true, data: [], message: "No listings found" };
        }

    } catch (err) {
        return { success: false, error: err }
    }
}

// according to new listing, review tables
const getMyApprovedListing = async (ownerID) => {
    try {
        const reviewQuery = `SELECT * FROM reviews WHERE rwListingID IN (SELECT listingID FROM listing WHERE userID = ? AND isListingExists = "exists" AND listingStatus = "Approved")`;
        const listingQuery = `SELECT * FROM listing WHERE userID = ? AND isListingExists = "exists" AND listingStatus = "Approved" ORDER BY listingID ASC`;

        const reviewsResult = await new Promise((resolve, reject) => {
            db.query(reviewQuery, [ownerID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        const listingsResult = await new Promise((resolve, reject) => {
            db.query(listingQuery, [ownerID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        // combine reviews to belonging listing 
        const combineRecords = listingsResult?.map((listing) => {
            const currListing = listing;
            currListing.reviews = [];
            reviewsResult.forEach((currReview) => {
                if (listing.listingID == currReview.rwListingID) {
                    currListing.reviews.push(currReview);
                }
            })
            return currListing;
        })

        if (combineRecords && combineRecords?.length > 0) {
            return { success: true, data: combineRecords };
        } else {
            // return { success: false, message: "No listings found" };
            return { success: true, data: [], message: "No listings found" };
        }
    } catch (err) {
        return { success: false, error: err }
    }
}


// according to new listing, review tables
const getMyRejectedListing = async (ownerID) => {
    try {
        const listingQuery = `SELECT * FROM listing WHERE userID = ? AND isListingExists = "exists" AND listingStatus = "Rejected" ORDER BY listingID ASC`;

        const listingsResult = await new Promise((resolve, reject) => {
            db.query(listingQuery, [ownerID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        if (listingsResult && listingsResult?.length > 0) {
            return { success: true, data: listingsResult };
        } else {                                                               // there is not any listing in 'Rejected' state 
            // return { success: false, message: "No listings found" };
            return { success: true, data: [], message: "No listings found" };
        }

    } catch (err) {
        return { success: false, error: err }
    }
}

// previous
// const getListing = async (listingID) => {
//     try {
//         const query = "SELECT * FROM listing WHERE listingID = ?";
//         const result = await new Promise((resolve, reject) => {
//             db.query(
//                 query, listingID, (err, data) => {
//                     if (err) {
//                         reject({ success: false, error: err.toString() });
//                     }
//                     resolve(data);
//                 }
//             );
//         });

//         if (result && result?.length > 0) {
//             return { success: true, data: result[0] };
//         } else {
//             return { success: false, message: "listing ID is invalid" };
//         }

//     } catch (error) {
//         return { success: false, error: err }
//     }
// }

// changed according to new listing, review tables
const getListing = async (listingID) => {
    try {
        const listingQuery = "SELECT * FROM listing WHERE listingID = ? limit 1";
        const listingResult = await new Promise((resolve, reject) => {
            db.query(
                listingQuery, listingID, (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (!listingResult || !(listingResult?.length > 0)) {
            return { success: false, message: "listing ID is invalid" };
        }

        if (listingResult.length > 0 && listingResult[0].isListingExists !== "exists" || listingResult[0].listingStatus !== "Approved") {
            return { success: false, message: "Listing doesn't exists" };   // Listing not found or not approved.
        }

        // get reviews of particular listingID
        const reviewQuery = "SELECT * FROM reviews WHERE rwListingID = ? ORDER BY reviewID";
        const reviewsResult = await new Promise((resolve, reject) => {
            db.query(reviewQuery, [listingID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        const combineRecords = listingResult?.map((listing) => {
            const currListing = listing;
            currListing.reviews = [];
            reviewsResult.forEach((currReview) => {
                if (listing.listingID == currReview.rwListingID) {
                    currListing.reviews.push(currReview);
                }
            })
            return currListing;
        })

        if (combineRecords && combineRecords?.length > 0) {
            return { success: true, data: combineRecords };
        } else {
            return { success: false, message: "listing ID is invalid" };
        }

    } catch (error) {
        return { success: false, error: err }
    }
}

const addToFavourite = async (userID, listingID) => {
    try {
        // check listingID exists
        // const selectListingQuery = "SELECT count(*) AS listingCount FROM listing WHERE listingID = ? ";
        const selectListingQuery = "SELECT count(*) AS listingCount, listingStatus, isListingExists FROM listing WHERE listingID = ? ";
        const selectListingRes = await new Promise((resolve, reject) => {
            db.query(selectListingQuery, listingID, (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            }
            );
        });

        if (selectListingRes[0] && !selectListingRes[0]?.listingCount > 0) {
            return { success: false, message: "listingID is invalid" }
        }

        // can't add not approved/exists listing to favourite
        if (selectListingRes[0] && selectListingRes[0]?.listingStatus !== 'Approved' || selectListingRes[0]?.isListingExists !== "exists") {
            return { success: false, message: "Listing doesn't exists" };
        }

        // get user favourites listings
        const selectQuery = "SELECT favourites FROM users WHERE userID = ? limit 1";
        const selectRes = await new Promise((resolve, reject) => {
            db.query(selectQuery, userID, (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            }
            );
        });

        let userFavourites = [];
        userFavourites = JSON.parse(selectRes[0]?.favourites);

        if (userFavourites && userFavourites.includes(listingID)) {
            return { success: false, message: "This listing already present in your favourite listings list" }
        }

        const date = new Date();
        const updateTime = date.toISOString().slice(0, 19).replace('T', ' ');

        // add listing to favourites
        userFavourites.push(listingID)
        const updateQuery = "UPDATE users SET favourites = ?, updateDateTime = ? WHERE userID = ?";
        const updateRes = await new Promise((resolve, reject) => {
            db.query(
                updateQuery, [JSON.stringify(userFavourites), updateTime, userID], (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (updateRes && updateRes?.affectedRows > 0) {
            return { success: true }
        }
        else {
            return { success: false }
        }
    } catch (error) {
        return { success: false, error: err }
    }
}

const removeFromFavourite = async (userID, listingID) => {
    try {
        // get user's favourite listings ids
        const selectQuery = "SELECT favourites FROM users WHERE userID = ? limit 1";
        const selectRes = await new Promise((resolve, reject) => {
            db.query(selectQuery, userID, (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            }
            );
        });

        let userFavourites = [];
        userFavourites = JSON.parse(selectRes[0]?.favourites);

        userFavourites = userFavourites.filter(listingId => listingId !== listingID)     // removed listingID from favourites

        const date = new Date();
        const updateTime = date.toISOString().slice(0, 19).replace('T', ' ');

        // update user favourites
        const updateQuery = "UPDATE users SET favourites = ?, updateDateTime = ? WHERE userID = ?";
        const updateRes = await new Promise((resolve, reject) => {
            db.query(
                updateQuery, [JSON.stringify(userFavourites), updateTime, userID], (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (updateRes && updateRes?.affectedRows > 0) {
            return { success: true }
        }
        else {
            return { success: false }
        }
    } catch (error) {
        return { success: false, error: err }
    }
}

// previous
// const getMyFavouritesWithDetails = async (userID) => {
//     try {
//         const query = "SELECT li.* FROM users AS u INNER JOIN listing AS li ON u.userID = li.userID WHERE u.userID = ? AND JSON_CONTAINS(u.favourites, li.listingID)";

//         const selectRes = await new Promise((resolve, reject) => {
//             db.query(query, [userID], (err, data) => {
//                 if (err) {
//                     reject({ success: false, error: err.toString() });
//                 }
//                 resolve(data);
//             }
//             );
//         });

//         if (selectRes && selectRes?.length > 0) {
//             return { success: true, data: selectRes };
//         } else {
//             return { success: false, message: "No favourite listings found" };     //  favourites will be empty []
//         }

//     } catch (err) {
//         return { success: false, error: err }
//     }
// }

// changed according to new listing, review tables
const getMyFavouritesWithDetails = async (userID) => {

    try {
        // get user favourite listings ids
        const favIdsQuery = "SELECT favourites FROM users WHERE USERid = ?";
        const favIdsRes = await new Promise((resolve, reject) => {
            db.query(favIdsQuery, [userID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            }
            );
        });

        const favIdsArray = JSON.parse(favIdsRes?.[0]?.favourites);

        if (!favIdsArray || !(favIdsArray?.length > 0)) {
            return { success: false, message: "No favourite listings found" };
        }

        const placeholders = favIdsArray.map(() => "?").join(",");

        // get user's favourite listings details 
        const favLisitngsQuery = `SELECT li.*
                                FROM users AS u
                                INNER JOIN listing AS li ON u.userID = li.userID
                                WHERE li.listingID IN (${placeholders})`;

        const favListingResult = await new Promise((resolve, reject) => {
            db.query(favLisitngsQuery, [...favIdsArray], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        // get user's favourite listings reviews 
        const reviewQuery = `SELECT * FROM reviews WHERE rwListingID IN (${placeholders})`;
        const reviewsResult = await new Promise((resolve, reject) => {
            db.query(reviewQuery, [...favIdsArray], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        const combineRecords = favListingResult?.map((listing) => {
            const currListing = listing;
            currListing.reviews = [];
            reviewsResult.forEach((currReview) => {
                if (listing.listingID == currReview.rwListingID) {
                    currListing.reviews.push(currReview);
                }
            })
            return currListing;
        })

        if (combineRecords && combineRecords?.length > 0) {
            return { success: true, data: combineRecords };
        } else {
            return { success: false, message: "No listings found" };
        }

    } catch (err) {
        return { success: false, error: err }
    }
}

const getMyFavouritesListingsIDs = async (userID) => {
    try {
        const query = "SELECT favourites FROM users WHERE userID = ? limit 1";

        const selectRes = await new Promise((resolve, reject) => {
            db.query(query, [userID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            }
            );
        });

        if (selectRes && selectRes?.length > 0) {             // if userID exists, every time will get [{favourites: []}], evenIf favourites is [] array.
            return { success: true, data: selectRes[0] };
        } else if (selectRes && selectRes?.length == 0) {
            return { success: false, message: "userID is invalid" };     //  means selectedRes is empty [] 
        }

    } catch (err) {
        return { success: false, error: err }
    }
}

const validateListingRemainFields = async (data) => {
    let errors = {}

    // if ((data?.address || data?.address === "") && typeof data.address !== "object") {       // if user pass address: "" then also it will check validation
    if (data.hasOwnProperty("address") && typeof data.address !== "object" || Array.isArray(data.address)) {
        errors.address = "Address field must be an object";
    }
    if (data.hasOwnProperty("price") && typeof data.price !== "object" || Array.isArray(data.price)) {
        errors.price = "Price field must be an object";
    }
    if (data.hasOwnProperty("businessHours") && !Array.isArray(data.businessHours)) {
        errors.businessHours = "Business Hours field must be an array";
    }
    if (data.hasOwnProperty("socialMedia") && !Array.isArray(data.socialMedia)) {
        errors.socialMedia = "Social Media field must be an array";
    }
    if (data.hasOwnProperty("faqs") && !Array.isArray(data.faqs)) {
        errors.faqs = "FAQs field must be an array";
    }
    if (data.hasOwnProperty("bsImages") && !Array.isArray(data.bsImages)) {
        errors.bsImages = "Business Images field must be an array";
    }

    return errors
}

// previous
// let addReview = async (userID, listingID, data) => {

//     try {
//         const userData = await user.getUserByUserID(userID);          // invalid userID then undefined userData
//         if (!userData) {
//             return { success: false, message: 'userID is invalid' }   // user doesn't exists
//         }

//         const listingData = await getListingByID(listingID);          // invalid listingID then undefined listingData[0]
//         if (!listingData?.length > 0) {
//             return { success: false, message: 'listingID is invalid' }
//         }

//         if (listingData[0].userID == userID) {
//             return { success: false, message: "You can't add review to your owned listing" }
//         }

//         const listingReviews = JSON.parse(listingData?.[0]?.reviews || []);

//         const alreadyReviewed = listingReviews.find((review) => review?.userID.toString() == userID.toString());

//         if (alreadyReviewed) {
//             return { success: false, message: "listing alredy reviewed" };
//         }

//         const reviewID = uuidv4();
//         const date = new Date();
//         const createTime = date.toISOString().slice(0, 19).replace('T', ' ');

//         const reviewObj = {
//             userName: userData?.userName,
//             userID: userID,
//             rating: Number(data.rating),
//             comment: data?.comment?.trim() || "",
//             reviewID: reviewID,
//             createTime: createTime,
//             updateTime: null
//         };

//         listingReviews.push(reviewObj);

//         const updateQuery = "UPDATE listing SET reviews = ? WHERE listingID = ? ";

//         const result = await new Promise((resolve, reject) => {
//             db.query(updateQuery, [JSON.stringify(listingReviews), listingID],
//                 (err, data) => {
//                     if (err) {
//                         reject({ success: false, error: err.toString() });
//                     }
//                     resolve(data);
//                 }
//             );
//         });

//         if (result && result?.affectedRows > 0) {
//             // return { success: true, message: "Review added." };
//             return { success: true, reviewID: reviewID };
//         } else if (result && result?.affectedRows == 0) {
//             return { success: false, message: "listingID is invalid" };
//         }
//         else {
//             return { success: false, message: "Internal Server Error" };
//         }

//     } catch (err) {
//         return { success: false, error: err }
//     }
// }

// changed according to new listing, review tables
let addReview = async (userID, listingID, data) => {
    try {
        const userData = await user.getUserByUserID(userID);          // invalid userID then undefined userData
        if (!userData) {
            return { success: false, message: 'userID is invalid' }   // user doesn't exists
        }

        const listingDataResult = await getListingByID(listingID);          // invalid listingID then undefined listingData[0]
        if (!(listingDataResult?.length > 0)) {
            return { success: false, message: 'listingID is invalid' };
        } else if (listingDataResult.success == false) {
            return { ...listingDataResult };
        } else if (listingDataResult && listingDataResult[0].isListingExists !== "exists" || listingDataResult[0].listingStatus !== "Approved") {
            return { success: false, message: "Listing doesn't exists" };
        }

        if (listingDataResult[0].userID == userID) {
            return { success: false, message: "You can't add review to your owned listing" }
        }

        // checking user has already review added or not in particular listing
        const selectReviewQuery = "SELECT * FROM reviews WHERE rwUserID = ? AND rwListingID = ? limit 1";
        const selResult = await new Promise((resolve, reject) => {
            db.query(selectReviewQuery, [userID, listingID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            }
            );
        });

        if (selResult && selResult?.length > 0) {
            return { success: false, message: "Listing alredy reviewed" }
        }

        const date = new Date();
        const createTime = date.toISOString().slice(0, 19).replace('T', ' ');

        // adding review
        const insertQuery = "INSERT INTO reviews (reviewID, rwUserID, rwListingID, rating, rwComment, rwUserName, rwCreateTime, rwUpdateTime) values(null, ?, ?, ?, ?, ?, ?, null)";
        const result = await new Promise((resolve, reject) => {
            db.query(insertQuery, [userID, listingID, Number(data.rating), data?.comment || null, userData?.userName, createTime],
                (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (result && result?.affectedRows > 0) {
            return { success: true, message: "Review added" };
        } else if (result && result?.affectedRows == 0) {
            return { success: false, message: "listingID is invalid" };
        }
        else {
            return { success: false, message: "Internal Server Error" };
        }

    } catch (err) {
        return { success: false, error: err }
    }
}

const validateAddReviewFields = async (data) => {
    let errors = {};

    if (!data.hasOwnProperty("rating") || validator.isEmpty(data.rating.toString())) {
        errors.rating = "rating field is required";
    } else if (!(Number(data.rating) >= 1 && Number(data.rating) <= 5)) {
        errors.rating = "rating must be between 1 to 5";
    }

    if (data.hasOwnProperty("comment") && (typeof data.comment !== 'string')) {
        errors.comment = "comment value must be string";
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
}

// previous
// let editReview = async (userID, listingID, data) => {
//     try {
//         const userData = await user.getUserByUserID(userID);          // invalid userID then undefined userData
//         if (!userData) {
//             return { success: false, message: 'userID is invalid' }   // user doesn't exists
//         }

//         const listingData = await getListingByID(listingID);          // invalid listingID then undefined listingData[0]
//         if (!(listingData?.length > 0)) {
//             return { success: false, message: 'listingID is invalid' }
//         }

//         const listingReviews = JSON.parse(listingData?.[0]?.reviews);

//         // const existingReviewIndex = listingReviews.findIndex((review) => review?.userID.toString() === userID.toString());         //  alos works, bcz user can only able to add one review to every listing
//         const existingReviewIndex = listingReviews.findIndex((review) => review?.reviewID.toString() === data?.reviewID.toString());

//         if (existingReviewIndex == -1) {
//             return { success: false, message: "review doesn't found" };
//         }

//         const existingReview = listingReviews[existingReviewIndex];

//         const date = new Date();
//         const updateTime = date.toISOString().slice(0, 19).replace('T', ' ');

//         const updatedReviewObj = {
//             userName: userData?.userName,
//             userID: userID,
//             rating: Number(data.rating),
//             comment: data?.comment?.trim() || "",
//             reviewID: data.reviewID,
//             createTime: existingReview.createTime,
//             updateTime: updateTime
//         };

//         listingReviews?.splice(existingReviewIndex, 1, updatedReviewObj)

//         const updateQuery = "UPDATE listing SET reviews = ? WHERE listingID = ? ";

//         const result = await new Promise((resolve, reject) => {
//             db.query(updateQuery, [JSON.stringify(listingReviews), listingID],
//                 (err, data) => {
//                     if (err) {
//                         reject({ success: false, error: err.toString() });
//                     }
//                     resolve(data);
//                 }
//             );
//         });

//         if (result && result?.affectedRows > 0) {
//             // return { success: true, message: "Review updated." };
//             return { success: true };
//         } else if (result && result?.affectedRows == 0) {
//             return { success: false, message: "listingID is invalid" };
//         }
//         else {
//             return { success: false, message: "Internal Server Error" };
//         }

//     } catch (err) {
//         return { success: false, error: err.toString() }
//     }
// }

//  changed according to new listing, review tables
let editReview = async (userID, listingID, data) => {
    try {
        const userData = await user.getUserByUserID(userID);          // invalid userID then undefined userData
        if (!userData) {
            return { success: false, message: 'userID is invalid' }   // user doesn't exists
        }

        const listingData = await getListingByID(listingID);          // invalid listingID then undefined listingData[0]
        if (!(listingData?.length > 0)) {
            return { success: false, message: 'listingID is invalid' };
        } else if (listingData.success == false) {
            return { ...listingData };
        } else if (listingData && listingData[0].isListingExists !== "exists" || listingData[0].listingStatus !== "Approved") {
            return { success: false, message: "Listing doesn't exists" };
        }

        // checking user has previously review added or not
        const selectReviewQuery = "SELECT * FROM reviews WHERE rwUserID = ? AND reviewID = ? limit 1";
        const reviewDataRes = await new Promise((resolve, reject) => {
            db.query(selectReviewQuery, [userID, data.reviewID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            }
            );
        });

        if (reviewDataRes && !(reviewDataRes?.length > 0)) {
            return { success: false, message: "Review doesn't found" }
        }

        const reviewData = reviewDataRes[0];
        const date = new Date();
        const updateTime = date.toISOString().slice(0, 19).replace('T', ' ');

        reviewData.rating = data?.rating ? data.rating : reviewData.rating;
        reviewData.rwComment = data?.comment ? data.comment : reviewData.rwComment;
        reviewData.rwUpdateTime = updateTime;

        // updating review
        const updateQuery = "UPDATE reviews SET rating = ?, rwComment = ?, rwUpdateTime = ? WHERE reviewID = ? AND rwUserID = ?";
        const updateResult = await new Promise((resolve, reject) => {
            db.query(updateQuery, [reviewData.rating, reviewData.rwComment, reviewData.rwUpdateTime, data.reviewID, userID],
                (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (updateResult && updateResult?.affectedRows > 0) {
            return { success: true, message: "Review updated" };
        } else if (updateResult && updateResult?.affectedRows == 0) {
            return { success: false, message: "reviewID is invalid" };
        }
        else {
            return { success: false, message: "Internal Server Error" };
        }

    } catch (err) {
        return { success: false, error: err }
    }
}

const validateEditReviewFields = async (data) => {
    let errors = {};

    if (!data.hasOwnProperty("rating") || validator.isEmpty(data.rating.toString())) {
        errors.rating = "rating field is required";
    } else if (!(Number(data.rating) >= 1 && Number(data.rating) <= 5)) {
        errors.rating = "rating must be between 1 to 5";
    }

    if (!data.hasOwnProperty("reviewID") || validator.isEmpty(data.reviewID.toString())) {
        errors.reviewID = "reviewID field is required";
    }

    if (data.hasOwnProperty("comment") && (typeof data.comment !== 'string')) {
        errors.comment = "comment value must be string";
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
}

// previous
// const myListingReviews = async (ownerID) => {
//     try {
//         const query = "SELECT listingID, reviews FROM listing WHERE userID = ?";
//         const result = await new Promise((resolve, reject) => {
//             db.query(
//                 query, ownerID, (err, data) => {
//                     if (err) {
//                         reject({ success: false, error: err.toString() });
//                     }
//                     resolve(data);
//                 }
//             );
//         });

//         if (result && result?.length > 0) {
//             return { success: true, data: result };
//         } else {
//             return { success: false, message: "No listings found" };
//         }
//     } catch (err) {
//         return { success: false, error: err }
//     }
// }

// changed according to new listing, review tables
const myListingReviews = async (ownerID) => {
    try {
        // get user owned listings ids
        // const listingQuery = `SELECT listingID FROM listing WHERE userID = ? `;
        const listingQuery = `SELECT listingID FROM listing WHERE isListingExists = "exists" AND userID = ? `;
        const listingResult = await new Promise((resolve, reject) => {
            db.query(
                listingQuery, ownerID, (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (!listingResult || !(listingResult?.length > 0)) {            // user has no listing 
            return { success: false, message: "No listings found" };
        }

        const myListingIds = listingResult?.map((listing) => listing.listingID);
        const placeholders = myListingIds.map(() => "?").join(",");

        // get reviews related to user's all listing
        // const reviewsQuery = `SELECT rwListingID AS listingID, reviewID, rwUserID, rating, rwComment, rwUserName, rwCreateTime, rwUpdateTime FROM reviews WHERE rwListingID IN (${placeholders})`;
        const reviewsQuery = `SELECT r.rwListingID AS listingID, li.title as listingTitle, r.reviewID, r.rwUserID, r.rating, r.rwComment, r.rwUserName, r.rwCreateTime, r.rwUpdateTime FROM reviews AS r JOIN listing As li ON r.rwListingID = li.listingID WHERE r.rwListingID IN (${placeholders})`;
        const reviewsResult = await new Promise((resolve, reject) => {
            db.query(
                reviewsQuery, [...myListingIds], (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (reviewsResult && reviewsResult?.length > 0) {
            return { success: true, data: reviewsResult };
        } else {
            return { success: false, message: "No reviews found" };
        }

    } catch (err) {
        return { success: false, error: err }
    }
}


// changed according to new listing, review tables
const myGivenReviews = async (userID) => {
    try {
        // const query = "SELECT rwListingID As listingID, reviewID, rating, rwComment, rwCreateTime, rwUpdateTime from reviews WHERE rwUserID = ?";
        const query = `SELECT r.rwListingID As listingID, li.title AS listingTitle, r.reviewID, r.rating, r.rwComment, r.rwCreateTime, r.rwUpdateTime from reviews AS r INNER JOIN listing as li ON r.rwListingID = li.listingID WHERE r.rwUserID = ?`;

        const result = await new Promise((resolve, reject) => {
            db.query(
                query, [userID], (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (result && result?.length > 0) {
            return { success: true, data: result }
        } else {
            return { success: false, message: "No reviews found" }
        }

    } catch (err) {
        return { success: false, error: err }
    }
}

// previous - not include 'all' category/city filter option
// const getListingFilterWise = async (data) => {
//     let query;
//     let queryParams = [];

//     if (data?.city && data?.category) {
//         query = `SELECT * from listing WHERE categoryID = ? AND listingCityID = ? AND isListingExists = "exists" AND listingStatus = "Approved"`;
//         queryParams = [data.category, data.city];
//     }

//     else if (data?.category) {
//         query = `SELECT * from listing WHERE categoryID = ? AND isListingExists = "exists" AND listingStatus = "Approved"`;
//         queryParams = [data.category];
//     }

//     else if (data?.city) {
//         query = `SELECT * from listing WHERE listingCityID = ? AND isListingExists = "exists" AND listingStatus = "Approved"`;
//         queryParams = [data.city];
//     }

//     try {
//         const result = await new Promise((resolve, reject) => {
//             db.query(
//                 query, [...queryParams], (err, data) => {
//                     if (err) {
//                         reject({ success: false, error: err.toString() });
//                     }
//                     resolve(data);
//                 }
//             );
//         });

//         return { success: true, data: result }
//     }
//     catch (err) {
//         var result = { success: false, error: err }
//         return result
//     }
// }

// with "all" filter option in category/city 
const getListingFilterWise = async (data) => {
    let query;
    let queryParams = [];

    if (data?.city && data?.category) {

        if (data?.city !== "all" && data?.category !== "all") {    // both has id
            query = `SELECT * from listing WHERE categoryID = ? AND listingCityID = ? AND isListingExists = "exists" AND listingStatus = "Approved"`;
            queryParams = [data.category, data.city];
        }

        else if (data?.city == "all" && data?.category !== "all") {
            query = `SELECT * from listing WHERE categoryID = ? AND isListingExists = "exists" AND listingStatus = "Approved"`;
            queryParams = [data.category];
        }

        else if (data?.category == "all" && data?.city !== "all") {
            query = `SELECT * from listing WHERE listingCityID = ? AND isListingExists = "exists" AND listingStatus = "Approved"`;
            queryParams = [data.city];
        }

        else if (data?.city === "all" && data?.category === "all") {
            query = `SELECT * from listing WHERE isListingExists = "exists" AND listingStatus = "Approved"`;
            queryParams = [];
        }
    }

    else if (data?.category) {
        if (data?.category !== "all") {
            query = `SELECT * from listing WHERE categoryID = ? AND isListingExists = "exists" AND listingStatus = "Approved"`;
            queryParams = [data.category];
        }
        else {
            query = `SELECT * from listing WHERE isListingExists = "exists" AND listingStatus = "Approved"`;
        }
    }

    else if (data?.city) {

        if (data?.city !== "all") {
            query = `SELECT * from listing WHERE listingCityID = ? AND isListingExists = "exists" AND listingStatus = "Approved"`;
            queryParams = [data.city];
        }
        else {
            query = `SELECT * from listing WHERE isListingExists = "exists" AND listingStatus = "Approved"`;
            queryParams = [data.city];
        }
    }

    try {
        const result = await new Promise((resolve, reject) => {
            db.query(
                query, queryParams, (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        return { success: true, data: result }
    }
    catch (err) {
        var result = { success: false, error: err }
        return result
    }
}

const getListingCategoryWise = async (data) => {
    try {
        let query = `SELECT * from listing WHERE categoryID = ? AND isListingExists = "exists" AND listingStatus = "Approved"`;
        const result = await new Promise((resolve, reject) => {
            db.query(
                query, data.category, (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        return { success: true, data: result }
    }
    catch (err) {
        var result = { success: false, error: err }
        return result
    }
}

const getListingCityWise = async (data) => {
    try {
        let query = `SELECT * from listing WHERE listingCityID = ? AND isListingExists = "exists" AND listingStatus = "Approved"`;
        const result = await new Promise((resolve, reject) => {
            db.query(
                query, data.city, (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        return { success: true, data: result }
    }
    catch (err) {
        var result = { success: false, error: err }
        return result
    }
}

// without notification
// const statusChange = async (listingID, listingStatus) => {
//     try {
//         const selecteQuery = `SELECT * FROM listing WHERE listingID = ? `;
//         const listingResult = await new Promise((resolve, reject) => {
//             db.query(
//                 selecteQuery, [listingID], (err, data) => {
//                     if (err) {
//                         reject({ success: false, error: err.toString() });
//                     }
//                     resolve(data);
//                 }
//             );
//         });

//         if (listingResult && !(listingResult.length > 0)) {
//             return { success: false, message: "listingID is invalid" };
//         }

//         if (listingResult.length > 0 && listingResult[0].listingStatus == "Approved") {
//             return { success: true, message: "listing already approved" };
//         }

//         if (listingResult.length > 0 && listingResult[0].isListingExists !== "exists") {
//             return { success: false, message: "Listing doesn't exists" };
//         }

//         let query;
//         let date = new Date();
//         date = date.toISOString().slice(0, 19).replace('T', ' ')

//         if (listingStatus == "Approved") {
//             query = `UPDATE listing SET approveTime = ?, listingStatus = "Approved" WHERE listingID = ? `;
//             // query = "UPDATE listing SET approveTime = ?, rejectTime = null WHERE listingID = ? ";
//         } else {
//             query = `UPDATE listing SET rejectTime = ?, listingStatus = "Rejected" WHERE listingID = ? `;
//             // query = "UPDATE listing SET rejectTime = ?, approveTime = null WHERE listingID = ? ";
//         }

//         const updateResult = await new Promise((resolve, reject) => {
//             db.query(
//                 query, [date, listingID], (err, data) => {
//                     if (err) {
//                         reject({ success: false, error: err.toString() });
//                     }
//                     resolve(data);
//                 }
//             );
//         });

//         if (updateResult && updateResult?.affectedRows > 0) {
//             return { success: true, message: listingStatus == "Approved" ? 'Listing approved' : 'Listing rejected' };
//         } else if (updateResult && updateResult?.affectedRows == 0) {
//             return { success: false, message: "listingID is invalid" };
//         }
//         else {
//             return { success: false, message: "Internal Server Error" };
//         }
//     }
//     catch (err) {
//         var result = { success: false, error: err }
//         return result
//     }
// }

// added notification
const statusChange = async (listingID, listingStatus, adminID) => {

    try {
        const selecteQuery = `SELECT * FROM listing WHERE listingID = ? `;
        const listingResult = await new Promise((resolve, reject) => {
            db.query(
                selecteQuery, [listingID], (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (listingResult && !(listingResult.length > 0)) {
            return { success: false, message: "listingID is invalid" };
        }

        if (listingResult.length > 0 && listingResult[0].listingStatus === "Approved" && listingStatus === "Approved") {    // if listing already 'approved' then user edit  then status will be 'pending'
            return { success: true, message: "listing already approved" };
        }

        if (listingResult.length > 0 && listingResult[0].isListingExists !== "exists") {
            return { success: false, message: "Listing doesn't exists" };
        }

        let query;
        let date = new Date();
        date = date.toISOString().slice(0, 19).replace('T', ' ')

        if (listingStatus == "Approved") {
            query = `UPDATE listing SET approveTime = ?, listingStatus = "Approved" WHERE listingID = ? `;
            // query = "UPDATE listing SET approveTime = ?, rejectTime = null WHERE listingID = ? ";
        } else {
            query = `UPDATE listing SET rejectTime = ?, listingStatus = "Rejected" WHERE listingID = ? `;
            // query = "UPDATE listing SET rejectTime = ?, approveTime = null WHERE listingID = ? ";
        }

        const updateResult = await new Promise((resolve, reject) => {
            db.query(
                query, [date, listingID], (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (updateResult && updateResult?.affectedRows > 0) {
            
            let datas = {
                type: listingStatus == "Approved" ? "listing_approved" : "listing_rejected",
                listingID: listingID,
                listingTitle: listingResult[0].title,
                createdByID: adminID,
                notificationView: JSON.stringify([]),
                clearNotification: JSON.stringify([]),
                // approvals: null
                approvals: listingResult[0].approveTime ? "listing_updated" : null,   // already aproved_listing edited, then  if admin approve it(that lisitng),  then add  'approval' as listing_updated
                createdFor: listingResult[0]?.userID    // for user
            };

            await addNotification(datas);

            return { success: true, message: listingStatus == "Approved" ? 'Listing approved' : 'Listing rejected' };

        } else if (updateResult && updateResult?.affectedRows == 0) {
            return { success: false, message: "listingID is invalid" };
        }
        else {
            return { success: false, message: "Internal Server Error" };
        }
    }
    catch (err) {
        var result = { success: false, error: err }
        return result
    }
}

const validateListingStatusChangeFields = async (data) => {
    let errors = {};

    if (!data.hasOwnProperty("listingID") || validator.isEmpty(data.listingID.toString())) {
        errors.listingID = "listingID field is required";
    }

    const validateStatus = ["Approved", "Rejected"];

    if (!data.hasOwnProperty("listingStatus") || validator.isEmpty(data.listingStatus.toString())) {
        errors.listingStatus = "listingStatus field is required";
    }
    else if (data.hasOwnProperty("listingStatus") && !(validateStatus.includes(data.listingStatus))) {
        errors.listingStatus = "listingStatus value must be 'Approved' or 'Rejected'";
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
}

const numOfListingInEachCategory = async () => {
    try {
        // const query = `SELECT c.categoryID, c.categoryName, count(li.categoryID) As count FROM category AS c LEFT JOIN listing AS li  ON c.categoryID = li.categoryID GROUP BY c.categoryID`;
        const query = `SELECT c.categoryID, c.categoryName, COUNT(li.categoryID) AS count FROM category AS c LEFT JOIN listing AS li ON c.categoryID = li.categoryID AND li.listingStatus = 'Approved' AND li.isListingExists = 'exists' GROUP BY c.categoryID;`;

        const selectRes = await new Promise((resolve, reject) => {
            db.query(query, (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            }
            );
        });

        return { success: true, data: selectRes };

    } catch (err) {
        return { success: false, error: err }
    }
}

const getAllApprovedExistsListing = async () => {
    try {
        const reviewQuery = "SELECT * FROM reviews ORDER BY rwListingID ASC";
        const listingQuery = `SELECT * FROM listing WHERE isListingExists = "exists" AND listingStatus = "Approved" ORDER BY listingID ASC`;

        const reviewsResult = await new Promise((resolve, reject) => {
            db.query(reviewQuery, (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        const listingsResult = await new Promise((resolve, reject) => {
            db.query(listingQuery, (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        const combineRecords = listingsResult?.map((listing) => {
            const currListing = listing;
            currListing.reviews = [];
            reviewsResult.forEach((currReview) => {
                if (listing.listingID == currReview.rwListingID) {
                    currListing.reviews.push(currReview);
                }
            })
            return currListing;
        })

        if (combineRecords && combineRecords?.length > 0) {
            return { success: true, data: combineRecords };
        } else {
            return { success: false, message: "No listings found" };
        }

    } catch (err) {
        return { success: false, error: err }
    }
}

module.exports = {
    addListing,
    validateAddListingFields,
    editListing,
    validateEditListingFields,
    getListingByID,
    deleteListing,
    getAllListing,
    getMyListing,
    getListing,
    addToFavourite,
    removeFromFavourite,
    getMyFavouritesWithDetails,
    getMyFavouritesListingsIDs,
    addReview,
    validateAddReviewFields,
    editReview,
    validateEditReviewFields,
    myListingReviews,
    myGivenReviews,
    getListingFilterWise,
    getListingCategoryWise,
    getListingCityWise,
    statusChange,
    validateListingStatusChangeFields,
    numOfListingInEachCategory,
    getAllApprovedExistsListing,
    getMyPendingListing,
    getMyApprovedListing,
    getMyRejectedListing
};
