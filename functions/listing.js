const express = require("express");
const validator = require("validator");
const isEmpty = require("lodash.isempty");
const db = require("../config/dbConfig.js");
const router = express.Router();

let addListing = async (data) => {   // requird - title, category, description 

    try {
        const insertQuery =
            "INSERT INTO listing(listingID, userID, title, address, listingCityID, phone, website, categoryID, price, businessHours, socialMedia, faqs, description, keywords, bsVideoUrl, bsImages, bsLogo, listingStatus, postedDateTime, review) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ";

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
                    new Date().toISOString(),   // postedDateTime
                    JSON.stringify([])          // review
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


module.exports = {
    addListing,
    validateAddListing
};