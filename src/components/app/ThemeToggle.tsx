"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.appTheme === "dark" ? "dark" : "light");
  }, []);

  function apply(next: Theme) {
    document.documentElement.dataset.appTheme = next;
    try {
      localStorage.setItem("kullo:theme", next);
    } catch {
      /* private mode */
    }
    setTheme(next);
  }

  return (
    <section className="panel" aria-labelledby="theme-title">
      <div className="panel-head">
        <h2 className="panel-title" id="theme-title">Tampilan</h2>
      </div>
      <div className="panel-body theme-setting">
        <div>
          <strong style={{ fontSize: 13.5 }}>Mode terang atau gelap</strong>
          <p className="help" style={{ margin: "3px 0 0" }}>
            Berlaku untuk seluruh ruang kerja di peramban ini. Tema situs marketing tidak berubah.
          </p>
        </div>
        <div className="theme-switch" role="group" aria-label="Pilih tema tampilan">
          <button type="button" aria-pressed={theme === "light"} onClick={() => apply("light")}>
            <Sun size={15} aria-hidden /> Terang
          </button>
          <button type="button" aria-pressed={theme === "dark"} onClick={() => apply("dark")}>
            <Moon size={15} aria-hidden /> Gelap
          </button>
        </div>
      </div>
    </section>
  );
}
