const fs = require("fs");
const path = require("path");

const webRoot = path.join(__dirname, "..", "..", "web");
const webAssetsImages = path.join(webRoot, "assets", "images");

describe("Frontend data integrity", function () {
  let backendCards, frontendData;

  beforeAll(function () {
    backendCards = require("../data/featuredCards");
    // Read frontend data.js as text and extract card images via regex
    const dataJsPath = path.join(webRoot, "js", "data.js");
    frontendData = fs.readFileSync(dataJsPath, "utf8");
  });

  describe("Backend card image references", function () {
    it("all backend card images should exist on disk", function () {
      backendCards.forEach(function (card) {
        const imagePath = card.image;
        expect(imagePath).toBeTruthy();
        // Convert relative ./assets/images/xxx to absolute path
        const filename = imagePath.replace(/^\.\/assets\/images\//, "");
        const fullPath = path.join(webAssetsImages, filename);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
    });

    it("all backend cards should have required fields", function () {
      backendCards.forEach(function (card) {
        expect(card).toHaveProperty("id");
        expect(typeof card.id).toBe("string");
        expect(card).toHaveProperty("title");
        expect(card).toHaveProperty("category");
        expect(["history", "culture", "food"]).toContain(card.category);
        expect(card).toHaveProperty("image");
        expect(card).toHaveProperty("description");
      });
    });
  });

  describe("Frontend local fallback data", function () {
    it("frontend data.js should exist and be non-empty", function () {
      expect(frontendData.length).toBeGreaterThan(0);
    });

    it("frontend data.js should use ES module exports", function () {
      expect(frontendData).toMatch(/export const featuredCards/);
      expect(frontendData).toMatch(/export const siteInfo/);
    });

    it("frontend card IDs should match backend card IDs", function () {
      const backendIds = backendCards.map(function (c) { return c.id; }).sort();
      // Extract frontend card IDs from data.js using regex
      const re = /id:\s*"([^"]+)"/g;
      const frontendIds = [];
      let match;
      while ((match = re.exec(frontendData)) !== null) {
        frontendIds.push(match[1]);
      }
      backendIds.forEach(function (id) {
        expect(frontendIds).toContain(id);
      });
    });
  });

  describe("Web assets directory", function () {
    it("web/assets/images/ should exist", function () {
      expect(fs.existsSync(webAssetsImages)).toBe(true);
    });

    it("should contain expected image files", function () {
      const files = fs.readdirSync(webAssetsImages);
      expect(files.length).toBeGreaterThanOrEqual(20);
    });
  });
});
