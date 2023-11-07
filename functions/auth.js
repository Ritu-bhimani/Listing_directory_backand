const validator = require("validator");
const isEmpty = require("lodash.isempty");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const common = require("./common");
const db = require("../config/dbConfig");
const { sendMail } = require("../middlewares/sendMail.js");

const validateRole = (role) => {
  // const validRoles = ["admin", "user", "basic"];
  const validRoles = ["admin", "user"];
  return validRoles.includes(role);
};

const validateEmail = (userEmail) => {
  const email = userEmail ? userEmail.toString() : ''
  const emailErrors = {};

  // email = email ? email.toString() : "";

  if (validator.isEmpty(email)) {
    emailErrors.email = "Email field is required";
  } else if (!validator.isEmail(email)) {
    emailErrors.email = "Email is invalid";
  }

  return { emailErrors, isValidEmail: isEmpty(emailErrors) };
};

const validatePswd = (password) => {
  const pswdErrors = {};

  password = password ? password.toString() : "";

  if (validator.isEmpty(password)) {
    pswdErrors.password = "Password field is required";
  } else if (!validator.isLength(password, { min: 6, max: 30 })) {
    pswdErrors.password = "Password must be at least 6 characters long";
  }

  return { pswdErrors, isValidPswd: isEmpty(pswdErrors) };
};

