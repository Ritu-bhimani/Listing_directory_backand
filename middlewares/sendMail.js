const nodemailer = require("nodemailer")
const dotenv = require("dotenv").config()
const ejs = require('ejs')
const path = require('path');


// used in login, signup
const sendMail = async (templateName, email, verificationUrl) => {
  try {
    const templatePath = path.join(__dirname, 'email-templates', `${templateName}.ejs`);
    const template = await ejs.renderFile(templatePath, {email, verificationUrl});

    // Create a Nodemailer transport
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vaibhav.specscale@gmail.com',
        pass: 'btwtfowownkmtdvt'
      }
    });

    // Define the email options
    let mailOptions = {
      from: 'vaibhav.specscale@gmail.com',
      to: `${email}`,
      // subject:templateName === 'password_Reset_Template' ? ' Password Change Confirmation: Action Required for Your Account' :templateName === 'registration_Confirm_Email_Template' ? 'Your Directory and Listing account – Please complete your registration': templateName === 'verify_Email_Template' ? 'Your Directory and Listing account – Registration successful' :templateName === 'pw_Successfully_Changed_Template' ? 'Your Directory and Listing account – Password changed' :'',
      subject:templateName === 'password_Reset_Template' ? ' Password Change Confirmation: Action Required for Your Account' :templateName === 'registration_Confirm_Email_Template' ? 'Your Directory and Listing account – Please complete your registration': templateName === 'verify_Email_Template' ? 'Your Directory and Listing account – Registration successful' :templateName === 'pw_Successfully_Changed_Template' ? 'Your Directory and Listing account – Password changed' : templateName === 'forgot_Password_Email_Template' ? 'Password Reset - Expires in 10 min.' : '',
      html: template 
    };

    // Send the email
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info?.messageId);

    const resObj = {}
    resObj.success = true
    return resObj;

  } catch (err) {
    console.error('Error sending email:', err);
    return {success: false, error: err}
  }

};


module.exports = {
    sendMail
}