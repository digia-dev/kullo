import { test, expect } from "@playwright/test";

const MARKETING = [
  "/",
  "/produk",
  "/solusi",
  "/harga",
  "/sumber-daya",
  "/tentang",
  "/dukungan",
  "/privasi",
  "/ketentuan",
  "/daftar",
  "/gabung",
  "/masuk",
];

const APP = [
  "/app/dashboard",
  "/app/my-work",
  "/app/tasks",
  "/app/projects",
  "/app/calendar",
  "/app/teams",
  "/app/chat",
  "/app/documents",
  "/app/requests",
  "/app/approvals",
  "/app/reports",
  "/app/settings/profile",
  "/app/settings/organization",
  "/app/settings/members",
  "/app/settings/departments",
  "/app/settings/roles",
  "/app/settings/notifications",
  "/app/settings/integrations",
];

test.describe("health", () => {
  test("GET /api/health returns ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.service).toBe("kullo");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    expect(res.headers()["x-frame-options"]).toBe("DENY");
  });
});

test.describe("marketing pages", () => {
  for (const route of MARKETING) {
    test(`${route} responds 200`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
    });
  }

  test("homepage shows hero and Kullo branding", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Kullo/i);
    await expect(page.locator(".market-h1").first()).toBeVisible();
  });

  test("pricing page is honest about undisclosed prices", async ({ page }) => {
    await page.goto("/harga");
    await expect(page.getByText(/belum ditetapkan/i).first()).toBeVisible();
    await expect(page.getByText(/hubungi tim/i).first()).toBeVisible();
    await expect(page.getByText(/Rp\s?\d/i)).toHaveCount(0);
  });

  test("auth pages render without marketing chrome", async ({ page }) => {
    await page.goto("/masuk");
    await expect(page.locator(".masthead")).toHaveCount(0);
    await expect(page.locator(".footer")).toHaveCount(0);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("header feature menu shows every module", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Lihat fitur" }).click();
    await expect(page.locator(".feature-menu")).toBeVisible();
    await expect(page.locator(".feature-link")).toHaveCount(16);
    await expect(page.locator(".feature-icon svg")).toHaveCount(16);
  });

  test("home device stage is visible on desktop and phone", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".device-stage")).toBeVisible();
    await expect(page.locator(".macbook")).toBeVisible();
    await expect(page.locator(".phone-mock")).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await expect(page.locator(".macbook")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test("hero CTA leads to sign up", async ({ page }) => {
    await page.goto("/");
    const cta = page.locator(".hero-slide-copy .btn").first();
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/daftar|\/gabung|\/masuk|\/app/);
  });
});

test.describe("auth gate", () => {
  for (const route of APP) {
    test(`${route} redirects guests to /masuk`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/masuk/);
    });
  }

  test("unknown route shows the 404 page", async ({ page }) => {
    const res = await page.goto("/halaman-tidak-ada");
    expect(res?.status()).toBe(404);
  });
});

test.describe("F08 sign in / out", () => {
  test("seed account reaches the dashboard, then signs out", async ({ page }) => {
    await page.goto("/masuk");
    await page.fill('input[name="email"]', "alya@nusantara.id");
    await page.fill('input[name="password"]', "kullo123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    await page.click('[aria-label="Keluar"]');
    await expect(page).toHaveURL(/\/(masuk)?$/, { timeout: 15_000 });
    await expect(page.getByRole("link", { name: /masuk/i }).first()).toBeVisible();
  });

  test("wrong password stays on sign-in with an error", async ({ page }) => {
    await page.goto("/masuk");
    await page.fill('input[name="email"]', "alya@nusantara.id");
    await page.fill('input[name="password"]', "salah-sandi");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/masuk/);
    await expect(page.getByText(/email atau kata sandi/i).first()).toBeVisible();
  });
});

test.describe("product shell after login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/masuk");
    await page.fill('input[name="email"]', "alya@nusantara.id");
    await page.fill('input[name="password"]', "kullo123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 15_000 });
  });

  test("core screens render with the app shell", async ({ page }) => {
    for (const route of ["/app/tasks", "/app/projects", "/app/chat", "/app/reports"]) {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("complementary", { name: /navigasi aplikasi/i })).toBeVisible();
    }
  });

  test("search is closed to guests", async ({ request }) => {
    const res = await request.get("/api/search?q=tugas");
    expect(res.status()).toBe(401);
  });

  test("global search endpoint answers for the signed-in user", async ({ page }) => {
    const res = await page.request.get("/api/search?q=tugas");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.results ?? body)).toBe(true);
  });
});
