import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import worker from "../worker.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://mingka.tcflick.com";

// Cloudflare assets.html_handling="none"에 대응하는 간단한 정적 자산 모형.
const env = {
  ASSETS: {
    async fetch(input) {
      const pathname = new URL(input instanceof URL ? input.href :
        typeof input === "string" ? input : input.url).pathname;
      const file = pathname.slice(1);
      if (!file || file.includes("/") || file.startsWith(".")) {
        return new Response("Not found", { status: 404 });
      }
      try {
        const body = await readFile(path.join(root, file));
        const type = file.endsWith(".html") ? "text/html; charset=UTF-8" :
          file.endsWith(".xml") ? "application/xml; charset=UTF-8" : "text/plain";
        return new Response(body, { status: 200, headers: { "content-type": type } });
      } catch (error) {
        if (error.code === "ENOENT") return new Response("Not found", { status: 404 });
        throw error;
      }
    }
  }
};

const fetchPage = (pathname) => worker.fetch(new Request(`${origin}${pathname}`), env);

test("Cloudflare의 .html 자동 307 리디렉션을 비활성화한다", async () => {
  const config = JSON.parse(await readFile(path.join(root, "wrangler.jsonc"), "utf8"));
  assert.equal(config.assets.html_handling, "none");
  assert.equal(config.assets.run_worker_first, true);
});

test("정적 자산이 /를 404로 반환해도 Worker가 홈페이지를 제공한다", async () => {
  const directAsset = await env.ASSETS.fetch(new URL(`${origin}/`));
  assert.equal(directAsset.status, 404);
  const home = await fetchPage("/");
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.ok(html.includes(`<link rel="canonical" href="${origin}/"`));
  assert.ok(html.includes("MINGKA"));
});

test("사이트맵의 모든 주소가 실제 HTML 및 자체 canonical에 연결된다", async () => {
  const sitemapResponse = await fetchPage("/sitemap.xml");
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(new Set(urls).size, urls.length, "사이트맵 URL이 중복되었습니다");

  const htmlFiles = (await readdir(root)).filter((file) =>
    file.endsWith(".html") && file !== "404.html" && !file.startsWith("google")
  );
  assert.equal(urls.length, htmlFiles.length);

  const home = await (await fetchPage("/")).text();
  for (const url of urls) {
    assert.ok(url.startsWith(`${origin}/`), `다른 도메인 주소: ${url}`);
    const pathname = new URL(url).pathname;
    const response = await fetchPage(pathname);
    assert.equal(response.status, 200, `${pathname}가 HTTP 200이 아닙니다`);
    const html = await response.text();
    assert.ok(html.includes(`<link rel="canonical" href="${url}"`), `${pathname}의 canonical 불일치`);
    if (pathname !== "/") {
      assert.ok(home.includes(`href="${pathname}"`) || home.includes(`href="${pathname.slice(1)}"`),
        `${pathname}가 홈페이지에서 연결되지 않습니다`);
    }
  }
});

test("과거 확장자 없는 주소는 301로 공식 .html 주소를 가리킨다", async () => {
  const redirect = await fetchPage("/car-buying-checklist?src=old");
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get("location"), `${origin}/car-buying-checklist.html?src=old`);
  const index = await fetchPage("/index.html");
  assert.equal(index.status, 301);
  assert.equal(index.headers.get("location"), `${origin}/`);
  const cleanIndex = await fetchPage("/index");
  assert.equal(cleanIndex.status, 301);
  assert.equal(cleanIndex.headers.get("location"), `${origin}/`);
});

test("존재하지 않는 주소는 색인 가능한 HTML 200으로 바뀌지 않는다", async () => {
  assert.equal((await fetchPage("/not-a-page")).status, 404);
  assert.equal((await fetchPage("/not-a-page.html")).status, 404);
});
