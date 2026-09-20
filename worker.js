// MINGKA_SEO_DOMAIN_V12
// 공식 도메인 기준으로 robots/sitemap과 HTML SEO 주소를 통일하고 공통 푸터를 안전하게 구성합니다.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 이전 Worker 주소로 접속하면 새 공식 도메인으로 영구 이동합니다.
    if (url.hostname === "carpick-korea.carpick.workers.dev") {
      const newUrl = `https://mingka.tcflick.com${url.pathname}${url.search}`;
      return Response.redirect(newUrl, 301);
    }

    // 검색엔진이 수집할 수 있도록 robots.txt를 직접 제공합니다.
    if (url.pathname === "/robots.txt") {
      const robots = "User-agent: Yeti\nAllow: /\n\n" +
        "User-agent: *\nAllow: /\n\n" +
        "Sitemap: https://mingka.tcflick.com/sitemap.xml\n";
      return new Response(robots, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
        }
      });
    }

    // 검색엔진이 사용할 최신 사이트맵을 공식 도메인으로 직접 제공합니다.
    if (url.pathname === "/sitemap.xml") {
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://mingka.tcflick.com/</loc><lastmod>2026-09-16</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
<url><loc>https://mingka.tcflick.com/long-term-rental-vs-lease.html</loc><lastmod>2026-09-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/car-purchase-vs-rental.html</loc><lastmod>2026-09-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/long-term-rental-guide.html</loc><lastmod>2026-09-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/car-lease-guide.html</loc><lastmod>2026-09-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/long-term-rental-cost-guide.html</loc><lastmod>2026-09-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/car-buying-checklist.html</loc><lastmod>2026-09-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/lease-contract-checklist.html</loc><lastmod>2026-09-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/initial-car-cost.html</loc><lastmod>2026-09-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/car-mileage-guide.html</loc><lastmod>2026-09-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/car-maintenance-insurance.html</loc><lastmod>2026-09-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/early-termination-guide.html</loc><lastmod>2026-09-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/car-lease-end.html</loc><lastmod>2026-09-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://mingka.tcflick.com/contact.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
<url><loc>https://mingka.tcflick.com/privacy.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
<url><loc>https://mingka.tcflick.com/terms.html</loc><lastmod>2026-09-19</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
<url><loc>https://mingka.tcflick.com/affiliate.html</loc><lastmod>2026-09-13</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
</urlset>`;
      return new Response(sitemap, {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=UTF-8",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
        }
      });
    }

    // 실제 정적 HTML을 가져옵니다.
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    let html = await response.text();

    // 네이버 사이트 소유확인 태그를 최신 값으로 통일합니다.
    html = html.replace(
      /<meta\s+name=["']naver-site-verification["'][^>]*>/i,
      '<meta name="naver-site-verification" content="664bd9e0eaf277369ff1c6ce3f62e8e804c13f5f" />'
    );

    // HTML 안의 이전 도메인 주소를 공식 도메인으로 교체합니다.
    html = html.replaceAll(
      "https://carpick-korea.carpick.workers.dev",
      "https://mingka.tcflick.com"
    );

    // 현재 요청 경로를 기준으로 페이지별 canonical URL을 만듭니다.
    const canonicalPath = url.pathname === "/index.html" ? "/" : url.pathname;
    const canonicalUrl = `https://mingka.tcflick.com${canonicalPath}`;
    const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;

    // 기존 canonical이 있으면 현재 페이지 주소로 교체하고, 없으면 head 안에 추가합니다.
    if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
      html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonicalTag);
    } else {
      html = html.replace(/<head>/i, `<head>\n${canonicalTag}`);
    }

    // Open Graph URL도 현재 페이지 주소와 일치하도록 맞춥니다.
    if (/<meta\s+property=["']og:url["'][^>]*>/i.test(html)) {
      html = html.replace(
        /<meta\s+property=["']og:url["'][^>]*>/i,
        `<meta property="og:url" content="${canonicalUrl}" />`
      );
    }

    // 브랜드 검색에서 한글과 영문 표기가 함께 인식되도록 기본 SEO 메타 정보를 보강합니다.
    // 실제 화면 기능은 추가하지 않고 검색엔진이 읽는 정보만 보완합니다.
    if (url.pathname === "/" || url.pathname === "/index.html") {
      html = html.replace(
        /<meta\s+name=["']keywords["'][^>]*>/i,
        '<meta name="keywords" content="MINGKA, mingka, 밍카, 자동차 장기렌트, 장기렌터카, 자동차 리스, 장기렌트 추천, 자동차 리스 추천">'
      );
      html = html.replace(
        /<meta\s+property=["']og:site_name["'][^>]*>/i,
        '<meta property="og:site_name" content="MINGKA (밍카)" />'
      );
      html = html.replace(
        /<title>[\s\S]*?<\/title>/i,
        '<title>MINGKA (밍카) | 장기렌트·리스 차량 이용 방법 비교</title>'
      );
    }

    // 상단 브랜드 영역이 기존 한글 표기일 때만 MINGKA로 안전하게 교체합니다.
    // 다른 본문 문구나 진단 기능에는 영향을 주지 않습니다.
    html = html.replace(
      /(<[^>]*class=["'][^"']*\bbrand\b[^"']*["'][^>]*>)\s*밍카\s*(<\/[^>]+>)/i,
      '$1MINGKA$2'
    );

    // 내부 테스트 방문은 GA4에서 제외할 수 있도록 플래그를 적용합니다.
    html = html.replace(
      /gtag\(['"]config['"],\s*['"]G-06DTYM04S2['"]\);/i,
      `if (localStorage.getItem("mingka_internal") !== "1") { gtag("config", "G-06DTYM04S2"); }`
    );
    html = html.replace(
      /<head>/i,
      `<head>\n<script>if(new URLSearchParams(location.search).get("internal")==="1"){localStorage.setItem("mingka_internal","1");}</script>`
    );

    // 광고 영역은 실제 광고가 채워졌을 때만 보이도록 빈 슬롯을 숨깁니다.
    // 키보드 사용자는 모든 링크/버튼의 현재 포커스 위치를 명확하게 확인할 수 있도록 합니다.
    const adStyle = `
<style>
.mingka-ad-slot{width:100%;min-height:90px;margin:18px 0;padding:10px;display:flex;align-items:center;justify-content:center;border:1px dashed #ddd8e8;border-radius:14px;background:#faf9fc;overflow:hidden;box-sizing:border-box}
.mingka-ad-slot:empty{display:none}
.mingka-ad-slot:not(:empty)::before{content:"광고 영역";font-size:11px;color:#aaa;letter-spacing:.05em}
.mingka-ad-large{min-height:250px}
a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid #7567e8;outline-offset:3px;border-radius:6px}
@media(max-width:600px){.mingka-ad-slot{min-height:70px;margin:14px 0}.mingka-ad-large{min-height:180px}}
</style>`;
    const topAd = `<div id="mingkaAdTop" class="mingka-ad-slot" data-ad-position="top"></div>`;
    const middleAd = `<div id="mingkaAdMiddle" class="mingka-ad-slot mingka-ad-large" data-ad-position="middle"></div>`;
    const bottomAd = `<div id="mingkaAdBottom" class="mingka-ad-slot" data-ad-position="bottom"></div>`;

    // 상단 광고 영역을 body 시작 부분에 삽입합니다.
    html = html.replace(/<body([^>]*)>/i, `<body$1>${adStyle}${topAd}`);

    // 메인 퀴즈가 있는 경우 퀴즈 바로 아래에 중간 광고 영역을 삽입합니다.
    if (/<section\s+id=["']quiz["'][\s\S]*?<\/section>/i.test(html)) {
      html = html.replace(
        /(<section\s+id=["']quiz["'][\s\S]*?<\/section>)/i,
        `$1\n${middleAd}`
      );
    }

    // 기존 footer 전체를 제거한 뒤 하나의 정상적인 footer만 삽입합니다.
    // 중첩 footer 때문에 저작권 문구와 안내 문구가 겹치던 문제를 방지합니다.
    const footer = `
<footer class="mingka-footer">
  <div class="mingka-footer-brand">MINGKA</div>
  <nav aria-label="사이트 정보">
    <a href="/terms.html">이용약관</a>
    <span> | </span>
    <a href="/privacy.html">개인정보처리방침</a>
    <span> | </span>
    <a href="/contact.html">문의하기</a>
  </nav>
  <p class="mingka-footer-notice">밍카의 진단 결과와 추천은 참고용이며 실제 차량 이용·계약 조건은 제휴 업체와 상담을 통해 확인해주세요.</p>
  <div class="mingka-footer-copy">© 2026 MINGKA. All rights reserved.</div>
</footer>
<style>
.mingka-footer{margin-top:40px;padding:30px 20px 34px;border-top:1px solid #eeeaf3;background:#faf9fc;text-align:center;color:#888;font-size:12px;line-height:1.8}
.mingka-footer-brand{margin-bottom:8px;color:#7567e8;font-size:17px;font-weight:900}
.mingka-footer nav{margin-bottom:12px}
.mingka-footer nav a{color:#666;text-decoration:none}
.mingka-footer nav a:hover{text-decoration:underline}
.mingka-footer-notice{max-width:460px;margin:0 auto 12px;color:#999;font-size:11px;line-height:1.7}
.mingka-footer-copy{color:#aaa;font-size:11px}
</style>`;

    // 기존 footer가 있으면 footer 전체를 교체하고, 없으면 body 끝에 추가합니다.
    if (/<footer[\s>]/i.test(html)) {
      html = html.replace(/<footer[\s\S]*?<\/footer>/i, `${bottomAd}\n${footer}`);
    } else {
      html = html.replace(/<\/body>/i, `${bottomAd}\n${footer}\n</body>`);
    }

    // 브라우저가 응답 MIME을 추측해 해석하지 않도록 하고 외부 요청에 전달되는
    // Referrer 정보를 최소화해 보안과 안정성을 높입니다.
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
