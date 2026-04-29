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
        summary: summary + " 当前节奏偏好为“" + pace + "”。",
        days: days,
        interest: interest,
        pace: pace,
        isMock: true,
        plan: buildDailyPlan(days, basePlan),
        tips: "当前为规则生成的模拟 AI 行程，后续可接入真实模型，让推荐更个性化。"
    };
}

async function generateTripPlan(options) {
    const provider = process.env.AI_PROVIDER || "mock";

    if (provider === "mock") {
        return generateMockTripPlan(options);
    }

    return {
        ...generateMockTripPlan(options),
        summary: "当前未配置真实 AI 服务，已使用模拟推荐结果。",
        isMock: true
    };
}

module.exports = {
    generateTripPlan,
    generateMockTripPlan
};
