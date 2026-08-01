import { describe, expect, it } from "vitest";
import { twoDigitYearToFull } from "../src/literature/parse.js";
import { parseJStageEntries } from "../src/literature/jstage.js";
import { parsePwriNewArrivals } from "../src/literature/pwri.js";
import { parseItcDetail, parseItcYearPage, parseItcYears } from "../src/literature/itc.js";
import { parseMlitTecLinks } from "../src/literature/mlit.js";
import { parseKtrGijyutuLinks } from "../src/literature/ktr.js";

const JSTAGE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:prism="http://prismstandard.org/namespaces/basic/2.0/">
  <opensearch:totalResults>1605</opensearch:totalResults>
  <entry>
    <article_title><en><![CDATA[Material properties, structural details]]></en><ja><![CDATA[コンクリート構造物補強に要する材料特性]]></ja></article_title>
    <article_link><en>https://www.jstage.jst.go.jp/article/kabse/41/0/41_1/_article</en><ja>https://www.jstage.jst.go.jp/article/kabse/41/0/41_1/_article/-char/ja/</ja></article_link>
    <author><en><name><![CDATA[Tamon UEDA]]></name></en><ja><name><![CDATA[上田 多門]]></name></ja></author>
    <cdjournal>kabse</cdjournal>
    <material_title><en><![CDATA[Journal of structures and materials in civil engineering]]></en><ja><![CDATA[土木構造・材料論文集]]></ja></material_title>
    <prism:issn>2185-4157</prism:issn>
    <prism:volume>41</prism:volume>
    <prism:number>0</prism:number>
    <pubyear>2025</pubyear>
    <prism:doi>10.60345/kabse.41.0_1</prism:doi>
    <title><![CDATA[コンクリート構造物補強に要する材料特性]]></title>
    <link href="https://www.jstage.jst.go.jp/article/kabse/41/0/41_1/_article/-char/ja/"/>
    <updated>2026-04-01T09:00+09:00</updated>
  </entry>
