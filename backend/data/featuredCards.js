const featuredCards = [
    {
        id: "sanfang",
        tag: "古城名片",
        title: "三坊七巷",
        subtitle: "里坊制度的活化石",
        description: "白墙黛瓦与深宅古厝构成了福州最经典的城市记忆。这里保留了中国古代里坊制度的空间脉络，也是读懂福州士人气质、家族文化与生活美学的一把钥匙。",
        image: "./assets/images/sanfang.png",
        category: "history",
        detail: {
            bestTime: "建议游玩 2-3 小时",
            location: "福州市鼓楼区南后街一带",
            reason: "这里适合感受福州古城肌理、坊巷格局与传统建筑美学。",
            tips: "建议上午或傍晚前往，光线柔和，适合拍摄白墙黛瓦与巷口光影。"
        }
    },
    {
        id: "yushan",
        tag: "城中山色",
        title: "于山",
        subtitle: "闹市里的千年文脉",
        description: "于山不高，却藏着福州城的清雅气质。摩崖石刻、古树亭台与城中烟火相互映照，适合在慢步之间感受古城的书卷气。",
        image: "./assets/images/yushan.png",
        category: "history",
        detail: {
            bestTime: "建议游玩 1-2 小时",
            location: "福州市鼓楼区于山路",
            reason: "这里把城中山色、古迹碑刻与榕城慢生活自然连在一起。",
            tips: "山路不算陡，适合轻装步行；雨后绿意更浓，但注意台阶湿滑。"
        }
    },
    {
        id: "linzexu",
        tag: "名人故里",
        title: "林则徐纪念馆",
        subtitle: "家国精神的城市注脚",
        description: "从展陈、院落到一方静雅庭院，这里记录着林则徐的清廉风骨与开眼看世界的胸襟，也让福州的历史记忆更有力量。",
        image: "./assets/images/linzexu.png",
        category: "history",
        detail: {
            bestTime: "建议游玩 1-1.5 小时",
            location: "福州市鼓楼区澳门路",
            reason: "这里适合了解林则徐生平与福州士人的家国情怀。",
            tips: "可与三坊七巷串联游览，动线紧凑，也更容易读懂老城文脉。"
        }
    },
    {
        id: "shangxiahang",
        tag: "闽商往事",
        title: "上下杭",
        subtitle: "闽商文化的发祥地",
        description: "曾经的商贸码头，如今成了最能体现福州旧城新生的街区之一。青石路、老骑楼与沿河灯影交织，把闽江商埠的繁华记忆与当代夜游氛围自然衔接在一起。",
        image: "./assets/images/shangxiahang.png",
        category: "culture",
        detail: {
            bestTime: "建议游玩 2 小时",
            location: "福州市台江区上下杭历史文化街区",
            reason: "这里适合感受闽商文化、码头记忆与老街更新后的夜游氛围。",
            tips: "傍晚到夜间最有氛围，沿河慢走可以看到街灯与骑楼层次。"
        }
    },
    {
        id: "yantaishan",
        tag: "山海洋楼",
        title: "烟台山",
        subtitle: "近代建筑与青年生活的交汇",
        description: "坡巷、洋楼、咖啡香与榕荫在这里叠在一起。烟台山把福州开放包容的一面铺展开来，也让老城生长出新的浪漫。",
        image: "./assets/images/yantaishan.png",
        category: "culture",
        detail: {
            bestTime: "建议游玩 2-3 小时",
            location: "福州市仓山区烟台山历史风貌区",
            reason: "这里适合看近代建筑、坡地街巷与青年文化空间的融合。",
            tips: "坡道较多，建议穿舒适鞋；午后到黄昏适合拍摄洋楼和街角光影。"
        }
    },
    {
        id: "zhongzhoudao",
        tag: "闽江灯影",
        title: "中洲岛",
        subtitle: "江心地标的城市夜色",
        description: "中洲岛静卧闽江之上，见证水运商贸与城市更新。夜幕降临时，江风、灯影与沿岸建筑共同勾勒福州的现代轮廓。",
        image: "./assets/images/zhongzhoudao.png",
        category: "culture",
        detail: {
            bestTime: "建议游玩 1-2 小时",
            location: "福州市台江区闽江中洲岛",
            reason: "这里适合从江面视角感受福州商贸记忆与城市夜色。",
            tips: "夜景更出片，江边风较明显，秋冬夜游建议多带一件外套。"
        }
    },
    {
        id: "yuwan",
        tag: "舌尖福州",
        title: "福州鱼丸",
        subtitle: "一口弹嫩鲜润的市井温度",
        description: "福州味道讲究鲜、柔、润。鱼丸外皮弹嫩、内馅鲜香，从街边热汤到家常餐桌，都能让人感受到这座城市对“鲜”的执着。",
        image: "./assets/images/yuwan.png",
        category: "food",
        detail: {
            bestTime: "适合早餐或午后小食",
            location: "福州老字号小吃店与街巷汤铺",
            reason: "鱼丸是福州味道里最日常也最鲜活的一口，弹嫩中带着汤香。",
            tips: "趁热吃最能感受汤底清鲜，也可以搭配锅边或拌面一起尝。"
        }
    },
    {
        id: "rouyan",
        tag: "细味风华",
        title: "肉燕",
        subtitle: "薄韧如燕的手作功夫",
        description: "肉燕以肉为皮，薄而有韧，入口轻巧却回味绵长。它藏着福州人对精细手艺的讲究，也藏着一碗热汤里的待客心意。",
        image: "./assets/images/rouyan.png",
        category: "food",
        detail: {
            bestTime: "适合早餐、夜宵或轻食",
            location: "福州传统小吃店",
            reason: "肉燕体现了福州饮食对细腻口感和手作功夫的追求。",
            tips: "可点一碗肉燕汤慢慢尝，感受燕皮的薄韧和汤头的温润。"
        }
    },
    {
        id: "fotiaoqiang",
        tag: "宴席名菜",
        title: "佛跳墙",
        subtitle: "山海珍味汇成一坛醇香",
        description: "佛跳墙层次丰厚、香气沉稳，是福州菜华丽而内敛的一面。慢火煨出的鲜香，把闽都宴席的郑重与体面浓缩其中。",
        image: "./assets/images/fotiaoqiang.png",
        category: "food",
        detail: {
            bestTime: "适合正餐或宴席体验",
            location: "福州闽菜餐厅",
            reason: "佛跳墙汇聚山海珍味，是闽菜中最具仪式感的代表之一。",
            tips: "建议提前预订，慢慢品尝汤香层次；多人同行更适合点一坛共享。"
        }
    }
];

module.exports = featuredCards;
