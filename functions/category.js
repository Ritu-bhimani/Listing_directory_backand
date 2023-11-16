const { json } = require("express");
const db = require("../config/dbConfig.js");
const bcrypt = require("bcrypt");
const fs = require("fs");
const validator = require("validator");
const isEmpty = require("lodash.isempty");

const addCategory = async (data) => {
    try {

        const selectQuery = "SELECT categoryName FROM category";

        const result = await new Promise((resolve, reject) => {
            db.query(
                selectQuery, (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (result && result.length > 0) {
            let categoryNames = [];
            categoryNames = result?.map(curr => curr?.categoryName?.toLowerCase());

            if (categoryNames && categoryNames?.includes(data?.categoryName?.toLowerCase())) {
                return { success: false, message: "category already exists" }
            }
        }

        const query = "INSERT INTO category (categoryID, categoryName) values(?,?)";

        const insertResult = await new Promise((resolve, reject) => {
            db.query(query, [null, data.categoryName], (err, resData) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(resData);
            });
        });

        if (insertResult && insertResult?.insertId) {
            return { success: true, categoryID: insertResult?.insertId };
        } else {
            return { success: false, message: "Internal server error." }
        }

    } catch (err) {
        return { success: false, err: err };
    }
}

const editCategory = async (data) => {
    try {
        const query = "UPDATE category SET categoryName = ? WHERE categoryID = ?";

        const result = await new Promise((resolve, reject) => {
            db.query(query, [data?.categoryName, data?.categoryID], (err, resData) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(resData);
            });
        });

        if (result && result?.affectedRows > 0) {
            return { success: true, categoryID: data.categoryID };
        }
        else if (result && result?.affectedRows == 0) {
            return { success: false, message: "Category ID is invalid" };
        }
        else {
            return { success: false, message: "Internal server error" }
        }

    } catch (err) {
        return { success: false, err: err };
    }
}


const deleteCategory = async (data) => {
    try {
        const query = "DELETE FROM category WHERE categoryID = ? ";

        const result = await new Promise((resolve, reject) => {
            db.query(query, [data?.categoryID], (err, resData) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(resData);
            });
        });

        if (result && result?.affectedRows > 0) {
            return { success: true, categoryID: data.categoryID };
        }
        else if (result && result?.affectedRows == 0) {
            return { success: false, message: "Category ID is invalid" };
        }
        else {
            return { success: false, message: "Internal server error" }
        }

    } catch (err) {
        return { success: false, err: err };
    }
}

const getCategoryDetail = async (categoryID) => {
    try {
        const query = "SELECT * from category where categoryID = ? limit 1";

        const result = await new Promise((resolve, reject) => {
            db.query(query, [categoryID], (err, resData) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(resData);
            });
        });

        if (result && result?.length > 0) {
            return { success: true, data: result[0] };
        }
        else if (result && result?.length == 0) {
            return { success: false, message: "Category ID is invalid" };
        }
        else {
            return { success: false, message: "Internal server error" }
        }

    } catch (err) {
        return { success: false, err: err };
    }
}


const validateEditCategory = (data) => {
    let errors = {};

    data.categoryID = data?.categoryID ? data.categoryID.toString() : "";
    data.categoryName = data?.categoryName ? data.categoryName.toString() : "";

    if (validator.isEmpty(data.categoryID)) {
        errors.categoryID = "categoryID is required";
    }

    if (validator.isEmpty(data.categoryName)) {
        errors.categoryName = "categoryName field is required";
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
}

module.exports = {
    addCategory,
    editCategory,
    deleteCategory,
    getCategoryDetail,
    validateEditCategory
};