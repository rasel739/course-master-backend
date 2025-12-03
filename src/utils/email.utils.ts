// src/utils/emailService.ts
import nodemailer, { Transporter } from 'nodemailer';
import { google } from 'googleapis';
import config from '../config';

let transporter: Transporter | null = null;

export const initEmailService = async () => {
  try {
    const {
      email_user,
      google_client_id,
      google_client_secret,
      google_refresh_token,
    } = config.email;

    if (!google_client_id || !google_client_secret || !google_refresh_token) {
      console.warn('⚠️ Email service is disabled: Missing OAuth2 env vars');
      return;
    }

    const oAuth2Client = new google.auth.OAuth2(
      google_client_id,
      google_client_secret,
      'https://developers.google.com/oauthplayground',
    );

    oAuth2Client.setCredentials({ refresh_token: google_refresh_token });

    // Generate Access Token
    const accessToken = await oAuth2Client.getAccessToken();

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: email_user,
        clientId: google_client_id,
        clientSecret: google_client_secret,
        refreshToken: google_refresh_token,
        accessToken: accessToken.token || '',
      },
    });

    console.log('📧 Email Service Initialized Successfully');
  } catch (error) {
    console.error('❌ Email init error:', error);
  }
};

export const sendEmail = async (email: string, name: string) => {
  if (!transporter) {
    console.warn('⚠️ Cannot send email — Email service is disabled.');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"CourseMaster" <${email}>`,
      to: email,
      subject: 'Welcome to CourseMaster!',
      html: `
        <h2>Hello ${name} 👋</h2>
        <p>Welcome to CourseMaster — grow your skills with us!</p>
      `,
    });

    console.log('📨 Welcome email sent:', email);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};
