const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const validator = require("validator");
const isEmpty = require("lodash.isempty");
const db = require("../config/dbConfig.js");
const { cloudinary } = require("../config/cloudinaryConfig.js");
const { uploadToCloudinary } = require("./upload.js");

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
        return { success: false, error: err };
    }
};


const changePassword = async (userID, newPassword) => {
    try {
        const encPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
        const date = new Date();
        const updateTime = date.toISOString().slice(0, 19).replace('T', ' ');

        const updateQuery = "UPDATE users SET password = ?, updateDateTime = ? WHERE userID = ? ";

        const result = await new Promise((resolve, reject) => {
            db.query(
                updateQuery, [encPassword, updateTime, userID], (err, data) => {
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
        return { success: false, error: err };
    }
};


const updateUser = async (data, userID) => {
    //data -  address, bio, phone, lastName, firstName, socialNetworks,

    try {
        const userData = await getUserByUserID(userID);
        const date = new Date();

        // userData.userName = data.userName ? data.userName : userData.userName;
        // userData.profileImgID = data.profileImgID ? data.profileImgID : userData.profileImgID;
        // userData.email = data.email ? data.email : userData.email;
        userData.firstName = data?.firstName ? data.firstName : data?.firstName == "" ? null : userData.firstName;
        userData.lastName = data?.lastName ? data.lastName : data?.lastName == "" ? null : userData.lastName;
        userData.address = data?.address ? data.address : data?.address == "" ? null : userData.address;
        userData.phone = data?.phone ? data.phone : data?.phone == "" ? null : userData.phone;
        userData.bio = data?.bio ? data.bio : data?.bio == "" ? null : userData.bio;
        // userData.updateDateTime = new Date().toISOString();
        userData.updateDateTime = date.toISOString().slice(0, 19).replace('T', ' ')

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
        return { success: false, error: err };
    }
};


const updateUserSocial = async (data, userID) => {

    try {
        let userData = await getUserByUserID(userID);
        const date = new Date();

        // userData.socialNetworks = data ? data : userData.socialNetworks;
        // userData.socialNetworks = data ? JSON.stringify(data) : "";
        userData.socialNetworks = data ? JSON.stringify(data) : {};
        // userData.updateDateTime = new Date().toISOString();
        userData.updateDateTime = date.toISOString().slice(0, 19).replace('T', ' ');

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
        return { success: false, error: err };
    }
};


// save to local folder
// const addProfileImage = async (imgPath, userID) => {
//     try {
//         const query = "UPDATE users SET profileImage = ? WHERE userID = ?";
//         const result = await new Promise((resolve, reject) => {
//             db.query(query, [imgPath, userID], (err, data) => {
//                 if (err) {
//                     reject({ success: false, error: err.toString() });
//                 }
//                 resolve(data);
//             });
//         });

//         if (result && result?.affectedRows > 0) {
//             // return { success: true, message: "File uploaded successfully" };
//             return { success: true, userID: userID, profileImage: imgPath };
//         }
//         else {
//             return { success: false, message: "Internal Server Error" };
//         }

//     }
//     catch (err) {
//         return { success: false, error: err };
//     }
// }

// save to cloudinary
const addProfileImage = async (locaFilePath, userID) => {
    try {
        const cloudinaryResult = await uploadToCloudinary(locaFilePath);

        if (cloudinaryResult?.success !== true) {
            return { ...cloudinaryResult };
        }
        const cloudinaryImgUrl = await cloudinaryResult?.url;

        const date = new Date();
        const updateTime = date.toISOString().slice(0, 19).replace('T', ' ');

        const query = "UPDATE users SET profileImage = ?, updateDateTime = ? WHERE userID = ?";
        const result = await new Promise((resolve, reject) => {
            db.query(query, [cloudinaryImgUrl, updateTime, userID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        if (result && result?.affectedRows > 0) {
            // return { success: true, message: "File uploaded successfully" };
            return { success: true, userID: userID, profileImage: cloudinaryImgUrl };
        }
        else {
            const fileNameWithExt = cloudinaryImgUrl?.split("directory_listing/uploads/")[1];
            const extension = path.extname(fileNameWithExt);
            const public_id = "directory_listing/uploads/" + fileNameWithExt.split(extension)[0];
            await cloudinary.uploader.destroy(public_id);

            return { success: false, message: "Internal Server Error" };
        }
    }
    catch (err) {
        return { success: false, error: err };
    }
}


// save to local folder
// const removeProfileImage = async (imgPath, userID) => {

//     const DIR = './uploads';
//     const fileName = imgPath?.split("/public")?.[1];

//     try {
//         const query = "UPDATE users SET profileImage = ? WHERE userID = ? and profileImage = ? ";
//         const result = await new Promise((resolve, reject) => {
//             db.query(query, [null, userID, imgPath], (err, data) => {
//                 if (err) {
//                     reject({ success: false, error: err.toString() });
//                 }
//                 resolve(data);
//             });
//         });

//         if (result && result?.affectedRows > 0) {
//             fs.unlink(`${DIR}${fileName}`, (err) => {
//                 if (err) {
//                     console.log("img unlink error", err.toString())
//                 }
//             })
//             return { success: true, userID: userID };
//         }
//         else if (result && result?.affectedRows == 0) {
//             return { success: false, message: "Image path is not valid" }
//         }
//         else {
//             return { success: false, message: "Internal Server Error" };
//         }
//     }
//     catch (err) {
//         return { success: false, error: err };
//     }
// }

// save to cloudinary
const removeProfileImage = async (imgPath, userID) => {
    try {
        const date = new Date();
        const updateTime = date.toISOString().slice(0, 19).replace('T', ' ');

        const query = "UPDATE users SET profileImage = ?, updateDateTime = ? WHERE userID = ? and profileImage = ? ";
        const result = await new Promise((resolve, reject) => {
            db.query(query, [null, updateTime, userID, imgPath], (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });

        if (result && result?.affectedRows > 0) {

            const fileNameWithExt = imgPath?.split("directory_listing/uploads/")[1];
            const extension = path.extname(fileNameWithExt);
            const public_id = "directory_listing/uploads/" + fileNameWithExt.split(extension)[0];

            await cloudinary.uploader.destroy(public_id);

            return { success: true, userID: userID };
        }
        else if (result && result?.affectedRows == 0) {
            return { success: false, message: "Image path is not valid" }
        }
        else {
            return { success: false, message: "Internal Server Error" };
        }
    }
    catch (err) {
        return { success: false, error: err };
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
            const updateListingStatusQuery = "UPDATE listing SET isListingExist = ? WHERE userID = ? ";
            const result = await new Promise((resolve, reject) => {
                db.query(updateListingStatusQuery, ["notExists", userID], (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                });
            });
            return { success: true }
        } else {
            return { success: false, message: "Internal server error" }
        }
    } catch (err) {
        return { success: false, error: err }
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
        errors.password = "newPassword field is required";
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


// const getUserPublicInfo = async (userNameOrId) => {

//     try {
//         const query = "SELECT userID, userName, email, firstName, lastName, phone, bio, socialNetworks, verificationStatus, address, profileImage FROM users WHERE userName = ? OR userID = ? ";
//         const result = await new Promise((resolve, reject) => {
//             db.query(
//                 query, [userNameOrId, userNameOrId], (err, data) => {
//                     if (err) {
//                         reject({ success: false, error: err.toString() });
//                     }
//                     resolve(data);
//                 }
//             );
//         });

//         if (result && result?.length > 0) {
//             return { success: true, data: result[0] };
//         } else if (result && result?.length == 0) {
//             return { success: false, message: "User doesn't found" };
//         } else {
//             const resMsg = { ...result };          // internal server error
//             return resMsg
//         }

//     } catch (error) {
//         return { success: false, error: err }
//     }
// };


const allUserDetails = async () => {
    try {
        const query = `SELECT userID, userName, email, verificationStatus, role, firstName, lastName, phone, bio, socialNetworks, address, profileImage, registerDateTime, resetPasswordDateTime, isAccountExists, favourites, updateDateTime As profileUpdateTime FROM users WHERE role !="Admin"`;
        const result = await new Promise((resolve, reject) => {
            db.query(query, (err, data) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(data);
            });
        });
        return { success: true, data: result };

    } catch (error) {
        return { success: false, error: err }
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
        return { success: false, error: err };
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
    // getUserPublicInfo,
    allUserDetails
}
