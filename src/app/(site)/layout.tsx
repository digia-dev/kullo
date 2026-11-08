import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PromoBar } from "@/components/site/PromoBar";
import { BackToTop } from "@/components/site/BackToTop";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#konten" className="skip-link">
        Lompat ke konten
      </a>
      <PromoBar />
      <SiteHeader />
      <main id="konten">{children}</main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}

