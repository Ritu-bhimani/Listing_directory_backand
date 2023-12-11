const express = require("express");
const { jwtDecode } = require("jwt-decode");
const db = require("../config/dbConfig");
const { getAdminNotification, updateNotification, getUserNotification } = require("../functions/notification");
const common = require("../functions/common");

const router = express.Router();

router.get("/ntfyUser", async (req, res) => {    // "type": ["listing_approved","listing_rejected"] 
    try {
        const reqUserData = req.body;

        if (!Array.isArray(reqUserData.type) || reqUserData.type.length === 0) {
            return res.status(400).send({ success: false, error: "'type' must be a non-empty array" });   //  "notification type required
        }

        var auth = common.validAuthHeader(req);

        if (auth.validated == true) {
            const notification = await getUserNotification(req.body?.type, auth?.userID);
            res.send(notification);
        } else {
            var resmsg = { success: false, message: "Failed auth validation" }
            return res.status(401).send(resmsg)
        }

    } catch (err) {
        console.log("/ntfyUser catch error ", err);
        return res.status(500).json({ error: err.toString() });
    }
});

router.get("/ntfyAdmin", async (req, res) => {    // "type": ["listing_added","listing_updated"]
    try {
        if ((!Array.isArray(req.body.type) || req.body.type.length === 0)) {
            return res.status(400).send({ success: false, message: "'type' must be a non-empty array" })
        }

        var auth = common.validAuthHeader(req);

        if (auth.validated == true) {
            const payloadData = jwtDecode(req.headers["authorization"]?.split(' ')[1])?.data;

            if (payloadData.role !== "admin") {
                return res.status(403).send({ success: false, message: "Unauthorized access" });
            }

            const notification = await getAdminNotification(req.body?.type);
            res.send(notification);

        } else {
            var resmsg = { success: false, message: "Failed auth validation" }
            return res.status(401).send(resmsg)
        }

    } catch (err) {
        console.log("/ntfyAdmin catch error ", err);
        return res.status(500).json({ error: err.toString() });
    }
});


router.put("/update", async (req, res) => {
    try {
        const notification = req.body;          // notificationID +  notificationView(userID) OR  clearNotification(userID) required

        if (!notification.notificationID) {
            return res.status(400).send({ success: false, error: "notificationID field is required" });
        }

        if (!notification.notificationView && !notification.clearNotification) {
            return res.status(400).send({ success: false, error: "Either notificationView or clearNotification field is required" });
        }

        var auth = common.validAuthHeader(req);

        if (auth.validated == true) {

            // get particular notification details
            const selectQuery = "SELECT * FROM notifications WHERE notificationID = ?";
            const notificationResult = await new Promise((resolve, reject) => {
                db.query(selectQuery, [notification.notificationID], (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                });
            });

            if (notificationResult && !(notificationResult.length > 0)) {
                return res.status(400).send({ success: false, message: "Invalid notificationID" });
            }

            let notifications = notificationResult[0];

            //  handlechangenotification            _id: el._id (notificationID), notificationView: user.id(loggedIN userID)
            // adding userID to  particular notification's  notificationView array
            if (notification.notificationView) {
                notifications.notificationView = JSON.parse(notifications.notificationView);

                if (notifications.notificationView.length === 0) {
                    notifications.notificationView = [notification.notificationView];
                }
                else if (notifications.notificationView.length > 0) {
                    if (!notifications.notificationView.includes(notification.notificationView))         // if  reqBody's notificationView(userID)  not in   notification_table_record
                    {
                        notifications.notificationView.push(notification.notificationView);              // userID pushed in parsed
                    }
                }
                notifications.notificationView = JSON.stringify(notifications.notificationView)
            }

            //  handleClearAll            _id: el.notificationID, clearNotification: user.id  - loop
            if (notification.clearNotification) {
                notifications.clearNotification = JSON.parse(notifications.clearNotification);
                if (notifications.clearNotification.length === 0) {
                    notifications.clearNotification = [notification.clearNotification];
                }
                else if (notifications.clearNotification.length > 0) {
                    if (!notifications.clearNotification.includes(notification.clearNotification)) {
                        notifications.clearNotification.push(notification.clearNotification);                // userID pushed in parsed
                    }
                }
                notifications.clearNotification = JSON.stringify(notifications.clearNotification);
            }

            // update particular notification details
            let result = await updateNotification(notifications);

            if (result?.success === false) {
                return res.send(result)
            }

            // get particular notification updated details
            const selQuery = "SELECT * FROM notifications WHERE notificationID = ?";
            const notificationRes = await new Promise((resolve, reject) => {
                db.query(selQuery, [notification.notificationID], (err, data) => {
                    if (err) {
                        reject({ success: false, error: err.toString() });
                    }
                    resolve(data);
                });
            });

            return res.send({ success: true, message: "Notification updated successfully...!", data: notificationRes[0] });
        }
        else {
            var resmsg = { success: false, message: "Failed auth validation" }
            return res.status(401).send(resmsg)
        }

    } catch (err) {
        console.log("/update notification catch error ", err)
        return res.status(500).json({ error: err.toString() });
    }
});


module.exports = router;
