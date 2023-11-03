const { json } = require("express");
const db = require("../config/dbConfig.js");
const bcrypt = require("bcrypt");
const fs = require("fs");

const getUserByUserID = async (userID) => {
    try {
        const selectQuery = "SELECT * FROM users WHERE userID = ? limit 1";

        const result = await new Promise((resolve, reject) => {
            db.query(selectQuery, userID, (err, data) => {
                if (err) {
                    reject({ success: false, error: err });
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
                        reject({ success: false, error: err });
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
        userData.firstName = data?.firstName ? data.firstName : userData.firstName;
        userData.lastName = data?.lastName ? data.lastName : userData.lastName;
        userData.address = data?.address ? data.address : userData.address;
        userData.phone = data.phone ? data.phone : userData.phone;
        userData.bio = data?.bio ? data.bio : userData.bio;
        userData.updateDateTime = new Date().toISOString();

        const query = "UPDATE users SET firstName = ?, lastName = ?, address = ?, phone = ?, bio = ?, updateDateTime = ? WHERE userID = ?";
        const result = await new Promise((resolve, reject) => {
            db.query(query, [userData.firstName, userData.lastName, userData.address, userData.phone, userData.bio, userData.updateDateTime, userID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err });
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


const updateUserSocial = async (data, userID) => {

    try {
        let userData = await getUserByUserID(userID);
        // userData.socialNetworks = data ? data : userData.socialNetworks;
        userData.socialNetworks = data ? JSON.stringify(data) : "";
        // userData.socialNetworks = JSON.stringify(data);
        userData.updateDateTime = new Date().toISOString();

        const query = "UPDATE users SET socialNetworks = ?, updateDateTime = ? WHERE userID = ?";
        const result = await new Promise((resolve, reject) => {
            db.query(query, [userData.socialNetworks, userData.updateDateTime, userID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err });
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


const addProfileImage = async (imgPath, userID) => {
    try {
        const query = "UPDATE users SET profileImage = ? WHERE userID = ?";
        const result = await new Promise((resolve, reject) => {
            db.query(query, [imgPath, userID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err });
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

    }
    catch (err) {
        return json({ success: false, error: err.toString() });
    }
}


const removeProfileImage = async (imgPath, userID) => {

    const DIR = './uploads';
    const fileName = imgPath?.split("/public")?.[1];

    console.log("image path", imgPath);
    console.log("relative path", `${DIR}${fileName}`)

    try {
        const query = "UPDATE users SET profileImage = ? WHERE userID = ? and profileImage = ? ";
        const result = await new Promise((resolve, reject) => {
            db.query(query, [null, userID, imgPath], (err, data) => {
                if (err) {
                    reject({ success: false, error: err });
                }
                resolve(data);
            });
        });

        if (result && result?.affectedRows > 0) {
            fs.unlink(`${DIR}${fileName}`, (err) => {
                if (err) {
                    console.log(err)
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
        return { error: err };
    }
}

const delteUserAccount = async (userID) => {     // this will only change user  "isAccountExists"  status from  exists to  notExists. // not delete the record/account from user table.
    try {
        // const deleteQuery = "DELETE FROM users WHERE userID = ? ";
        const updateQuery = "UPDATE users SET isAccountExists = ? WHERE userID = ? ";

        const result = await new Promise((resolve, reject) => {
            db.query(updateQuery, ["notExists", userID], (err, data) => {
                if (err) {
                    reject({ success: false, error: err });
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

const authenticateEmail = async (email, password) => {
    try {
        const query = "SELECT userID, password FROM users WHERE email = ? limit 1";

        const result = await new Promise((resolve, reject) => {
            db.query(query, email, (err, data) => {
                if (err) {
                    reject({ success: false, error: err });
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
    delteUserAccount
}