</feed>`;

const PWRI_HTML = `<html><body>
<h3>新着一覧</h3>
<table>
<tr><th>公開日</th><th>タイトル</th><th>著者</th><th>研究室</th><th>刊行物</th></tr>
<tr><td style="text-align:center;">26-10-01</td><td><a href="http://thesis.pwri.go.jp/public_detail/122848/" target="_blank">既設PC橋上部構造の破壊過程に基づく構造機能の階層化に関する一考察</a></td><td>吉田 英二</td><td>CAESAR</td><td>土木学会論文集E2（材料・コンクリート構造）</td></tr>
<tr><td style="text-align:center;">26-07-31</td><td><a href="http://thesis.pwri.go.jp/public_detail/1002987/" target="_blank">土工・舗装工における施工工程データ等を活用した生産性向上技術に関する共同研究報告書（４）</a></td><td>橋本\u3000毅</td><td>先端技術チーム</td><td>共同研究報告書</td></tr>
</table>
</body></html>`;

const ITC_YEAR_HTML = `<html><body>
<a href="/paper/91">paper 91</a>
<a href="/paper/w78_2007_99">paper w78_2007_99</a>
<a href="/paper/91">duplicate</a>
</body></html>`;

const ITC_YEARS_HTML = `<html><body>
<a href="/papers/year/2023">2023</a>
<a href="/papers/year/2024">2024</a>
<a href="/papers/year/2020">2020</a>
</body></html>`;

const ITC_DETAIL_HTML = `<html><body>
<table class="table table-bordered">
<tbody>
<tr><td class="table-dark text-right">Paper title:</td><td><strong>Reduction, simplification, translation and interpretation in the exchange of model data</strong></td></tr>
<tr><td class="table-dark text-right">Authors:</td><td>Vladimir Bazjanac, Arto Kiviniemi</td></tr>
<tr><td class="table-dark text-right">Summary:</td><td>A major purpose of Building Information Models (BIM) is to serve as a comprehensive repository of data.</td></tr>
<tr><td class="table-dark text-right" nowrap="nowrap">Year of publication:</td><td>2007</td></tr>
<tr><td class="table-dark text-right">Keywords:</td><td>buildings, data modeling, BIM</td></tr>
<tr><td class="table-dark text-right">Series:</td><td><a href="/series/w78_2007">w78:2007</a></td></tr>
<tr><td class="table-dark text-right">Download paper:</td><td><a href="/pdfs/w78-2007-024-142-Bazjanac.pdf">/pdfs/w78-2007-024-142-Bazjanac.pdf</a></td></tr>
</tbody>
</table>
</body></html>`;

const MLIT_HTML = `<html><body>
<a href="/tec/index.html">技術調査トップ</a>
<a href="/tec/tec_fr_000067.html">技術政策課の取り組み</a>
<a href="/report/press/kanbo08_hh_001334.html">新技術の現場実装に関するお知らせ</a>
<a href="/tec/constplan/sosei_constplan_mn_000004.html">社会資本整備計画</a>
<a href="/common/001359908.pdf">パンフレット</a>
</body></html>`;

const KTR_HTML = `<html><body>
<a href="/gijyutu/index.html">技術情報トップ</a>
<a href="/gijyutu/gijyutu00000002.html">令和7年度 技術研究発表会の開催について</a>
<a href="/eizen/gijyutu/gijyutu00000001.html">維持管理技術情報</a>
<a href="/bousai/index.html">防災情報</a>
</body></html>`;

describe("J-STAGE WebAPI パーサ", () => {
  it("論文メタデータを抽出する", () => {
    const entries = parseJStageEntries(JSTAGE_XML);
    expect(entries).toHaveLength(1);
    const e = entries[0]!;
    expect(e.titleJa).toBe("コンクリート構造物補強に要する材料特性");
    expect(e.titleEn).toBe("Material properties, structural details");
    expect(e.linkEn).toBe("https://www.jstage.jst.go.jp/article/kabse/41/0/41_1/_article");
    expect(e.authors).toEqual(["上田 多門"]);
    expect(e.materialJa).toBe("土木構造・材料論文集");
    expect(e.doi).toBe("10.60345/kabse.41.0_1");
    expect(e.pubyear).toBe("2025");
  });
});

describe("PWRI 新着一覧パーサ", () => {
  it("公開日・タイトル・URL・著者・刊行物を抽出する", () => {
    const rows = parsePwriNewArrivals(PWRI_HTML);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      date: "2026-10-01",
      title: "既設PC橋上部構造の破壊過程に基づく構造機能の階層化に関する一考察",
      url: "https://thesis.pwri.go.jp/public_detail/122848/",
      authors: "吉田 英二",
      publication: "土木学会論文集E2（材料・コンクリート構造）"
    });
    expect(rows[1]!.date).toBe("2026-07-31");
  });
});

describe("ITC パーサ", () => {
  it("年別ページから重複なしの paper id を抽出する", () => {
    expect(parseItcYearPage(ITC_YEAR_HTML).sort()).toEqual(["91", "w78_2007_99"]);
  });

  it("years ページから年を昇順で抽出する", () => {
    expect(parseItcYears(ITC_YEARS_HTML)).toEqual(["2020", "2023", "2024"]);
  });

  it("詳細ページから書誌情報を抽出する", () => {
    const detail = parseItcDetail(ITC_DETAIL_HTML);
    expect(detail.title).toBe("Reduction, simplification, translation and interpretation in the exchange of model data");
    expect(detail.authors).toBe("Vladimir Bazjanac, Arto Kiviniemi");
    expect(detail.year).toBe("2007");
    expect(detail.series).toBe("w78:2007");
    expect(detail.pdfUrl).toBe("/pdfs/w78-2007-024-142-Bazjanac.pdf");
  });
});

describe("MLIT/KTR リンク抽出", () => {
  it("MLIT 技術調査の記事ページのみ抽出する", () => {
    const links = parseMlitTecLinks(MLIT_HTML);
    expect(links).toHaveLength(2);
    expect(links.map((l) => l.url)).toEqual([
      "https://www.mlit.go.jp/tec/tec_fr_000067.html",
      "https://www.mlit.go.jp/report/press/kanbo08_hh_001334.html"
    ]);
  });

  it("KTR 技術情報の記事ページのみ抽出する", () => {
    const links = parseKtrGijyutuLinks(KTR_HTML);
    expect(links).toHaveLength(2);
    expect(links.map((l) => l.url)).toEqual([
      "https://www.ktr.mlit.go.jp/gijyutu/gijyutu00000002.html",
      "https://www.ktr.mlit.go.jp/eizen/gijyutu/gijyutu00000001.html"
    ]);
  });
});

describe("年度変換", () => {
  it("26 → 2026, 99 → 1999", () => {
    expect(twoDigitYearToFull(26)).toBe(2026);
    expect(twoDigitYearToFull(99)).toBe(1999);
  });
});
