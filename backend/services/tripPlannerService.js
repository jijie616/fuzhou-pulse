const OpenAI = require("openai");
const featuredCards = require("../data/featuredCards");

function buildTravelDataContext() {
    if (!Array.isArray(featuredCards) || featuredCards.length === 0) {
        return "项目暂无可参考的文旅推荐卡片，请基于福州通用旅行经验生成，但不要编造过多地点。";
    }

    const travelData = featuredCards.map(function (card) {
        const detail = card.detail || {};

        return {
            id: card.id,
            title: card.title,
            category: card.category,
            tag: card.tag,
            subtitle: card.subtitle,
            description: card.description,
            bestTime: detail.bestTime,
            location: detail.location,
            reason: detail.reason,
            tips: detail.tips
        };
    });

    return JSON.stringify(travelData);
}

function normalizeRelatedPlaces(places) {
    if (!Array.isArray(places)) {
        return [];
    }

    return places
        .filter(function (place) {
            return place && (place.id || place.title);
        })
        .slice(0, 6)
        .map(function (place) {
            return {
                id: place.id || "",
                title: place.title || "",
                reason: place.reason || "与本次行程偏好相关。"
            };
        });
}

function pickRelatedPlaces(interest) {
    let preferredCategory = "";
    if (interest.indexOf("美食") !== -1) {
        preferredCategory = "food";
    } else if (interest.indexOf("历史") !== -1) {
        preferredCategory = "history";
    } else if (interest.indexOf("文化") !== -1) {
        preferredCategory = "culture";
    }

    const preferredCards = preferredCategory
        ? featuredCards.filter(function (card) {
            return card.category === preferredCategory;
        })
        : featuredCards;

    const fallbackCards = featuredCards.filter(function (card) {
        return preferredCards.indexOf(card) === -1;
    });

    return preferredCards
        .concat(fallbackCards)
        .slice(0, 5)
        .map(function (card) {
            return {
                id: card.id,
                title: card.title,
                reason: card.detail && card.detail.reason ? card.detail.reason : "适合作为本次福州行程参考。"
            };
        });
}

function buildDailyPlan(days, basePlan) {
    if (days === 1) {
        return basePlan;
    }

    const plan = [];
    for (let index = 1; index <= days; index += 1) {
        plan.push("第 " + index + " 天：" + basePlan.join("；"));
    }
    return plan;
}

function generateMockTripPlan(options) {
    const days = options.days;
    const interest = options.interest;
    const pace = options.pace;
    const userPreference = typeof options.userPreference === "string" ? options.userPreference.trim() : "";
    let title = "福州综合漫游行程";
    let summary = "结合古城街巷、闽江风物与福州味道，安排一条适合初次体验的城市路线。";
    let basePlan = [
        "上午：从三坊七巷开始，感受福州老城肌理",
        "中午：品尝福州鱼丸或肉燕，补充一份地道鲜味",
        "下午：前往上下杭或烟台山，体验闽商文化与城市更新",
        "晚上：沿闽江散步，看中洲岛与两岸夜色"
    ];

    if (interest.indexOf("美食") !== -1) {
        title = "福州美食慢游行程";
        summary = "围绕福州鱼丸、肉燕、佛跳墙与上下杭街区，安排一条轻松的味觉路线。";
        basePlan = [
            "上午：从福州鱼丸开始，用一碗热汤打开城市味觉",
            "中午：尝试肉燕与本地小吃，感受福州饮食的细腻手作",
            "下午：前往上下杭慢逛，在老街区寻找茶饮与甜点",
            "晚上：预订佛跳墙或闽菜正餐，完整体验福州宴席风味"
        ];
    } else if (interest.indexOf("历史") !== -1) {
        title = "福州历史古城行程";
        summary = "围绕三坊七巷、林则徐纪念馆和于山，串起福州古城文脉。";
        basePlan = [
            "上午：游览三坊七巷，观察白墙黛瓦与里坊格局",
            "中午：在南后街附近简单用餐，保留体力继续步行",
            "下午：参观林则徐纪念馆，了解福州士人的家国精神",
            "晚上：登于山或在老城周边散步，收束一天的古城印象"
        ];
    } else if (interest.indexOf("文化") !== -1) {
        title = "福州闽商文化行程";
        summary = "以江岸商埠、近代建筑和青年街区为线索，体验福州开放包容的一面。";
        basePlan = [
            "上午：前往上下杭，了解福州商贸码头与闽商往事",
            "中午：在街区周边用餐，顺路体验本地小吃",
            "下午：游览烟台山，看坡巷洋楼与青年生活空间",
            "晚上：到中洲岛或闽江边看夜景，感受江城灯影"
        ];
    }

    return {
        title: title,
        summary: summary + " 当前节奏偏好为“" + pace + "”。" + (userPreference ? " 已参考你的补充需求：" + userPreference : ""),
        days: days,
        interest: interest,
        pace: pace,
        userPreference: userPreference,
        requestSummary: userPreference ? "已参考你的补充需求：" + userPreference : "",
        isMock: true,
        relatedPlaces: pickRelatedPlaces(interest),
        plan: buildDailyPlan(days, basePlan),
        tips: "当前为规则生成的模拟 AI 行程，后续可接入真实模型，让推荐更个性化。" + (userPreference ? " 补充需求会作为路线松紧、拍照、美食和同行人安排的参考。" : "")
    };
}

