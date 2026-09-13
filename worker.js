// MINGKA_SEO_DOMAIN_V8
// 새 공식 도메인(mingka.tcflick.com)을 기준으로 robots/sitemap과 HTML의 SEO 주소를 통일합니다.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "carpick-korea.carpick.workers.dev") {
      const newUrl = `https://mingka.tcflick.com${url.pathname}${url.search}`;
      return Response.redirect(newUrl, 301);
    }
    if (url.pathname === "/robots.txt") {
      const robots = "User-agent: Yeti\nAllow: /\n\n" + "User-agent: *\nAllow: /\n\n" + "Sitemap: https://mingka.tcflick.com/sitemap.xml\n";
      return new Response(robots, {status:200,headers:{"Content-Type":"text/plain; charset=UTF-8","Cache-Control":"no-store, no-cache, must-revalidate, max-age=0"}});
    }
    if (url.pathname === "/sitemap.xml") {
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://mingka.tcflick.com/</loc><lastmod>2026-09-13</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
<url><loc>https://mingka.tcflick.com/long-term-rental-vs-lease.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/car-purchase-vs-rental.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/long-term-rental-guide.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/car-lease-guide.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/long-term-rental-cost-guide.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/car-buying-checklist.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/lease-contract-checklist.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/initial-car-cost.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/car-mileage-guide.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/car-maintenance-insurance.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/early-termination-guide.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/car-lease-end.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/contact.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
<url><loc>https://mingka.tcflick.com/privacy.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
<url><loc>https://mingka.tcflick.com/terms.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
<url><loc>https://mingka.tcflick.com/affiliate.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
</urlset>`;
      return new Response(sitemap,{status:200,headers:{"Content-Type":"application/xml; charset=UTF-8","Cache-Control":"no-store, no-cache, must-revalidate, max-age=0"}});
    }
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;
    let html = await response.text();

    // 네이버 서치어드바이저에서 발급한 최신 사이트 소유확인 태그를 실제 응답 HTML에 적용합니다.
    html = html.replace(/<meta\s+name=["']naver-site-verification["'][^>]*>/i, '<meta name="naver-site-verification" content="664bd9e0eaf277369ff1c6ce3f62e8e804c13f5f" />');

    html = html.replaceAll("https://carpick-korea.carpick.workers.dev","https://mingka.tcflick.com");
    const canonicalTag = '<!-- Google에게 이 페이지의 대표 주소가 새 MINGKA 도메인임을 알려줌 -->\n<link rel="canonical" href="https://mingka.tcflick.com/" />';
    if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
      html = html.replace(/<!-- Google에게 이 페이지의 대표 주소가 새 MINGKA 도메인임을 알려줌 -->\s*<link\s+rel=["']canonical["'][^>]*>/i, canonicalTag);
      html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonicalTag);
    } else {
      html = html.replace(/<head>/i, `<head>\n${canonicalTag}`);
    }

    // 내가 사용하는 브라우저만 GA4에서 제외할 수 있도록 내부 방문 플래그를 지원합니다.
    html = html.replace(/gtag\(['"]config['"],\s*['"]G-06DTYM04S2['"]\);/i,
      `if (localStorage.getItem("mingka_internal") !== "1") { gtag("config", "G-06DTYM04S2"); }`);
    html = html.replace(/<head>/i,
      `<head>\n<script>if(new URLSearchParams(location.search).get("internal")==="1"){localStorage.setItem("mingka_internal","1");}</script>`);

    // 광고는 상단 1개, 설문조사 바로 아래 1개, 하단 1개로 분산합니다.
    const adStyle = `
<style>
.mingka-ad-slot{width:100%;min-height:90px;margin:18px 0;padding:10px;display:flex;align-items:center;justify-content:center;border:1px dashed #ddd8e8;border-radius:14px;background:#faf9fc;overflow:hidden;box-sizing:border-box}
.mingka-ad-slot::before{content:"광고 영역";font-size:11px;color:#aaa;letter-spacing:.05em}
.mingka-ad-large{min-height:250px}
@media(max-width:600px){.mingka-ad-slot{min-height:70px;margin:14px 0}.mingka-ad-large{min-height:180px}}
</style>`;
    const topAd = `<div id="mingkaAdTop" class="mingka-ad-slot" data-ad-position="top"></div>`;
    const middleAd = `<div id="mingkaAdMiddle" class="mingka-ad-slot mingka-ad-large" data-ad-position="middle"></div>`;
    const bottomAd = `<div id="mingkaAdBottom" class="mingka-ad-slot" data-ad-position="bottom"></div>`;

    html = html.replace(/<body([^>]*)>/i, `<body$1>${adStyle}${topAd}`);
    if (/<section\s+id=["']quiz["'][\s\S]*?<\/section>/i.test(html)) {
      html = html.replace(/(<section\s+id=["']quiz["'][\s\S]*?<\/section>)/i, `$1\n${middleAd}`);
    }

    const footer = `
<footer class="mingka-footer">
  <div class="mingka-footer-brand">밍카</div>
  <nav aria-label="사이트 정보">
    <a href="/terms.html">이용약관</a>
    <span> | </span>
    <a href="/privacy.html">개인정보처리방침</a>
    <span> | </span>
    <span>문의하기</span>
  </nav>
  <div class="mingka-footer-copy">© 2026 밍카. All rights reserved.</div>
</footer>
<style>
.mingka-footer{margin-top:40px;padding:28px 20px 34px;border-top:1px solid #eeeaf3;background:#faf9fc;text-align:center;color:#999;font-size:12px;line-height:1.8}
.mingka-footer-brand{margin-bottom:5px;color:#7567e8;font-size:16px;font-weight:900}
.mingka-footer nav{margin-bottom:8px}
.mingka-footer nav a{color:#777;text-decoration:none}
.mingka-footer nav a:hover{text-decoration:underline}
.mingka-footer-copy{color:#aaa;font-size:11px}
</style>`;
    const updatedHtml = html.replace(/<footer>/i, `${bottomAd}\n${footer}`);
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    return new Response(updatedHtml,{status:response.status,statusText:response.statusText,headers});
  }
};
