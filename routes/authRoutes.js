const express = require("express");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();
const db = require("../config/dbConfig.js");
const auth = require("../functions/auth.js");
const common = require("../functions/common.js");
const jwt = require("jsonwebtoken");
const { jwtDecode } = require("jwt-decode");
const { sendMail } = require("../middlewares/sendMail.js");

const router = express.Router();

router.post("/signup", async (req, res) => {

  // if (req.body && Object.keys(req.body).length == 0) {
  //   return res.status(400).json({ success: false, message: "All fields are mandatory" });
  // }

  const reqUserData = req.body; // userName, email, role(admin, user), password, confirmPassword

  const { errors, isValid } = auth.validateSignUp(reqUserData);

  if (!isValid) {
    return res.status(400).json({ success: false, error: errors });
  }

  try {
    const selectQuery =
      "SELECT userName, email FROM users WHERE email = ? OR userName = ? limit 1";

    const result = await new Promise((resolve, reject) => {
      db.query(
        selectQuery,
        [reqUserData.email.trim(), reqUserData.userName.trim()],
        (err, data) => {
          if (err) {
            reject({ success: false, error: err.toString() });
          }
          resolve(data);
        }
      );
    });

    if (result?.length > 0) {
      const error = {};

      if (result[0].email == req.body.email.trim()) {
        error.email = "Email address already in use";
      }
      if (result[0].userName == req.body.userName.trim()) {
        error.userName = "Username address already in use";
      }

      return res.status(400).json(error);
    } else {
      const insertQuery =
        "INSERT INTO users (userID,userName, email, password, role, registerDateTime, firstName, lastName, phone, bio, socialNetworks, resetPasswordDateTime, resetPasswordToken, isAccountExists, verificationStatus, address, updateDateTime, profileImage, favourites) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

      const encPassword = bcrypt.hashSync(reqUserData.password, bcrypt.genSaltSync(10));

      const result3 = await new Promise((resolve, reject) => {
        db.query(
          insertQuery,
          [
            null, // userID
            reqUserData.userName.trim(), // userName
            reqUserData.email.trim(),     // email
            encPassword,            // password
            reqUserData.role.trim(), // role
            new Date().toISOString(), // registerDateTime
            null, // firstName
            null, // lastName
            null, // phone
            null, // bio
            JSON.stringify({}), // socialNetworks     
            null, // resetPasswordDateTime
            null, // resetPasswordToken
            "exists", // isAccountExists
            "notVerify", // verificationStatus
            null,  // address
            null,   // updateDateTime
            null,    // profileImage
            JSON.stringify([])  // favourites
          ],
          async (err, result) => {
            if (err) {
              reject({ success: false, error: err.toString() });
            }

            // Create and send the JWT token
            jwt.sign({ email: reqUserData.email }, process.env.SECRET_KEY, { expiresIn: "10m" }, async (err, token) => {
              if (err) {
                return res.json({ success: false, err: err.toString() });
              }

              const link = `${process.env.BASE_URL}/api/auth/verify/${token}`;
              const mailSendRes = await sendMail("registration_Confirm_Email_Template", reqUserData.email, link);

              let resObj = {
                // token: token, // mail verification token
                userData: {
                  userName: reqUserData.userName,
                  role: reqUserData.role,
                  verificationStatus: "notVerify",
                  isAccountExists: "exists",
                },
              };

              if (mailSendRes?.success == true) {
                return res.json({ ...resObj, isMailSent: true, success: true }); // Note: true means  -  message: "A verification email has been sent to your provided email address"    need to show message from frontend
              } else {
                return res.json({ ...resObj, isMailSent: false, success: true });
              }
            }
            );
          }
        );
      });
    }
  } catch (err) {
    var resmsg = { success: false, err: err.toString() };
    return res.json(resmsg);
  }
});


router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;

  jwt.verify(token, process.env.SECRET_KEY, async function (err, decoded) {
    if (err) {
      return res.send("Email verification failed, possibly the link is invalid or expired");
    } else {
      // res.send("Email verified successfully");
      const selectQuery = "SELECT * FROM users WHERE email = ? limit 1";

      const result = await new Promise((resolve, reject) => {
        db.query(selectQuery, decoded?.email, async (err, data) => {
          if (err) {
            reject({ success: false, error: err.toString() });
          }
          resolve(data);
        });
      });

      if (!(result?.length > 0)) {
        return res.status(404).send("the email provided was not found");
      }
      else if (result?.length > 0) {
        const updateQuery = "UPDATE users SET verificationStatus = ? WHERE email = ? limit 1";
        const userDetail = await new Promise((resolve, reject) => {
          db.query(updateQuery, ["verified", decoded?.email], (err, data) => {
            if (err) {
              reject({ success: false, error: err.toString() });
            }
            resolve(data);
          });
        });
        return res.send("Email verified successfully!"); // Note: redirect to login remain
      } else {
        return res.status(500).send("Internal Server Error");
      }
    }
  });
});