const validateSignUp = (userData) => {
  const data = userData ? userData : {};
  let errors = {};

  // data.userName = data.userName ? data.userName.toString() : "";
  // data.email = data.email ? data.email.toString() : "";
  // data.password = data.password ? data.password.toString() : "";
  // data.confirmPassword = data.confirmPassword ? data.confirmPassword.toString() : "";

  if (!data.hasOwnProperty("userName") || validator.isEmpty(data.userName)) {
    errors.userName = "Username field is required";
  } else if (!validator.isLength(data.userName, { min: 4, max: 30 })) {
    errors.userName = "Username must be at least 4 characters long";
  }

  if (!data.hasOwnProperty("email") || validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  } else if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (!data.hasOwnProperty("password") || validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  } else if (!validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be at least 6 characters long";
  }

  if (!data.hasOwnProperty("confirmPassword") || validator.isEmpty(data.confirmPassword)) {
    errors.confirmPassword = "Confirm password field is required";
  } else if (!validator.equals(data.password, data.confirmPassword)) {
    errors.confirmPassword = "Passwords must match";
  }

  if (!data.hasOwnProperty("role") || validator.isEmpty(data.role)) {
    // must need to send from frontend side as a string (admin or user. not 'basic' for now)     // in db type: enum
    errors.role = "Role field is required";
  } else if (!validateRole(data.role.toString())) {
    errors.role = "Role must be 'admin' or 'user'";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

const validateSignIn = (data) => {
  let errors = {};
  // const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailOrUserName);
  //   if (isEmail) {
  //     if (!validator.isEmail(data.email)) {
  //       errors.email = "Email is invalid";
  //     }
  //   }

  data.emailOrUserName = data?.emailOrUserName ? data.emailOrUserName.toString() : "";
  data.password = data?.password ? data.password.toString() : "";

  if (validator.isEmpty(data.emailOrUserName)) {
    errors.emailOrUserName = "Email or Username is required";
  }

  if (validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

const sendPasswordResetToken = async (email) => {

  const { emailErrors, isValidEmail } = validateEmail(email);

  if (!isValidEmail) {
    return { success: false, error: emailErrors };
  }

  try {
    const resetDateTime = new Date().toISOString();

    const selectQuery = "SELECT * FROM users WHERE email = ? limit 1";

    const result = await new Promise((resolve, reject) => {
      db.query(selectQuery, email.trim(), (err, data) => {
        if (err) {
          reject({ success: false, error: err.toString() });
        }
        resolve(data);
      });
    });

    if (!result || result.length === 0) {
      return { success: false, message: "the provided email was not found" };
    } else {
      const resetPswdToken = jwt.sign({ email: result[0].email }, process.env.SECRET_KEY + result[0].userID);
      console.log("ResetPswdToken for forgotPassword: ", `${resetPswdToken}`);

      const updateQuery = "UPDATE users SET resetPasswordToken = ?, resetPasswordDateTime = ? WHERE email = ?";

      const updateResult = await new Promise((resolve, reject) => {
        db.query(updateQuery, [resetPswdToken, resetDateTime, result[0].email], (err, data) => {
          if (err) {
            reject({ success: false, error: err.toString() });
          }
          resolve(data);
        });
      });

      if (updateResult && updateResult?.affectedRows > 0) {
        const resetPswdUrl = `${process.env.BASE_URL}/forgot-password/${resetPswdToken}`; // need to add/create this route in frontend or change base path in backend
        const mailSendRes = await sendMail("forgot_Password_Email_Template", result[0]?.email, resetPswdUrl);

        if (mailSendRes?.success === true) {
          return { isMailSent: true, email: result[0].email, success: true };
        } else {
          return { sucess: true, isMailSent: false, email: result[0].email, success: false };   // error in sending mail
        }
      } else {
        return { success: false, error: "Internal Server Error" };
      }
    }
  } catch (err) {
    return { success: false, error: err };
  }
};


// const sendPasswordResetToken = async (email) => {
//   const { errors, isValidEmail } = validateEmail(email);

//   if (!isValidEmail) {
//     return { success: false, errors };
//   }

//   try {
//     const resetDateTime = new Date().toISOString();

//     const selectQuery =  "SELECT * FROM users WHERE email = ? limit 1";

//     const result = await new Promise((resolve, reject) => {
//       db.query(
//         selectQuery,
//         email.trim(),
//         (err, data) => {
//           if (err) {
//             reject({ success: false, error: err });
//           }
//           resolve(data);
//         }
//       );
//     });

//     if(!result?.length > 0) {
//       return { message: "the provided email was not found" };
//     }
//     else if(result?.length > 0)
//     {

//       // Create and send the JWT token
//       jwt.sign(
//         { email: result[0].email },
//         process.env.SECRET_KEY + result[0].userID,
//         {
//           expiresIn: "10m",       // expiresIn: 31556926, // 1 year in seconds
//         },
//         async (err, resetPswdToken) => {
//           if (err) {
//             return res.json({success: false, err: err});
//           }

//           const updateQuery = "UPDATE users SET resetPasswordToken = ?, resetPasswordDateTime = ? WHERE email = ?";

//           const updateResult = await new Promise((resolve, reject) => {
//             db.query(updateQuery, [resetPswdToken, resetDateTime, result[0].email],
//               (err, data) => {
//                 if (err) {
//                   reject({ success: false, error: err });
//                 }
//                 resolve(data);
//               }
//             );
//           });

//           if(updateResult && updateResult?.affectedRows > 0){
//             // const link = `${process.env.BASE_URL}/api/auth/forgot-password/${token}`;
//             const resetPswdUrl = `${process.env.BASE_URL}/forgot-password/${resetPswdToken}`;
//             const mailSendRes = await sendMail("forgot_Password_Email_Template", result[0]?.email, resetPswdUrl);

//             let resObj = {}
//             resObj.userID = result[0].userID;

//             if (mailSendRes?.success == true) {
//               return { isMailSent: true }; // Note: true means  -  msg: "password reset link sent to your email account"    need to show msg from frontend
//             } else {
//               return { isMailSent: false };
//             }
//           }
//         }
//       );
//     }else {
//       return res.status(500).json({ message: "Internal Server Error" });
//     }

//   } catch (err) {
//     return { success: false };
//   }
// };



module.exports = {
  validateSignUp,
  validateSignIn,
  sendPasswordResetToken,
  validateEmail,
  validatePswd,
};
