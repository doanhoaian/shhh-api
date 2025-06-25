require("dotenv").config();
const sesClient = require('../configs/aws');
const { SendEmailCommand } = require('@aws-sdk/client-ses');
const createError = require('./createError');

const APP_NAME = "C.A.M.P.U.S";
const FROM_EMAIL = "C.A.M.P.U.S <no-reply@dihaver.tech>";

function getEmailSubject(type) {
    switch (type) {
        case "verify_email":
            return "Xác thực email - Ứng dụng C.A.M.P.U.S";
        case "2fa_login":
            return "Mã đăng nhập 2 bước - C.A.M.P.U.S";
        case "reset_password":
            return "Yêu cầu đổi mật khẩu - C.A.M.P.U.S";
        default:
            return "Mã xác thực OTP - C.A.M.P.U.S";
    }
}

function getEmailIntro(type) {
    switch (type) {
        case "verify_email":
            return `Đây là mã OTP để xác thực email của bạn trong ứng dụng <strong>${APP_NAME}</strong>:`;
        case "2fa_login":
            return `Đây là mã OTP đăng nhập 2 bước vào ứng dụng <strong>${APP_NAME}</strong>:`;
        case "reset_password":
            return `Bạn đã yêu cầu đổi mật khẩu trên ứng dụng <strong>${APP_NAME}</strong>. Đây là mã xác thực:`;
        default:
            return `Đây là mã OTP cho thao tác bạn vừa thực hiện trên <strong>${APP_NAME}</strong>:`;
    }
}

function buildEmailHtml({ otp, type }) {
    const intro = getEmailIntro(type);

    return `
    <div style="padding:40px;font-family:Arial,sans-serif">
    <div style="max-width:480px;margin:0 auto;background-color:#fff;border-radius:26px;box-shadow:0 8px 24px rgba(0,0,0,.12);overflow:hidden;border:2px solid transparent;background-image:linear-gradient(#fff,#fff),linear-gradient(45deg,transparent 0,#3b82f6 50%,transparent 100%);background-origin:border-box;background-clip:padding-box,border-box">
        <div style="padding:20px;text-align:center">
        <h2 style="color:#111827;margin-bottom:12px">Chào bạn!</h2>
        <p style="color:#4b5563;font-size:16px;margin-bottom:24px">${intro}</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:6px;margin:20px 0;color:#111827">${otp}</div>
        <p style="color:#4b5563;font-size:15px">Mã có hiệu lực trong <strong>5 phút</strong>. Đừng chia sẻ với ai nha. </p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb">
        <p style="font-size:13px;color:#9ca3af">Nếu bạn không yêu cầu mã này, hãy bỏ qua email.</p>
        <p style="font-size:12px;color:#9ca3af">© Dihaver Tech 2023 - 2025</p>
        </div>
    </div>
    </div>
    `;
}

exports.sendOtpEmail = async ({ email, otp, type }) => {
    const html = buildEmailHtml({ otp, type });
    const subject = getEmailSubject(type);

    const params = {
        Destination: {
            ToAddresses: [email],
        },
        Message: {
            Body: {
                Html: { Charset: "UTF-8", Data: html },
            },
            Subject: { Charset: "UTF-8", Data: subject },
        },
        Source: FROM_EMAIL,
    };

    try {
        const command = new SendEmailCommand(params);
        await sesClient.send(command);
    } catch (err) {
        if (process.env.NODE_ENV === 'dev') {
            console.error("Error sending SES email:", err);
        }
        throw createError(500, "Không gửi được email xác thực");
    }
};