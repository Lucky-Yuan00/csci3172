/** @jest-environment jsdom */

const fs = require("fs");
const path = require("path");

function readHtml() {
  const cand = [
    path.join(process.cwd(), "frontend", "index.html"),
    path.join(process.cwd(), "index.html"),
  ];
  for (const p of cand) if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
  throw new Error("index.html not found (tried frontend/index.html and ./index.html)");
}

describe("Index structure", () => {
  it("has grid, search box and buttons", () => {
    document.documentElement.innerHTML = readHtml();
    expect(document.querySelector("#grid")).toBeTruthy();
    expect(document.querySelector("#q")).toBeTruthy();
    expect(document.querySelector("#btnSearch")).toBeTruthy();
    expect(document.querySelector("#btnTop5")).toBeTruthy();
  });

  it("has accessibility hooks", () => {
    document.documentElement.innerHTML = readHtml();
    const count = document.querySelector("#count");
    expect(count).toBeTruthy();
    expect(count.getAttribute("aria-live")).toBe("polite");
    expect(document.querySelector("a.skip-link")).toBeTruthy();
    expect(document.querySelector("#modalTop5")).toBeTruthy();
    expect(document.querySelector("#modalDetail")).toBeTruthy();
  });
});
