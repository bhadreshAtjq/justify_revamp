import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(email: string, name: string, password: string) {
  const loginUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login`;
  
  const mailOptions = {
    from: `"JustifAI Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "🔐 Your JustifAI Verifier Credentials",
    text: `Welcome to JustifAI, ${name}!\n\nYour verifier account has been created successfully.\n\nEmail: ${email}\nTemporary Password: ${password}\n\nSign in here: ${loginUrl}\n\nPlease change your password after your first login for security reasons.\n\nJustifAI Blockchain Verification System`,
    html: `
      <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 550px; margin: 40px auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #393E46; font-size: 24px; margin: 0; letter-spacing: -0.5px;">JustifAI</h1>
          <p style="color: #929AAB; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Verification Portal</p>
        </div>
        
        <h2 style="color: #222831; font-size: 20px; font-weight: 700;">Welcome, ${name}!</h2>
        <p style="color: #393E46; line-height: 1.6; font-size: 15px;">Your digital verifier credentials have been generated. You can now access the blockchain audit network to validate institutional documents.</p>
        
        <div style="background: #F7F7F7; padding: 30px; border-radius: 12px; margin: 30px 0; border: 1px solid rgba(0,0,0,0.02);">
          <div style="margin-bottom: 20px;">
            <p style="margin: 0; font-size: 12px; font-weight: 700; color: #929AAB; text-transform: uppercase; letter-spacing: 1px;">Access ID</p>
            <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 16px; color: #393E46;">${email}</p>
          </div>
          
          <div>
            <p style="margin: 0; font-size: 12px; font-weight: 700; color: #929AAB; text-transform: uppercase; letter-spacing: 1px;">Security Key</p>
            <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 16px; color: #393E46;">${password}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 40px 0 20px;">
          <a href="${loginUrl}" style="background: #393E46; color: #FFFFFF; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">Launch Dashboard</a>
        </div>
        
        <p style="color: #929AAB; font-size: 13px; text-align: center; margin-top: 30px;">For your protection, please update your temporary password upon first entry.</p>
        
        <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 40px 0;" />
        <p style="font-size: 11px; color: #929AAB; text-align: center; letter-spacing: 0.5px;">&copy; 2024 JustifAI &nbsp; · &nbsp; Blockchain Excellence</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
