const express = require("express");
const validator = require("validator");
const isEmpty = require("lodash.isempty");
const db = require("../config/dbConfig.js");

const router = express.Router();

let addListing = async (data) => {   // requird - title, category, description 

    try {
        const insertQuery =
            "INSERT INTO listing(listingID, userID, title, address, listingCityID, phone, website, categoryID, price, businessHours, socialMedia, faqs, description, keywords, bsVideoUrl, bsImages, bsLogo, listingStatus, postedDateTime, review, updateDateTime, isListingExists) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";
        
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
                    "Pending",                  // listingStatus  enum('Approved', 'Canceled', 'Pending')
                    date.toISOString().slice(0, 19).replace('T', ' '),   // postedDateTime       // new Date().toISOString(),   // postedDateTime
                    JSON.stringify([]),          // review
                    null,                         //  updateDateTime
                    "exists"                     //  isListingExists
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
            return { success: true, listingID: result?.insertId }
        }

    } catch (err) {
        return { success: false, error: err }
    }
}

const validateAddListing = (data) => {  
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

    return {
        errors,
        isValid: isEmpty(errors),
    };
}

const editListing = async (data) => {
    try {
        // const listingData = await getListingByID(data.listingID);  +  resolve(data?.[0]);  // if listingID is not valid then not giving err in response
        // console.log(listingData)

        const listingDataResult = await getListingByID(data.listingID);

        if (listingDataResult && listingDataResult.length == 0) {
            return { success: false, message: "Provided listing id is invalid" }
        } else if (listingDataResult.success == false) {
            return { ...listingDataResult }
        }

        const listingData = listingDataResult[0];
        const date = new Date();

        listingData.title = data?.title ? data.title : data?.title == "" ? null : listingData.title;
        listingData.listingCityID = data?.listingCityID ? data.listingCityID : data.listingCityID == "" ? null : listingData.listingCityID;
        listingData.phone = data?.phone ? data.phone : data.phone == "" ? null : listingData.phone;
        listingData.website = data?.website ? data.website : data.website == "" ? null : listingData.website;
        listingData.categoryID = data?.categoryID ? data.categoryID : data.categoryID == "" ? null : listingData.categoryID;
        listingData.description = data?.description ? data.description : data?.description == "" ? null : listingData.description;
        listingData.keywords = data?.keywords ? data.keywords : data?.keywords == "" ? null : listingData.keywords;
        listingData.bsVideoUrl = data?.bsVideoUrl ? data.bsVideoUrl : data.bsVideoUrl == "" ? null : listingData.bsVideoUrl;
        listingData.bsLogo = data?.bsLogo ? data.bsLogo : data?.bsLogo == "" ? null : listingData.bsLogo;

        listingData.businessHours = data?.businessHours ? data.businessHours : listingData.businessHours;
        listingData.price = data?.price ? data.price : listingData.price;
        listingData.address = data?.address ? data.address : listingData.address;
        listingData.faqs = data?.faqs ? data.faqs : listingData.faqs;
        listingData.bsImages = data?.bsImages ? data.bsImages : listingData.bsImages;
        listingData.socialMedia = data?.socialMedia ? data.socialMedia : listingData.socialMedia;
        // listingData.updateDateTime = new Date().toISOString();
        listingData.updateDateTime = date.toISOString().slice(0, 19).replace('T', ' ')

        // listingStatus, review, postedDateTime, isListingExists - user can't change

        const updateQuery = "UPDATE listing SET title = ?, address = ?, listingCityID = ?, phone = ?, website = ?, categoryID =?, price = ?, businessHours = ?, socialMedia = ?, faqs = ?, description = ?, keywords = ?, bsVideoUrl = ?, bsImages = ?, bsLogo = ?, updateDateTime = ? WHERE listingID = ? ";

        const result = await new Promise((resolve, reject) => {
            db.query(updateQuery,
                [
                    listingData.title,
                    JSON.stringify(listingData.address),
                    listingData.listingCityID,
                    listingData.phone,
                    listingData.website,
                    listingData.categoryID,
                    JSON.stringify(listingData.price),
                    JSON.stringify(listingData.businessHours),
                    JSON.stringify(listingData.socialMedia),
                    JSON.stringify(listingData.faqs),
                    listingData.description,
                    listingData.keywords,
                    listingData.bsVideoUrl,
                    JSON.stringify(listingData.bsImages),
                    listingData.bsLogo,
                    listingData.updateDateTime,
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

const validateEditListing = (data) => {  // requird fields - listingID, title, category, description
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

    return {
        errors,
        isValid: isEmpty(errors),
    };
}

const deleteListing = async (listingID) => {     // this will only change user  "isAccountExists"  status from  exists to  notExists. // not delete the record/account from user table.
    try {
        // const deleteQuery = "DELETE FROM listing WHERE listingID = ? ";
        const updateQuery = "UPDATE listing SET isListingExists = ? WHERE listingID = ? ";

        const result = await new Promise((resolve, reject) => {
            db.query(updateQuery, ["notExists", listingID], (err, data) => {
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

const getAllListing = async () => {
    try {
        const query = "SELECT * FROM listing";

        const result = await new Promise((resolve, reject) => {
            db.query(query, (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            }
            );
        });

        if (result && result?.length > 0) {
            return { success: true, data: result };
        } else if (result && result?.length == 0) {
            return { success: false, message: "No listings found" };
        } else {
            const resMsg = { ...result };
            return resMsg
        }
    } catch (err) {
        return { success: false, error: err }
    }
}

const getMyListing = async (ownerID) => {
    try {
        const query = "SELECT * FROM listing WHERE userID = ?";
        const result = await new Promise((resolve, reject) => {
            db.query(
                query, ownerID, (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (result && result?.length > 0) {
            return { success: true, data: result };
        } else if (result && result?.length == 0) {
            return { success: false, message: "No listings found" };
        } else {
            const resMsg = { ...result };          // internal server error
            return resMsg
        }
    } catch (err) {
        return { success: false, error: err }
    }
}

const getListing = async (listingID) => {
    try {
        const query = "SELECT * FROM listing WHERE listingID = ?";
        const result = await new Promise((resolve, reject) => {
            db.query(
                query, listingID, (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (result && result?.length > 0) {
            return { success: true, data: result[0] };
        } else if (result && result?.length == 0) {
            return { success: false, message: "listing ID is invalid" };
        } else {
            const resMsg = { ...result };
            return resMsg
        }

    } catch (error) {
        return { success: false, error: err }
    }
}

const changeFavourite = async (userID, favourites) => {
    try {
        const query = "UPDATE users SET favourites = ? WHERE userID = ?";
        const result = await new Promise((resolve, reject) => {
            db.query(
                query, [JSON.stringify(favourites), userID], (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (result && result?.affectedRows > 0) {
            return { success: true }
        }
        else {
            return { success: false }
        }
    } catch (error) {
        return { success: false, error: err }
    }
}

module.exports = {
    addListing,
    validateAddListing,
    editListing,
    validateEditListing,
    getListingByID,
    deleteListing,
    getAllListing,
    getMyListing,
    getListing,
    changeFavourite
};
