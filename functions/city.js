const validator = require("validator");
const isEmpty = require("lodash.isempty");
const db = require("../config/dbConfig.js");

const addCity = async (data) => {
    try {

        const selectQuery = "SELECT cityName FROM city";

        const selectResult = await new Promise((resolve, reject) => {
            db.query(
                selectQuery, (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                }
            );
        });

        if (selectResult && selectResult.length > 0) {
            let cityNames = [];
            cityNames = selectResult?.map(curr => curr?.cityName?.toLowerCase());

            if (cityNames && cityNames?.includes(data?.cityName?.toLowerCase())) {
                return { success: false, message: "city already exists" }
            }
        }


        const query = "INSERT INTO city (cityID, cityName) values(?,?)";

        const result = await new Promise((resolve, reject) => {
            db.query(query, [null, data.cityName], (err, resData) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(resData);
            });
        });

        if (result && result?.insertId) {
            return { success: true, cityID: result?.insertId };
        } else {
            return { success: false, message: "Internal server error." }
        }
    } catch (err) {
        return { success: false, err: err };
    }
}

const editCity = async (data) => {
    try {
        const query = "UPDATE city SET cityName = ? WHERE cityID = ?";

        const result = await new Promise((resolve, reject) => {
            db.query(query, [data?.cityName, data?.cityID], (err, resData) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(resData);
            });
        });

        if (result && result?.affectedRows > 0) {
            return { success: true, cityID: data.cityID };
        }
        else if (result && result?.affectedRows == 0) {
            return { success: false, message: "City ID is invalid" };
        }
        else {
            return { success: false, message: "Internal server error" }
        }
    } catch (err) {
        return { success: false, err: err };
    }
}

const deleteCity = async (data) => {
    try {
        const query = "DELETE FROM city WHERE cityID = ? ";

        const result = await new Promise((resolve, reject) => {
            db.query(query, [data?.cityID], (err, resData) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(resData);
            });
        });

        if (result && result?.affectedRows > 0) {
            return { success: true, cityID: data.cityID };
        }
        else if (result && result?.affectedRows == 0) {
            return { success: false, message: "City ID is invalid" };
        }
        else {
            return { success: false, message: "Internal server error" }
        }
    } catch (err) {
        return { success: false, err: err };
    }
}

const getCityDetail = async (cityID) => {
    try {
        const query = "SELECT * from city where cityID = ? limit 1";

        const result = await new Promise((resolve, reject) => {
            db.query(query, [cityID], (err, resData) => {
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
            return { success: false, message: "City ID is invalid" };
        }
        else {
            return { success: false, message: "Internal server error" }
        }

    } catch (err) {
        return { success: false, err: err };
    }
}

const validateEditCity = (data) => {
    let errors = {};

    data.cityID = data?.cityID ? data.cityID.toString() : "";
    data.cityName = data?.cityName ? data.cityName.toString() : "";

    if (validator.isEmpty(data.cityID)) {
        errors.cityID = "cityID is required";
    }

    if (validator.isEmpty(data.cityName)) {
        errors.cityName = "cityName field is required";
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
}

const getAllCity = async () => {
    try {
        const query = "SELECT cityID,cityName from city";

        const result = await new Promise((resolve, reject) => {
            db.query(query, (err, resData) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(resData);
            });
        });
        return { success: true, data: result };

    } catch (err) {
        return { success: false, err: err };
    }
}

module.exports = {
    addCity,
    editCity,
    deleteCity,
    getCityDetail,
    validateEditCity,
    getAllCity
};