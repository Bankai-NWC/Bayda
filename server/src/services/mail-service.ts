import nodemailer from 'nodemailer';

import { ApiError } from '../middlewares/error-middleware.js';
import { generateOtpTable } from '../utils/generateOtpTable.js';

class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    });
  }

  async sendActivateMailLink(to: string, link: string, name: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER!,
        to,
        subject: 'Account activation on BAYDA',
        text: `Click the link to activate your account: ${link}`,
        html: `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f7;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center">

      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">

        <tr>
          <td align="center" style="padding:30px 20px;background:#111;color:#ffffff;">
            <a href=${process.env.CLIENT_URL!} style="margin:0;font-size:24px; text-decoration: none; color: #fff; font-weight: 700">BAYDA</a>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 30px;color:#333333;font-size:16px;line-height:1.6;">
            
            <h2 style="margin-top:0;font-size:20px;">
              Activate your account
            </h2>

            <p>
              Hi, ${name}!
            </p>

            <p>
              Thanks for signing up. Please confirm your email address by clicking the button below.
            </p>

            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:30px auto;">
              <tr>
                <td align="center" bgcolor="#000000"">
                  <a 
                    href="${link}" 
                    style="
                      display:inline-block;
                      padding:14px 28px;
                      font-size:16px;
                      color:#ffffff;
                      text-decoration:none;
                      font-weight:bold;
                      font-family:Arial,Helvetica,sans-serif;
                    "
                  >
                    Activate account
                  </a>
                </td>
              </tr>
            </table>

            <p>
              Or copy and paste this link into your browser:
            </p>

            <p style="word-break:break-all;color:#635bff;">
              ${link}
            </p>

            <p style="margin-top:30px;font-size:14px;color:#666;">
              If you didn’t create an account, you can safely ignore this email.
            </p>

          </td>
        </tr>

        <tr>
          <td align="center" style="padding:20px;color:#999;font-size:12px;border-top:1px solid #eee;">
            © ${new Date().getFullYear()} BAYDA. All rights reserved.
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
      `,
      });
    } catch (err) {
      throw ApiError.Internal('Email delivery failed', err);
    }
  }

  async sendOtpCode(to: string, name: string, otp: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER!,
        to,
        subject: 'Password Reset Code',
        text: `Your code: ${otp}`,
        html: `
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#f4f4f7;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
    <tr>
        <td align="center">

            <table width="600" cellpadding="0" cellspacing="0" border="0"
                style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">

                <tr>
                  <td align="center" style="padding:30px 20px;background:#111;color:#ffffff;">
                    <a href=${process.env.CLIENT_URL!} style="margin:0;font-size:24px; text-decoration: none; color: #fff; font-weight: 700">BAYDA</a>
                  </td>
                </tr>

                <tr>
                    <td style="padding:40px 30px;color:#333333;font-size:16px;line-height:1.6;">

                        <h2 style="margin-top:0;font-size:20px;">
                            Reset your password
                        </h2>

                        <p>
                          Hi, ${name}!
                        </p>

                        <p>
                            We received a request to reset the password for your BAYDA account.
                        </p>

                        <p>
                            Enter the verification code below to create a new password:
                        </p>

                        <p style="text-align:center;font-size:14px;color:#888;margin-bottom:10px;">
                            Your verification code
                        </p>

                        ${generateOtpTable(otp)}

                        <p style="margin-top:20px;">
                            This code will expire in 15 minutes.
                        </p>

                        <p style="margin-top:30px;font-size:14px;color:#666;">
                            If you didn’t request a password reset, you can safely ignore this email. Your password will
                            not be changed.
                        </p>

                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding:20px;color:#999;font-size:12px;border-top:1px solid #eee;">
                        © ${new Date().getFullYear()} BAYDA. All rights reserved.
                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>
        `,
      });
    } catch (err) {
      throw ApiError.Internal('Email delivery failed', err);
    }
  }
}

export default new MailService();
