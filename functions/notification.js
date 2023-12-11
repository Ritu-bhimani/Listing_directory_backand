const db = require("../config/dbConfig");
const validator = require("validator");
const isEmpty = require("lodash.isempty");

async function executeQuery(query, values) {
    try {
        const { type, listingID, listingTitle, createdByID, notificationView, clearNotification, approvals } = values;

        const date = new Date();
        const createTime = date.toISOString().slice(0, 19).replace('T', ' ');

        const result = await new Promise((resolve, reject) => {
            db.query(query, [type, listingID, listingTitle, createdByID, notificationView, clearNotification, approvals, createTime], (err, resData) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(resData);
            });
        });

        return { success: true, result };

    } catch (err) {
        return { success: false, error: err };
    }
};

const getUserNotification = async (notificationType, userID) => {    // type: ['listing_approved','listing_rejected'],  userID
    try {
        const placeholders = notificationType.map(() => "?").join(",");

        const query = `SELECT * FROM notifications WHERE type IN (${placeholders}) AND createdFor = ?`;

        const result = await new Promise((resolve, reject) => {
            db.query(query, [...notificationType, userID], (err, resData) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(resData);
            });
        });

        return { success: true, data: result };

    } catch (err) {
        return { success: false, error: err };
    }
};

const validateNtfyUserFields = async (data) => {
    let errors = {};

    data.type = data?.type ? data.type : [];

    if (!Array.isArray(data.type) || data.type.length === 0) {
        errors.type = "type must be a non-empty array";        //  "notification type required
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
}

const getAdminNotification = async (notificationType) => {    // type: ['listing_added','listing_updated']
    try {
        // const query = `SELECT * FROM notifications WHERE type IN ('listing_added','listing_updated'))`;

        const placeholders = notificationType?.map(() => "?").join(",");

        const query = `SELECT * FROM notifications WHERE type IN (${placeholders})`;

        const result = await new Promise((resolve, reject) => {
            db.query(query, [...notificationType], (err, resData) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(resData);
            });
        });

        return { success: true, data: result };

    } catch (err) {
        return { success: false, error: err };
    }
};


const addNotification = async (notification) => {
    try {

        const query = `INSERT INTO notifications (notificationID,type,listingID,listingTitle,createdByID,notificationView,clearNotification,approvals,createdAt,createdFor) VALUES(null,?,?,?,?,?,?,?,?,?)`;

        if (!['listing_added', 'listing_updated', 'listing_approved', 'listing_rejected'].includes(notification.type)) {
            return { success: false, message: 'Invalid notification type' }
        }

        // const result = await executeQuery(query, notification);
        // return result.insertId;

        const { type, listingID, listingTitle, createdByID, notificationView, clearNotification, approvals, createdFor } = notification;

        const date = new Date();
        const createTime = date.toISOString().slice(0, 19).replace('T', ' ');

        const result = await new Promise((resolve, reject) => {
            db.query(query, [type, listingID, listingTitle, createdByID, notificationView, clearNotification, approvals, createTime, createdFor], (err, resData) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(resData);
            });
        });

        return { success: true, notificationID: result[0]?.insertId };    // message: "" 

    } catch (err) {
        return { success: false, error: err };
    }
};


const updateNotification = async (notification) => {
    try {
        // const query = 'UPDATE notifications SET ? WHERE id = ?';
        // const result = await executeQuery(query, notification);
        // return result

        const query = 'UPDATE notifications SET notificationView = ?, clearNotification = ? WHERE notificationID = ?';

        const { notificationView, clearNotification, notificationID } = notification;

        const result = await new Promise((resolve, reject) => {
            db.query(query, [notificationView, clearNotification, notificationID], (err, resData) => {
                if (err) {
                    reject({ success: false, error: err.toString() });
                }
                resolve(resData);
            });
        });

        if (result && result?.affectedRows == 0) {
            return { success: false, message: "NotificationID is invalid" };
        }

        return { success: true, notificationID: notification.notificationID }

    } catch (err) {
        return { success: false, error: err };
    }
};

module.exports = {
    addNotification,
    updateNotification,
    getUserNotification,
    validateNtfyUserFields,
    getAdminNotification
}