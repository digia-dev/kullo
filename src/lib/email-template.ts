function esc(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Branded transactional email. Table layout and inline styles only, because
 * email clients strip <style> and modern layout primitives.
 */
export function renderDemoAccessEmail(input: {
  name: string;
  company: string;
  email: string;
  password: string;
  loginUrl: string;
  magicUrl: string;
}) {
  const name = esc(input.name);
  const company = esc(input.company);
  const email = esc(input.email);
  const password = esc(input.password);
  const loginUrl = esc(input.loginUrl);
  const magicUrl = esc(input.magicUrl);

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Akses demo Kullo siap</title>
</head>
<body style="margin:0;padding:0;background:#f3f2f1;color:#201f1e;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Akses demo Kullo untuk ${company} sudah aktif. Kredensial masuk ada di dalam.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f2f1;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e1dfdd;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;border-bottom:1px solid #e1dfdd;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width:34px;height:34px;background:#0f6cbd;border-radius:8px;color:#ffffff;font-size:20px;font-weight:700;text-align:center;vertical-align:middle;">K</td>
                  <td style="padding-left:10px;font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#201f1e;">Kullo</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 8px;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0f6cbd;font-weight:700;">Demo disetujui</p>
              <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;color:#201f1e;">Ruang kerja ${company} sudah siap</h1>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#605e5c;">Halo ${name}, permintaan demo Anda sudah kami verifikasi. Anda bisa masuk dengan tautan sekali klik atau memakai kredensial di bawah.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f2f1;border:1px solid #e1dfdd;border-radius:10px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#605e5c;font-weight:700;">Kredensial demo</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#201f1e;">Email <span style="font-family:Consolas,Menlo,monospace;background:#ffffff;border:1px solid #e1dfdd;border-radius:4px;padding:2px 6px;">${email}</span></p>
                    <p style="margin:0;font-size:14px;color:#201f1e;">Kata sandi <span style="font-family:Consolas,Menlo,monospace;background:#ffffff;border:1px solid #e1dfdd;border-radius:4px;padding:2px 6px;">${password}</span></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 28px 8px;" align="left">
              <a href="${loginUrl}" style="display:inline-block;background:#0f6cbd;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 20px;border-radius:6px;">Masuk ke Kullo</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;">
              <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:#605e5c;">Atau gunakan tautan langsung ini:</p>
              <p style="margin:0;font-size:13px;line-height:1.5;word-break:break-all;"><a href="${magicUrl}" style="color:#0f6cbd;">${magicUrl}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;background:#faf9f8;border-top:1px solid #e1dfdd;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#605e5c;">Tautan dan kata sandi ini bersifat rahasia. Jangan teruskan ke orang lain. Butuh bantuan? Balas email ini atau buka <a href="${loginUrl.replace(/\/masuk$/, "/dukungan")}" style="color:#0f6cbd;">dukungan Kullo</a>.</p>
              <p style="margin:8px 0 0;font-size:12px;color:#8a8886;">© 2026 Kullo · Ketentuan · Privasi</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderAccessEmail(input: {
  title: string;
  intro: string;
  company: string;
  ctaLabel: string;
  ctaUrl: string;
  footnote?: string;
}) {
  const title = esc(input.title);
  const intro = esc(input.intro);
  const company = esc(input.company);
  const ctaLabel = esc(input.ctaLabel);
  const ctaUrl = esc(input.ctaUrl);
  const footnote = input.footnote ? esc(input.footnote) : "";

  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f3f2f1;color:#201f1e;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f2f1;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e1dfdd;border-radius:12px;">
        <tr><td style="padding:24px 28px;border-bottom:1px solid #e1dfdd;">
          <span style="display:inline-block;width:34px;height:34px;background:#0f6cbd;border-radius:8px;color:#ffffff;font-size:20px;font-weight:700;text-align:center;line-height:34px;">K</span>
          <span style="padding-left:10px;font-size:22px;font-weight:700;">Kullo</span>
        </td></tr>
        <tr><td style="padding:30px 28px 12px;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0f6cbd;font-weight:700;">${company}</p>
          <h1 style="margin:0 0 12px;font-size:25px;line-height:1.25;">${title}</h1>
          <p style="margin:0;font-size:15px;line-height:1.6;color:#605e5c;">${intro}</p>
        </td></tr>
        <tr><td style="padding:16px 28px 26px;">
          <a href="${ctaUrl}" style="display:inline-block;background:#0f6cbd;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 20px;border-radius:6px;">${ctaLabel}</a>
        </td></tr>
        <tr><td style="padding:16px 28px;background:#faf9f8;border-top:1px solid #e1dfdd;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#605e5c;">${footnote || "Jika tombol tidak berfungsi, salin tautan ini ke browser:"}</p>
          <p style="margin:6px 0 0;font-size:12px;word-break:break-all;"><a href="${ctaUrl}" style="color:#0f6cbd;">${ctaUrl}</a></p>
          <p style="margin:10px 0 0;font-size:12px;color:#8a8886;">© 2026 Kullo · Ketentuan · Privasi</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
