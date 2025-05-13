const { ObjectId } = require("mongodb");
const { db } = require("../config/db");
const nodemailer = require("nodemailer");
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.NODEMAILER_EMAIL,
//     pass: "ncew jbde yziz kcqo",
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

let transporter = nodemailer.createTransport({
  host:"smtp.hostinger.com",
  port:465,
  secure:true,
  auth: {
    user:process.env.NODEMAILER_EMAIL,
    pass:process.env.NODEMAILER_PASS,
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  console.log("from:",process.env.NODEMAILER_EMAIL);
  try {
    const info = await transporter.sendMail({
      from:process.env.NODEMAILER_EMAIL,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent successfully!", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const {
      orderId,
      status,
      price,
      paymentMethod,
      deliveryCharge,
      orderDate,
      customerInfo,
    } = req.body;
    console.log("customerInfo", customerInfo.email);
    if (!orderId || !status) {
      return res
        .status(400)
        .json({ message: "Order ID and status are required" });
    }
    const orderObjectId = new ObjectId(orderId);
    const result = await db
      .collection("orders")
      .updateOne({ _id: orderObjectId }, { $set: { status: status } });
    if (result.modifiedCount === 1) {
      console.log("Delivery status updated successfully");
      // Send email notification to the user
      const emailPayload = {
        to:customerInfo.email,
        subject: "Order Delivery Status Update",
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #4CAF50;">Order Delivery Status Update</h2>
      <p>Dear ${customerInfo.fname} ${customerInfo.lname},</p>
      <p>We are pleased to inform you that the delivery status of your order has been updated. Please find the details below:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Order ID</th>
        <td style="border: 1px solid #ddd; padding: 8px;">${orderId}</td>
        </tr>
        <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Delivery Status</th>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; color: #4CAF50;">${status}</td>
        </tr>
        <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
        <td style="border: 1px solid #ddd; padding: 8px;">${price}</td>
        </tr>
        <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Payment Method</th>
        <td style="border: 1px solid #ddd; padding: 8px;">${paymentMethod}</td>
        </tr>
        <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Delivery Charge</th>
        <td style="border: 1px solid #ddd; padding: 8px;">${deliveryCharge}</td>
        </tr>
        <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Order Date</th>
        <td style="border: 1px solid #ddd; padding: 8px;">${orderDate}</td>
        </tr>
        <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Phone</th>
        <td style="border: 1px solid #ddd; padding: 8px;">${customerInfo.phone}</td>
        </tr>
        <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Address</th>
        <td style="border: 1px solid #ddd; padding: 8px;">${customerInfo.address}</td>
        </tr>
        <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Division</th>
        <td style="border: 1px solid #ddd; padding: 8px;">${customerInfo.division}</td>
        </tr>
        <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">District</th>
        <td style="border: 1px solid #ddd; padding: 8px;">${customerInfo.district}</td>
        </tr>
        <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Upazila</th>
        <td style="border: 1px solid #ddd; padding: 8px;">${customerInfo.upazila}</td>
        </tr>
      </table>
      <p>If you have any questions or concerns, please feel free to contact our support team.</p>
      <p>Thank you for shopping with us!</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 0.9em; color: #777;">This is an automated email. Please do not reply to this email.</p>
      </div>
    `,
      };
      try {
        const emailResponse = await sendEmail(emailPayload);
        return res.send({
          message: "Email sent successfully!",
          status: 200,
        });
      } catch (e) {
        console.log("Error sending email:", e);
      }
    }
    res.send(result);
    console.log(req.body);
  } catch (e) {
    console.error("Error updating delivery status:", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = {
  updateDeliveryStatus,
};