router.post("/login", async (req, res) => {
  const reqUserData = req.body;

  const { errors, isValid } = auth.validateSignIn(reqUserData);

  if (!isValid) {
    return res.status(400).json({ success: false, error: errors });
  }

  try {
    const { emailOrUserName, password } = req.body;
    let selectQuery = "SELECT password, isAccountExists, verificationStatus, email, role, userName, userID FROM users WHERE email = ? OR userName = ? limit 1";

    const result = await new Promise((resolve, reject) => {
      db.query(selectQuery, [emailOrUserName.trim(), emailOrUserName.trim()], (err, data) => {
        if (err) {
          reject({ success: false, error: err.toString() });
        }
        resolve(data);
      }
      );
    });

    if (result?.length > 0) {
      let suppliedPassword = password;
      let storedPassword = result?.[0]?.password;
      const isPasswordMatch = bcrypt.compareSync(suppliedPassword, storedPassword);

      if (!isPasswordMatch) {
        return res.status(400).json({ success: false, error: "Incorrect password" });
      }
      else {

        if (result[0]?.isAccountExists == "notExists") {    // account delete kryu hse
          return res.status(400).json({ error: "User account doesn't exists" });
        }
        else if (result[0]?.verificationStatus == "notVerify") {

          // Create and send the JWT token 
          jwt.sign({ email: result[0]?.email }, process.env.SECRET_KEY, { expiresIn: "10m" }, async (err, token) => {
            if (err) {
              return res.json({ success: false, error: err.toString() });
            }

            const link = `${process.env.BASE_URL}/api/auth/verify/${token}`;
            const mailSendRes = await sendMail("registration_Confirm_Email_Template", result[0]?.email, link);

            let resObj = {
              token: token, // mail verification token
              userData: {
                userName: result[0]?.userName,
                role: result[0]?.role,
                verificationStatus: "notVerify",
                isAccountExists: result[0]?.isAccountExists,
                userID: result[0]?.userID
              },
            };

            if (mailSendRes.success == true) {
              // if user is not verified then only will send 'isMailSent'. login & signup both ma.
              return res.json({ ...resObj, isMailSent: true }); // true means  -  message: "Please verify your email address first. A verification email has been sent to your provided email address"    need to show message from frontend
            } else {
              return res.json({ ...resObj, isMailSent: false });
            }
          }
          );
        } else {
          let retObj = {};
          retObj.success = true;
          retObj.userData = {
            userId: result[0]?.userID,
            userName: result[0]?.userName,
            role: result[0]?.role,
            isAccountExists: result[0]?.isAccountExists,
            verificationStatus: result[0]?.verificationStatus,
          };
          retObj.authToken = await common.jwtSign({ email: result[0]?.email, userID: result[0]?.userID }, process.env.LOGIN_EXPIRATION, process.env.SECRET_KEY);
          res.json(retObj);
        }
      }
    } else {
      res.json({ success: false, error: "User does not exists!" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
});


router.post("/forgotPassword", async (req, res) => {    // email

  try {
    let usrObj = await auth.sendPasswordResetToken(req.body?.email);
    res.send(usrObj);
  } catch (err) {
    var result = { success: false, error: err.toString() };
    res.send(result);
  }
});


router.post("/resetForgottenPassword", async (req, res) => {    // resetPswdToken, newPassword 

  if (!req.body?.resetPswdToken || !req.body?.newPassword) {
    return res.status(400).json({ message: "All fields are mandatory" });
  }

  try {
    const { resetPswdToken, newPassword } = req.body;
    const decoded = jwtDecode(resetPswdToken);

    const { emailErrors, isValidEmail } = auth.validateEmail(decoded?.email);
    const { pswdErrors, isValidPswd } = auth.validatePswd(newPassword);

    if (!isValidEmail) {
      return res.status(400).json({ success: false, error: emailErrors });
    }
    if (!isValidPswd) {
      return res.status(400).json({ success: false, error: pswdErrors });
    }

    let selectQuery = "SELECT userID, resetPasswordToken FROM users WHERE email = ? limit 1";

    const selectRes = await new Promise((resolve, reject) => {
      db.query(selectQuery, decoded?.email, (err, data) => {
        if (err) {
          reject({ success: false, error: err.toString() });
        }
        resolve(data);
      });
    });

    if (!selectRes?.length > 0) {
      return res.status(404).json({ success: false, message: "email doesn't found" });
    }

    jwt.verify(resetPswdToken, process.env.SECRET_KEY + selectRes[0].userID, async function (err, decoded) {
      if (err) {
        return res.send("Cannot reset the password, possibly the link is invalid or expired");
      }

      const encPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));

      const updatePswdQuery = "UPDATE users SET password = ? WHERE email = ? and resetPasswordToken = ? ";

      const updateResult = await new Promise((resolve, reject) => {
        db.query(updatePswdQuery, [encPassword, decoded?.email, selectRes[0].resetPasswordToken], (err, data) => {
          if (err) {
            reject({ success: false, error: err.toString() });
          }
          resolve(data);
        });
      });

      if (updateResult && updateResult?.affectedRows > 0) {
        return res.json({ success: true, email: decoded?.email });
      } else {
        return res.status(500).json({ success: false, message: "Internal server error" });
      }
    });
  } catch (err) {
    var result = { success: false, error: err.toString() };
    res.send(result);
  }
});


module.exports = router;
