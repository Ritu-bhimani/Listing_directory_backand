const validator = require("validator");
const isEmpty = require("lodash.isempty");
const bcrypt = require("bcrypt");
const fs = require("fs");
const db = require("../config/dbConfig.js");

const getUserByUserID = async (userID) => {
    try {
        const selectQuery = "SELECT * FROM users WHERE userID = ? limit 1";

        const result = await new Promise((resolve, reject) => {
            db.query(selectQuery, userID, (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data[0]);
            });
        });
        return result;

    } catch (err) {
        return { success: false, error: err.toString() };
    }
};


const changePassword = async (userID, newPassword) => {
    try {
        const encPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));

        const updateQuery = "UPDATE users SET password = ? WHERE userID = ? ";

        const result = await new Promise((resolve, reject) => {
            db.query(
                updateQuery, [encPassword, userID], (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                });
        });

        if (result && result?.affectedRows > 0) {
            return { success: true, userID: userID };
        }
        else {
            return { success: false, message: "Internal Server Error" };
        }

    } catch (err) {
        return { success: false, error: err.toString() };
    }
};


const updateUser = async (data, userID) => {
    //data -  address, bio, phone, lastName, firstName, socialNetworks,

    try {
        const userData = await getUserByUserID(userID);

        // userData.userName = data.userName ? data.userName : userData.userName;
        // userData.profileImgID = data.profileImgID ? data.profileImgID : userData.profileImgID;
        // userData.email = data.email ? data.email : userData.email;
        userData.firstName = data?.firstName ? data.firstName : data?.firstName == "" ? null : userData.firstName;
        userData.lastName = data?.lastName ? data.lastName : data?.lastName == "" ? null : userData.lastName;
        userData.address = data?.address ? data.address : data?.address == "" ? null : userData.address;
        userData.phone = data?.phone ? data.phone : data?.phone == "" ? null : userData.phone;
        userData.bio = data?.bio ? data.bio : data?.bio == "" ? null : userData.bio;
        userData.updateDateTime = new Date().toISOString();

        const query = "UPDATE users SET firstName = ?, lastName = ?, address = ?, phone = ?, bio = ?, updateDateTime = ? WHERE userID = ?";
        const result = await new Promise((resolve, reject) => {
            db.query(query, [userData.firstName, userData.lastName, userData.address, userData.phone, userData.bio, userData.updateDateTime, userID], (err, resData) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(resData);
            });
        });

        if (result && result?.affectedRows > 0) {
            return { success: true, userID: userID };
        }
        else {
            return { success: false, message: "Internal Server Error" };
        }
    } catch (err) {
        return { success: false, error: err.toString() };
    }
};


