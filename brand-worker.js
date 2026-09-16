// MINGKA 브랜드 표기와 한글·영문 검색 노출을 보강하는 래퍼 Worker입니다.
// 기존 worker.js의 SEO, robots, sitemap, 광고, 푸터 기능은 그대로 실행한 뒤 필요한 부분만 보정합니다.
import baseWorker from "./worker.js";

export default {
  async fetch(request, env, ctx) {
    // 기존 Worker의 모든 기능을 먼저 실행합니다.
    const response = await baseWorker.fetch(request, env, ctx);

    // HTML이 아닌 robots.txt, sitemap.xml, 이미지 등은 기존 응답을 그대로 반환합니다.
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    // 기존 HTML을 읽어 브랜드와 검색엔진 메타 정보를 보정합니다.
    let html = await response.text();
    const url = new URL(request.url);

    // 헤더의 브랜드 로고를 영문 공식 표기 MINGKA로 변경합니다.
    html = html.replace(
      /(<[^>]+class=["']brand["'][^>]*>)[\s\S]*?(<\/[^>]+>)/i,
      "$1MINGKA$2"
    );

    // 자동으로 삽입되는 푸터 브랜드도 MINGKA로 통일합니다.
    html = html.replace(
      /(<[^>]+class=["']mingka-footer-brand["'][^>]*>)[\s\S]*?(<\/[^>]+>)/i,
      "$1MINGKA$2"
    );

    // 한글과 영문 브랜드명을 모두 검색할 수 있도록 keywords를 확장합니다.
    const keywords = "MINGKA, mingka, 밍카, 자동차 장기렌트, 장기렌터카, 자동차 리스, 장기렌트 추천, 자동차 리스 추천";
    if (/<meta\s+name=["']keywords["'][^>]*>/i.test(html)) {
      html = html.replace(
        /<meta\s+name=["']keywords["'][^>]*>/i,
        `<meta name="keywords" content="${keywords}" />`
      );
    } else {
      html = html.replace(/<head>/i, `<head>\n<meta name="keywords" content="${keywords}" />`);
    }

    // 메인 페이지 제목에 MINGKA와 밍카를 함께 넣어 양쪽 검색어의 브랜드 신호를 강화합니다.
    if (url.pathname === "/" || url.pathname === "/index.html") {
      html = html.replace(
        /<title>[\s\S]*?<\/title>/i,
        "<title>MINGKA | 밍카 | 장기렌트·리스 차량 이용 방법 비교</title>"
      );
      html = html.replace(
        /<meta\s+property=["']og:title["'][^>]*>/i,
        '<meta property="og:title" content="MINGKA | 밍카 | 나에게 맞는 차량 이용 방법 찾기" />'
      );
      html = html.replace(
        /<meta\s+property=["']og:site_name["'][^>]*>/i,
        '<meta property="og:site_name" content="MINGKA | 밍카" />'
      );
    }

    // 변경된 HTML을 기존 응답 헤더와 함께 반환합니다.
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