function createFallbackTripPlan(options, reason) {
    const fallbackPlan = generateMockTripPlan(options);

    return {
        ...fallbackPlan,
        summary: reason,
        isMock: true
    };
}

function normalizeAiTripPlan(parsedPlan, options) {
    const userPreference = typeof options.userPreference === "string" ? options.userPreference.trim() : "";

    return {
        title: parsedPlan.title || "福州 AI 行程推荐",
        summary: parsedPlan.summary || "根据你的偏好生成了一份福州行程建议。",
        days: Number(parsedPlan.days) || options.days,
        interest: parsedPlan.interest || options.interest,
        pace: parsedPlan.pace || options.pace,
        userPreference: parsedPlan.userPreference || userPreference,
        requestSummary: parsedPlan.requestSummary || (userPreference ? "已参考你的补充需求：" + userPreference : ""),
        relatedPlaces: normalizeRelatedPlaces(parsedPlan.relatedPlaces),
        plan: Array.isArray(parsedPlan.plan) ? parsedPlan.plan : [],
        tips: parsedPlan.tips || "建议根据当天交通、天气和体力情况灵活调整。",
        isMock: false
    };
}

async function generateDeepSeekTripPlan(options) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
    const model = process.env.AI_MODEL || "deepseek-v4-flash";
    const userPreference = typeof options.userPreference === "string" ? options.userPreference.trim() : "";
    const travelDataContext = buildTravelDataContext();

    if (!apiKey) {
        return createFallbackTripPlan(options, "当前未配置 DeepSeek API Key，已使用模拟推荐。");
    }

    const client = new OpenAI({
        apiKey,
        baseURL
    });

    try {
        const response = await client.chat.completions.create({
            model,
            messages: [
                {
                    role: "system",
                    content: [
                        "你是福州城市文旅行程规划助手。",
                        "请根据用户提供的游玩天数、兴趣偏好和旅行节奏，生成适合福州旅行的行程建议。",
                        "你必须优先参考“项目已有文旅数据”中的景点、美食和文化地点。",
                        "尽量不要凭空编造项目中不存在的地点；如果确实需要补充项目外地点，只能少量补充，并且整体仍以项目已有数据为主。",
                        "必须只返回 JSON 对象，不要返回 Markdown，不要返回解释性文字。",
                        "JSON 字段必须包含 title、summary、days、interest、pace、userPreference、requestSummary、plan、tips、isMock、relatedPlaces。",
                        "relatedPlaces 必须是数组，建议 3-6 个，尽量使用项目已有文旅数据中的 id 和 title，并说明推荐理由。",
                        "plan 必须是字符串数组，适合直接展示在网页中。",
                        "isMock 必须为 false。",
                        userPreference
                            ? "用户提供了补充需求，必须优先考虑这段内容，并在 requestSummary 中用一句话概括。"
                            : "用户没有提供补充需求，按 days、interest、pace 正常生成。"
                    ].join("\n")
                },
                {
                    role: "user",
                    content: JSON.stringify({
                        days: options.days,
                        interest: options.interest,
                        pace: options.pace,
                        userPreference: userPreference,
                        travelDataContext: travelDataContext,
                        outputExample: {
                            title: "福州一日游标题",
                            summary: "简短总结",
                            days: 1,
                            interest: "美食",
                            pace: "轻松",
                            userPreference: userPreference,
                            requestSummary: "用户希望路线轻松，适合和父母同行。",
                            relatedPlaces: [
                                {
                                    id: "gushan",
                                    title: "鼓山",
                                    reason: "适合历史与自然结合的行程"
                                }
                            ],
                            plan: [
                                "上午：...",
                                "中午：...",
                                "下午：...",
                                "晚上：..."
                            ],
                            tips: "...",
                            isMock: false
                        }
                    })
                }
            ],
            temperature: 0.7,
            max_tokens: 800,
            response_format: { type: "json_object" }
        });

        const content = response.choices && response.choices[0] && response.choices[0].message
            ? response.choices[0].message.content
            : "";

        try {
            const parsedPlan = JSON.parse(content);
            return normalizeAiTripPlan(parsedPlan, options);
        } catch (error) {
            console.warn("DeepSeek trip plan JSON parse failed:", error.message);
            return createFallbackTripPlan(options, "AI 返回格式异常，已使用模拟推荐。");
        }
    } catch (error) {
        console.error("DeepSeek trip plan request failed:", error.message);
        return createFallbackTripPlan(options, "DeepSeek 服务暂时不可用，已使用模拟推荐。");
    }
}

async function generateTripPlan(options) {
    const provider = process.env.AI_PROVIDER || "mock";

    if (provider === "deepseek") {
        return generateDeepSeekTripPlan(options);
    }

    return generateMockTripPlan(options);
}

module.exports = {
    buildTravelDataContext,
    generateTripPlan,
    generateMockTripPlan,
    generateDeepSeekTripPlan
};
