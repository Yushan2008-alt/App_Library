import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

export async function sendRegistrationVerificationEmail(to: string, name: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

  try {
    await resend.emails.send({
      from,
      to,
      subject: 'Verifikasi Akun — App-Library',
      html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#0B1A38;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B1A38;padding:40px 20px;">
          <tr><td align="center">
            <table width="500" cellpadding="0" cellspacing="0" style="background:#162236;border-radius:16px;border:1px solid rgba(79,156,249,0.2);overflow:hidden;">
              <tr>
                <td style="background:linear-gradient(135deg,#4F9CF9,#2563eb);padding:32px;text-align:center;">
                  <div style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                    <span style="font-size:28px;">✉️</span>
                  </div>
                  <h1 style="margin:0;color:white;font-size:22px;font-weight:700;">Verifikasi Akun Kamu</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <p style="color:#F0F4FF;font-size:15px;margin:0 0 12px;">Halo, <strong>${name}</strong>!</p>
                  <p style="color:#8899BB;font-size:14px;line-height:1.6;margin:0 0 24px;">
                    Terima kasih telah mendaftar di App-Library! Klik tombol di bawah untuk memverifikasi alamat email kamu dan mengaktifkan akun.
                  </p>
                  <div style="text-align:center;margin:28px 0;">
                    <a href="${verifyUrl}"
                      style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#4F9CF9,#2563eb);color:white;font-weight:600;font-size:15px;border-radius:50px;text-decoration:none;box-shadow:0 0 24px rgba(79,156,249,0.4);">
                      Verifikasi Email Saya
                    </a>
                  </div>
                  <p style="color:#8899BB;font-size:13px;margin:0 0 8px;">
                    Link ini akan kedaluwarsa dalam <strong style="color:#4F9CF9;">24 jam</strong>.
                  </p>
                  <p style="color:#8899BB;font-size:13px;margin:0;">
                    Jika kamu tidak mendaftar, abaikan email ini.
                  </p>
                  <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:24px 0;">
                  <p style="color:#556677;font-size:12px;margin:0;text-align:center;">App-Library © ${new Date().getFullYear()}</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
    })
  } catch (err) {
    console.error('[Email] sendRegistrationVerificationEmail failed:', err)
  }
}

export async function sendPasswordChangeEmail(to: string, name: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/user/settings/verify?token=${token}&type=password`

  try {
    await resend.emails.send({
      from,
      to,
      subject: 'Verifikasi Perubahan Password — App-Library',
      html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#0B1A38;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B1A38;padding:40px 20px;">
          <tr><td align="center">
            <table width="500" cellpadding="0" cellspacing="0" style="background:#162236;border-radius:16px;border:1px solid rgba(79,156,249,0.2);overflow:hidden;">
              <tr>
                <td style="background:linear-gradient(135deg,#4F9CF9,#7B5EA7);padding:32px;text-align:center;">
                  <div style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                    <span style="font-size:28px;">🔐</span>
                  </div>
                  <h1 style="margin:0;color:white;font-size:22px;font-weight:700;">Verifikasi Perubahan Password</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <p style="color:#F0F4FF;font-size:15px;margin:0 0 12px;">Halo, <strong>${name}</strong>!</p>
                  <p style="color:#8899BB;font-size:14px;line-height:1.6;margin:0 0 24px;">
                    Kami menerima permintaan untuk mengubah password akun App-Library kamu.
                    Klik tombol di bawah untuk memverifikasi dan melanjutkan.
                  </p>
                  <div style="text-align:center;margin:28px 0;">
                    <a href="${verifyUrl}"
                      style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#4F9CF9,#2563eb);color:white;font-weight:600;font-size:15px;border-radius:50px;text-decoration:none;box-shadow:0 0 24px rgba(79,156,249,0.4);">
                      Konfirmasi Perubahan Password
                    </a>
                  </div>
                  <p style="color:#8899BB;font-size:13px;margin:0 0 8px;">
                    Link ini akan kedaluwarsa dalam <strong style="color:#4F9CF9;">10 menit</strong>.
                  </p>
                  <p style="color:#8899BB;font-size:13px;margin:0;">
                    Jika kamu tidak meminta perubahan ini, abaikan email ini. Password kamu tetap aman.
                  </p>
                  <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:24px 0;">
                  <p style="color:#556677;font-size:12px;margin:0;text-align:center;">App-Library © ${new Date().getFullYear()}</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
    })
  } catch (err) {
    console.error('[Email] sendPasswordChangeEmail failed:', err)
  }
}

export async function sendEmailChangeEmail(to: string, name: string, token: string, newEmail: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/user/settings/verify?token=${token}&type=email`

  try {
    await resend.emails.send({
      from,
      to,
      subject: 'Verifikasi Perubahan Email — App-Library',
      html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#0B1A38;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B1A38;padding:40px 20px;">
          <tr><td align="center">
            <table width="500" cellpadding="0" cellspacing="0" style="background:#162236;border-radius:16px;border:1px solid rgba(79,156,249,0.2);overflow:hidden;">
              <tr>
                <td style="background:linear-gradient(135deg,#7B5EA7,#4F9CF9);padding:32px;text-align:center;">
                  <div style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                    <span style="font-size:28px;">📧</span>
                  </div>
                  <h1 style="margin:0;color:white;font-size:22px;font-weight:700;">Verifikasi Perubahan Email</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <p style="color:#F0F4FF;font-size:15px;margin:0 0 12px;">Halo, <strong>${name}</strong>!</p>
                  <p style="color:#8899BB;font-size:14px;line-height:1.6;margin:0 0 8px;">
                    Kami menerima permintaan untuk mengubah email akun App-Library kamu ke:
                  </p>
                  <p style="color:#4F9CF9;font-size:15px;font-weight:600;margin:0 0 24px;background:rgba(79,156,249,0.08);padding:10px 16px;border-radius:8px;display:inline-block;">
                    ${newEmail}
                  </p>
                  <div style="text-align:center;margin:28px 0;">
                    <a href="${verifyUrl}"
                      style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#7B5EA7,#4F9CF9);color:white;font-weight:600;font-size:15px;border-radius:50px;text-decoration:none;box-shadow:0 0 24px rgba(123,94,167,0.4);">
                      Konfirmasi Perubahan Email
                    </a>
                  </div>
                  <p style="color:#8899BB;font-size:13px;margin:0 0 8px;">
                    Link ini akan kedaluwarsa dalam <strong style="color:#4F9CF9;">10 menit</strong>.
                  </p>
                  <p style="color:#8899BB;font-size:13px;margin:0;">
                    Jika kamu tidak meminta perubahan ini, abaikan email ini. Email kamu tetap aman.
                  </p>
                  <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:24px 0;">
                  <p style="color:#556677;font-size:12px;margin:0;text-align:center;">App-Library © ${new Date().getFullYear()}</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
    })
  } catch (err) {
    console.error('[Email] sendEmailChangeEmail failed:', err)
  }
}
