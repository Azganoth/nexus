import { env } from "$/config/env";
import { Resend } from "resend";

const FROM_EMAIL = "onboarding@resend.dev"; // Free sandbox

const resend = new Resend(env.RESEND_API_KEY);

const passwordResetEmailContent = (resetLink: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefina sua Senha</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    a { color: #8C60F2; text-decoration: none; }
    .button { background-color: #8C60F2; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
  </style>
</head>
<body>
  <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f7f7f7">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: 40px; text-align: center; font-size: 16px; line-height: 1.6; color: #333;">
              <a href="${env.APP_URL}" target="_blank">
                <img src="https://pub-f4942703ba94414ab97ca08e29bff222.r2.dev/nexus-logo-full.png" alt="Nexus Logo" width="179" height="64" style="border:0; max-width: 179px; margin: 0 auto 30px auto; display: block;">
              </a>
              <h1 style="font-size: 24px; font-weight: bold; color: #000; margin-top: 0; margin-bottom: 16px;">Redefina sua senha</h1>
              <p style="margin: 0 0 30px 0;">Uma solicitação foi recebida para redefinir a senha da sua conta Nexus. Clique no botão abaixo para criar uma nova senha.</p>
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 30px auto;">
                <tr>
                  <td align="center" bgcolor="#8C60F2" style="border-radius: 8px;">
                    <a href="${resetLink}" target="_blank" class="button">Redefinir Senha</a>
                  </td>
                </tr>
              </table>
              <p style="font-size: 12px; color: #666; line-height: 1.5;">
                Se o botão não funcionar, copie e cole o seguinte link no seu navegador:<br/>
                <a href="${resetLink}" target="_blank" style="color: #8C60F2; word-break: break-all;">${resetLink}</a>
              </p>
              <p style="font-size: 14px; margin-top: 30px;">Se você não fez esta solicitação, ignore este email.</p>
              <p style="margin-top: 40px; margin-bottom: 0;">Obrigado,<br>Nexus</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${env.APP_URL}/reset-password?token=${token}`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Redefina sua senha no Nexus",
      html: passwordResetEmailContent(resetLink),
    });

    if (error) {
      console.error("Failed to send password reset email:", error);
      return;
    }
  } catch (error) {
    console.error("An unexpected error occurred while sending email:", error);
  }
};
