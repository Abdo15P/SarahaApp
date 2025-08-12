import transporter from "../../utils/email.js";
import { asyncHandler } from "../../utils/response.js";

export const sendEmail = asyncHandler(async (req,res,next) => {
  
    const mailOptions = {
      from: ` <me@gmail.com>`,
      to: req.user.email,
      subject: 'hello',
      html:"<b>Hello world?</b>",
    }

    await transporter.sendMail(mailOptions);
    // console.log('email sent');
   
})