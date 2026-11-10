import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { KulloLogo } from "./KulloMark";

type AuthShellProps = {
  formTitle: string;
  formDescription: string;
  leftIllustration: string;
  rightIllustration: string;
  demo?: { email: string; password: string; organization: string };
  children: React.ReactNode;
};

const ILLUSTRATION_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "/illustrations/auth-secure-login-hero.svg": { width: 793, height: 552 },
  "/illustrations/auth-login-hero.svg": { width: 870, height: 520 },
  "/illustrations/auth-authentication-hero.svg": { width: 543, height: 634 },
};

const AUTH_ASSET_VERSION = "20261110-brand";

/**
 * Halaman auth layar penuh: tanpa header/footer marketing.
 * Komposisi mengikuti pola login bergaya aplikasi: logo di atas, kartu form
 * terpusat, ilustrasi 2D di sudut bawah, dan identitas brand di bawah kartu.
 */
export function AuthShell({
  formTitle,
  formDescription,
  leftIllustration,
  rightIllustration,
  demo,
  children,
}: AuthShellProps) {
  const leftSize = ILLUSTRATION_DIMENSIONS[leftIllustration] ?? { width: 870, height: 520 };
  const rightSize = ILLUSTRATION_DIMENSIONS[rightIllustration] ?? { width: 543, height: 634 };

  return (
    <div className="auth-page">
      <div className="auth-corner auth-corner-left" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${leftIllustration}?v=${AUTH_ASSET_VERSION}`} alt="" width={leftSize.width} height={leftSize.height} />
      </div>
      <div className="auth-corner auth-corner-right" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${rightIllustration}?v=${AUTH_ASSET_VERSION}`} alt="" width={rightSize.width} height={rightSize.height} />
      </div>

      <main className="auth-main" id="konten">
        <div className="auth-brand">
          <KulloLogo size={38} wordSize={26} />
        </div>

        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-heading">
            <h1 id="auth-title" className="auth-form-title">
              {formTitle}
            </h1>
            <p className="auth-form-desc">{formDescription}</p>
          </div>

          {children}

          <p className="auth-help-link">
            <Link href="/dukungan">Butuh bantuan untuk masuk?</Link>
          </p>

          {demo && (
            <div className="auth-demo">
              <div className="auth-demo-head">
                <LockKeyhole size={14} aria-hidden />
                <strong>Akun demo</strong>
              </div>
              <p>
                Email <code>{demo.email}</code>
                <br />
                Kata sandi <code>{demo.password}</code>
              </p>
              <p className="help">Organisasi {demo.organization}. Data contoh sudah terisi.</p>
            </div>
          )}
        </section>

        <div className="auth-footer-brand">
          <KulloLogo size={18} wordSize={16} />
          <p>
            Satu akun untuk proyek, tugas, chat, dan dokumen.{" "}
            <Link href="/produk">Pelajari Kullo</Link>
          </p>
        </div>

        <p className="auth-panel-foot">
          © 2026 Kullo · <Link href="/ketentuan">Ketentuan</Link> ·{" "}
          <Link href="/privasi">Privasi</Link> · <Link href="/dukungan">Dukungan</Link>
        </p>
      </main>
    </div>
  );
}