const updateUserSocial = async (data, userID) => {

    try {
        let userData = await getUserByUserID(userID);
        // userData.socialNetworks = data ? data : userData.socialNetworks;
        // userData.socialNetworks = data ? JSON.stringify(data) : "";
        userData.socialNetworks = data ? JSON.stringify(data) : {};
        userData.updateDateTime = new Date().toISOString();

        const query = "UPDATE users SET socialNetworks = ?, updateDateTime = ? WHERE userID = ?";
        const result = await new Promise((resolve, reject) => {
            db.query(query, [userData.socialNetworks, userData.updateDateTime, userID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        if (result && result?.affectedRows > 0) {
            return { success: true, userID: userID };
        }
        else {
            return { success: false, message: "Internal Server Error" };
        }
    } catch (err) {
        return { success: false, error: err.toString() };
    }
};


const addProfileImage = async (imgPath, userID) => {
    try {
        const query = "UPDATE users SET profileImage = ? WHERE userID = ?";
        const result = await new Promise((resolve, reject) => {
            db.query(query, [imgPath, userID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        if (result && result?.affectedRows > 0) {
            // return { success: true, message: "File uploaded successfully" };
            return { success: true, userID: userID, profileImage: imgPath };
        }
        else {
            return { success: false, message: "Internal Server Error" };
        }

    }
    catch (err) {
        return { success: false, error: err.toString() };
    }
}


const removeProfileImage = async (imgPath, userID) => {

    const DIR = './uploads';
    const fileName = imgPath?.split("/public")?.[1];

    try {
        const query = "UPDATE users SET profileImage = ? WHERE userID = ? and profileImage = ? ";
        const result = await new Promise((resolve, reject) => {
            db.query(query, [null, userID, imgPath], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        if (result && result?.affectedRows > 0) {
            fs.unlink(`${DIR}${fileName}`, (err) => {
                if (err) {
                    console.log("img unlink error", err)
                }
            })
            return { success: true, userID: userID };
        }
        else if (result && result?.affectedRows == 0) {
            return { success: false, msg: "Image path is not valid" }
        }
        else {
            return { success: false, message: "Internal Server Error" };
        }
    }
    catch (err) {
        return { error: err.toString() };
    }
}


const delteUserAccount = async (userID) => {     // this will only change user  "isAccountExists"  status from  exists to  notExists. // not delete the record/account from user table.
    try {
        // const deleteQuery = "DELETE FROM users WHERE userID = ? ";
        const updateQuery = "UPDATE users SET isAccountExists = ? WHERE userID = ? ";

        const result = await new Promise((resolve, reject) => {
            db.query(updateQuery, ["notExists", userID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        if (result && result?.affectedRows > 0) {
            return { success: true }
        } else {
            return { success: false, message: "Internal server error" }
        }
    } catch (err) {
        return { success: false, error: err.toString() }
    }
}


const validateChangePswd = (data) => {
    let errors = {};

    data.email = data?.email ? data.email.toString() : "";
    data.oldPassword = data?.oldPassword ? data.oldPassword.toString() : "";
    data.newPassword = data?.newPassword ? data.newPassword.toString() : "";
    data.confirmPassword = data?.confirmPassword ? data.confirmPassword.toString() : "";

    if (validator.isEmpty(data.email)) {
        errors.email = "email field is required";
    } else if (!validator.isEmail(data.email)) {
        errors.email = "Email is invalid";
    }

    if (validator.isEmpty(data.oldPassword)) {
        errors.oldPassword = "oldPassword field is required";
    }

    if (validator.isEmpty(data.newPassword)) {
        pswdErrs.password = "newPassword field is required";
    } else if (!validator.isLength(data.newPassword, { min: 6, max: 30 })) {
        errors.password = "newPassword must be at least 6 characters long";
    }

    if (validator.isEmpty(data.confirmPassword)) {
        errors.confirmPassword = "confirmPassword field is required";
    } else if (!validator.equals(data.newPassword, data.confirmPassword)) {
        errors.confirmPassword = "new password and confirm password must match";
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
}


const getUserPublicInfo = async (userNameOrId) => {

    try {
        const query = "SELECT userID, userName, email, firstName, lastName, phone, bio, socialNetworks, verificationStatus, address, profileImage FROM users WHERE userName = ? OR userID = ? ";
        const result = await new Promise((resolve, reject) => {
            db.query(
                query, [userNameOrId, userNameOrId], (err, data) => {
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
            return { success: false, message: "User doesn't found" };
        } else {
            const resMsg = { ...result };          // internal server error
            return resMsg
        }

    } catch (error) {
        return { success: false, error: err.toString() }
    }

};


const authenticateEmail = async (email, password) => {
    try {
        const query = "SELECT userID, password FROM users WHERE email = ? limit 1";

        const result = await new Promise((resolve, reject) => {
            db.query(query, email, (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            }
            );
        });

        if (result?.length > 0) {
            let suppliedPassword = password;
            let storedPassword = result[0]?.password;
            const isPasswordMatch = bcrypt.compareSync(suppliedPassword, storedPassword);

            if (isPasswordMatch == true) {
                return { authenticated: true, userID: result[0]?.userID };
            } else {
                return { authenticated: false, message: "Incorrect password" };
            }

        } else {
            return { authenticated: false };
        }
    } catch (err) {
        return { success: false, error: err.toString() };
    }
};

module.exports = {
    getUserByUserID,
    // authenticateEmail,
    changePassword,
    updateUser,
    updateUserSocial,
    addProfileImage,
    removeProfileImage,
    delteUserAccount,
    validateChangePswd,
    getUserPublicInfo
}
