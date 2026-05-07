const { generateMockTripPlan, buildTravelDataContext, generateTripPlan } = require("../services/tripPlannerService");

describe("buildTravelDataContext", function () {
  it("should return a JSON string", function () {
    const ctx = buildTravelDataContext();
    expect(typeof ctx).toBe("string");
  });

  it("should be valid JSON", function () {
    const ctx = buildTravelDataContext();
    const parsed = JSON.parse(ctx);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });

  it("each entry should have required fields", function () {
    const parsed = JSON.parse(buildTravelDataContext());
    parsed.forEach(function (item) {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("title");
      expect(item).toHaveProperty("category");
    });
  });
});

describe("generateMockTripPlan", function () {
  it("should generate a plan with required fields", function () {
    const plan = generateMockTripPlan({
      days: 1,
      interest: "综合",
      pace: "适中",
      userPreference: ""
    });

    expect(plan).toHaveProperty("title");
    expect(plan).toHaveProperty("summary");
    expect(plan).toHaveProperty("days", 1);
    expect(plan).toHaveProperty("interest", "综合");
    expect(plan).toHaveProperty("pace", "适中");
    expect(plan).toHaveProperty("isMock", true);
    expect(Array.isArray(plan.plan)).toBe(true);
    expect(plan.plan.length).toBeGreaterThan(0);
    expect(Array.isArray(plan.relatedPlaces)).toBe(true);
  });

  it("should handle food interest", function () {
    const plan = generateMockTripPlan({
      days: 1,
      interest: "美食",
      pace: "轻松",
      userPreference: ""
    });
    expect(plan.interest).toBe("美食");
    expect(plan.title).toContain("美食");
  });

  it("should handle history interest", function () {
    const plan = generateMockTripPlan({
      days: 1,
      interest: "历史",
      pace: "适中",
      userPreference: ""
    });
    expect(plan.interest).toBe("历史");
    expect(plan.title).toContain("历史");
  });

  it("should generate multi-day plans", function () {
    const plan = generateMockTripPlan({
      days: 3,
      interest: "综合",
      pace: "充实",
      userPreference: ""
    });
    expect(plan.days).toBe(3);
    expect(plan.plan.length).toBe(3);
    plan.plan.forEach(function (p) {
      expect(p).toContain("第");
      expect(p).toContain("天");
    });
  });

  it("should include user preference when provided", function () {
    const plan = generateMockTripPlan({
      days: 1,
      interest: "综合",
      pace: "适中",
      userPreference: "想拍照多一点"
    });
    expect(plan.summary).toContain("想拍照多一点");
  });
});

describe("generateTripPlan", function () {
  it("should return mock plan when provider is not deepseek", async function () {
    const plan = await generateTripPlan({
      days: 1,
      interest: "综合",
      pace: "适中",
      userPreference: ""
    });
    expect(plan.isMock).toBe(true);
  });

  it("should return mock plan when DEEPSEEK_API_KEY is unset", async function () {
    // Even if provider is "deepseek", mock is returned when no key is set
    const prevProvider = process.env.AI_PROVIDER;
    process.env.AI_PROVIDER = "deepseek";
    delete process.env.DEEPSEEK_API_KEY;

    const plan = await generateTripPlan({
      days: 1,
      interest: "综合",
      pace: "适中",
      userPreference: ""
    });

    if (prevProvider) {
      process.env.AI_PROVIDER = prevProvider;
    }

    expect(plan.isMock).toBe(true);
  });
});
