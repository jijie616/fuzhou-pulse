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
    },
    {
        id: "wushan",
        tag: "古城山色",
        title: "乌山",
        subtitle: "榕城三山之一的摩崖记忆",
        description: "乌山与于山、屏山并称榕城三山，山不高却层层藏景。摩崖石刻、古榕老树与城市街巷相互映照，适合用一段轻松步行感受福州老城的山水气质。",
        image: "./assets/images/fuzhou_cover.jpg",
        category: "history",
        detail: {
            bestTime: "建议游玩 1-2 小时",
            location: "福州市鼓楼区乌山路一带",
            reason: "乌山适合串联古城历史、摩崖石刻和城市眺望，是理解福州“三山两塔”格局的好入口。",
            tips: "山路相对轻松，适合上午或傍晚前往；雨后石阶可能湿滑，建议穿防滑鞋。"
        }
    },
    {
        id: "fujian-museum",
        tag: "闽都文脉",
        title: "福建博物院",
        subtitle: "从海丝到闽越的文化窗口",
        description: "福建博物院用展陈讲述八闽大地的历史、海洋文化与民俗记忆。它适合在慢节奏旅行中安排半天，帮助游客把福州放进更广阔的福建文化脉络里理解。",
        image: "./assets/images/fuzhou_cover.jpg",
        category: "history",
        detail: {
            bestTime: "建议游玩 2-3 小时",
            location: "福州市鼓楼区湖头街96号",
            reason: "这里适合系统了解福建历史、闽越文化、海丝交流和地方民俗。",
            tips: "建议提前关注开放时间和展览安排；可与西湖公园、左海一带组合游览。"
        }
    },
    {
        id: "xichan-temple",
        tag: "古寺钟声",
        title: "西禅寺",
        subtitle: "城西古刹里的清静片刻",
        description: "西禅寺是福州著名古寺之一，寺院空间开阔，香火与园林气息相融。相比热闹商圈，这里更适合放慢脚步，体验福州城市中的清静一面。",
        image: "./assets/images/fuzhou_cover.jpg",
        category: "history",
        detail: {
            bestTime: "建议游玩 1-2 小时",
            location: "福州市鼓楼区工业路附近",
            reason: "西禅寺体现了福州宗教文化、古寺建筑和城市日常生活的交汇。",
            tips: "进入寺院请保持安静，尊重礼佛空间；适合与附近高校或老街区顺路安排。"
        }
    },
    {
        id: "mawei-shipyard",
        tag: "船政风云",
        title: "马尾船政文化景区",
        subtitle: "近代工业与海军记忆的起点",
        description: "马尾船政文化景区记录了中国近代船政、海军教育与工业启蒙的重要篇章。它让福州不只是一座古城，也是一座面向海洋、拥抱现代化的城市。",
        image: "./assets/images/fuzhou_cover.jpg",
        category: "culture",
        detail: {
            bestTime: "建议游玩 2-3 小时",
            location: "福州市马尾区昭忠路一带",
            reason: "这里适合了解船政文化、近代工业史和福州的海洋城市气质。",
            tips: "距离主城区较远，建议预留交通时间；可提前查询展馆开放安排。"
        }
    },
    {
        id: "minjiang-night-cruise",
        tag: "闽江夜色",
        title: "闽江夜游",
        subtitle: "从水面看见福州灯火",
        description: "闽江夜游把桥梁、江岸、灯光和城市天际线串联起来。坐在船上看两岸灯火铺开，能感受到福州温柔而现代的一面。",
        image: "./assets/images/fuzhou_cover.jpg",
        category: "culture",
        detail: {
            bestTime: "建议傍晚至夜间体验",
            location: "闽江沿线码头",
            reason: "夜游适合从江面视角理解福州城市更新、滨江景观和夜间氛围。",
            tips: "建议提前确认航班时间和天气；江风明显，秋冬夜间可多带外套。"
        }
    },
    {
        id: "fudao",
        tag: "森林步道",
        title: "福道",
        subtitle: "把城市和山林连在一起",
        description: "福道穿行在城市山体和森林之间，用高架步道连接公园、山林与城市视野。这里适合轻徒步、拍照和呼吸绿色空气，是福州自然休闲的代表体验。",
        image: "./assets/images/fuzhou_cover.jpg",
        category: "culture",
        detail: {
            bestTime: "建议游玩 1.5-3 小时",
            location: "福州市鼓楼区金牛山、梅峰山一带",
            reason: "福道体现了福州山水入城、公园城市和慢行生活的特色。",
            tips: "步道较长，建议按体力选择入口和路段；晴天注意防晒，傍晚光线更适合拍照。"
        }
    },
    {
        id: "west-lake-park",
        tag: "湖光榕影",
        title: "西湖公园",
        subtitle: "福州人散步赏景的日常湖面",
        description: "西湖公园历史悠久，湖面、亭桥、榕荫和周边文化设施构成了温和的城市风景。这里不追求刺激，却很能体现福州生活的松弛感。",
        image: "./assets/images/fuzhou_cover.jpg",
        category: "culture",
        detail: {
            bestTime: "建议游玩 1-2 小时",
            location: "福州市鼓楼区湖滨路",
            reason: "西湖公园适合感受福州慢生活、湖畔景观和市民日常。",
            tips: "可与福建博物院组合安排；清晨和傍晚更有生活气息。"
        }
    },
    {
        id: "gushan",
        tag: "登高望江",
        title: "鼓山",
        subtitle: "从山海之间眺望榕城",
        description: "鼓山是福州经典登高目的地，山路、古寺、摩崖石刻和城市远景都很有代表性。想看福州的山水格局，鼓山是很稳妥的一站。",
        image: "./assets/images/fuzhou_cover.jpg",
        category: "culture",
        detail: {
            bestTime: "建议游玩半天",
            location: "福州市晋安区鼓山风景区",
            reason: "鼓山适合登高、访古寺、看摩崖石刻，也能从高处理解福州山水城市格局。",
            tips: "可选择徒步或索道，根据体力安排；夏季注意防晒补水。"
        }
    },
    {
        id: "jinjishan-park",
        tag: "城市绿肺",
        title: "金鸡山公园",
        subtitle: "栈道、林荫与城市天际线",
        description: "金鸡山公园有森林步道、观景平台和城市视野，是市区里很适合散步放松的绿色空间。它让福州的自然感变得触手可及。",
        image: "./assets/images/fuzhou_cover.jpg",
        category: "culture",
        detail: {
            bestTime: "建议游玩 1.5-2.5 小时",
            location: "福州市晋安区金鸡山路",
            reason: "这里适合轻徒步、看城市景观，也适合亲子和朋友慢走聊天。",
            tips: "部分路段有坡度，建议穿舒适鞋；傍晚视野和光线更柔和。"
        }
    },
    {
        id: "daming-food-street",
        tag: "夜宵烟火",
        title: "达明美食街",
        subtitle: "把福州夜晚吃得热闹一点",
        description: "达明美食街聚集了许多小吃、夜宵和年轻人喜欢的街头味道。它不一定最传统，却很能代表福州夜晚的热闹和松弛。",
        image: "./assets/images/fuzhou_cover.jpg",
        category: "food",
        detail: {
            bestTime: "适合傍晚到夜间",
            location: "福州市鼓楼区达明路一带",
            reason: "这里适合集中体验福州小吃、夜宵氛围和城市烟火气。",
            tips: "人流较多，建议错峰；可以少量多样尝试，给后续正餐留空间。"
        }
    },
    {
        id: "old-fuzhou-snacks",
        tag: "街巷小吃",
        title: "老福州小吃",
        subtitle: "锅边、芋泥和拌面的日常味道",
        description: "老福州小吃不只是一道菜，而是一组城市味觉记忆。锅边、芋泥、拌面、花生汤等共同构成了福州人从早到晚的温柔日常。",
        image: "./assets/images/fuzhou_cover.jpg",
        category: "food",
        detail: {
            bestTime: "适合早餐、下午茶或夜宵",
            location: "老城区小吃店、传统饭铺和街巷餐馆",
            reason: "这类小吃能帮助游客从日常饮食里理解福州的清鲜、细腻和家常感。",
            tips: "建议点小份多尝几种；若口味偏淡，可先从锅边、肉燕、鱼丸开始。"
        }
    },
    {
        id: "jasmine-tea",
        tag: "茉莉清香",
        title: "茉莉花茶体验",
        subtitle: "一盏茶里的榕城气息",
        description: "福州茉莉花茶以茶香与花香交融著称，是福州很有辨识度的城市味道。通过闻香、冲泡和品饮，可以感受这座城市温润细致的一面。",
        image: "./assets/images/fuzhou_cover.jpg",
        category: "food",
        detail: {
            bestTime: "适合下午或雨天慢体验",
            location: "福州茶空间、非遗体验点或老字号茶店",
            reason: "茉莉花茶连接了福州的气候、花事、茶工艺和待客方式。",
            tips: "适合安排在行程中段休息；可选茶空间慢坐，也可以带一份茶作为伴手礼。"
        }
    }
];

module.exports = featuredCards;
