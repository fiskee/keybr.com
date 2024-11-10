import { test } from "node:test";
import { type IncomingHeaders } from "@fastr/headers";
import { Manifest, ManifestContext } from "@keybr/assets";
import { FakeIntlProvider } from "@keybr/intl";
import { PageDataContext, Pages } from "@keybr/pages-shared";
import { assert } from "chai";
import { load } from "cheerio";
import { renderToStaticMarkup } from "react-dom/server";
import { Shell } from "./Shell.tsx";

test("render", () => {
  const html = renderToStaticMarkup(
    <ManifestContext.Provider value={Manifest.fake}>
      <PageDataContext.Provider
        value={{
          base: "https://www.keybr.com/",
          locale: "en",
          user: null,
          publicUser: {
            id: null,
            name: "name",
            imageUrl: null,
          },
          settings: null,
        }}
      >
        <FakeIntlProvider>
          <Shell page={Pages.practice} headers={fakeHeaders()} />
        </FakeIntlProvider>
      </PageDataContext.Provider>
    </ManifestContext.Provider>,
  );

  const $ = load(html);

  assert.deepStrictEqual($("html").attr(), {
    "prefix": "og: http://ogp.me/ns#",
    "lang": "en",
    "dir": "ltr",
    "data-color": "system",
    "data-font": "open-sans",
  });
  assert.isTrue(html.includes("google"));
  assert.isTrue(html.includes("cloudflare"));
  assert.strictEqual($("nav").length, 0);
});

test("render alt", () => {
  const html = renderToStaticMarkup(
    <ManifestContext.Provider value={Manifest.fake}>
      <PageDataContext.Provider
        value={{
          base: "https://www.keybr.com/",
          locale: "en",
          user: null,
          publicUser: {
            id: "abc",
            name: "name",
            imageUrl: null,
            premium: true,
          },
          settings: null,
        }}
      >
        <FakeIntlProvider>
          <Shell page={Pages.practice} headers={fakeHeaders()} />
        </FakeIntlProvider>
      </PageDataContext.Provider>
    </ManifestContext.Provider>,
  );

  const $ = load(html);

  assert.deepStrictEqual($("html").attr(), {
    "prefix": "og: http://ogp.me/ns#",
    "lang": "en",
    "dir": "ltr",
    "data-color": "system",
    "data-font": "open-sans",
  });
  assert.isFalse(html.includes("google"));
  assert.isFalse(html.includes("cloudflare"));
  assert.strictEqual($("nav").length, 0);
});

test("render for a bot", () => {
  const html = renderToStaticMarkup(
    <ManifestContext.Provider value={Manifest.fake}>
      <PageDataContext.Provider
        value={{
          base: "https://www.keybr.com/",
          locale: "en",
          user: null,
          publicUser: {
            id: null,
            name: "name",
            imageUrl: null,
          },
          settings: null,
        }}
      >
        <FakeIntlProvider>
          <Shell
            page={Pages.practice}
            headers={fakeHeaders({ useragent: "Googlebot" })}
          />
        </FakeIntlProvider>
      </PageDataContext.Provider>
    </ManifestContext.Provider>,
  );

  const $ = load(html);

  assert.deepStrictEqual($("html").attr(), {
    "prefix": "og: http://ogp.me/ns#",
    "lang": "en",
    "dir": "ltr",
    "data-color": "system",
    "data-font": "open-sans",
  });
  assert.strictEqual($("nav").length, 1);
});

function fakeHeaders(entries: Record<string, string> = {}) {
  const map = new Map(Object.entries(entries));
  return {
    get(name) {
      return map.get(name.toLowerCase()) ?? null;
    },
  } as IncomingHeaders;
}
