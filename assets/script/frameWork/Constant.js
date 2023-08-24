let Constant = {
    // 模拟方式
    MODE_PHYSICS: 1,                    // 物理
    MODE_SIMULATE: 2,                   // 曲线

    // 测试模式
    SCENE_MOVE: 1,                      // 跳跃
    SCENE_JUMP: 2,                      // 跳跃

    // 加载路径
    SPINE_PATH_ENEMY: "effect/enemy/",  // 敌人的spine
    SPINE_PATH_HERO: "effect/hero/",    // 英雄的spine
    PREFAB_PATH_SKILL: "prefab/skill/", // 技能特效的预制

    // 游戏状态
    GAME_STATE_LOAD: 1,                 // 加载中
    GAME_STATE_START: 2,                // 开始
    GAME_STATE_OVER: 3,                 // 结束

    // 精灵类型
    NODE_TYPE_HERO: 1,                  // 英雄
    NODE_TYPE_ENEMY: 2,                 // 敌人
    NODE_TYPE_BULLET: 3,                // 子弹
    NODE_TYPE_SKILL: 4,                 // 技能
    NODE_TYPE_HIT_LABEL: 5,             // 伤害文字
    NODE_TYPE_HIT_EFFECT: 6,            // 伤害特效

    // 飘字类型
    LABEL_TYPE_RECOVER: 1,              // 恢复
    LABEL_TYPE_INJURY: 2,               // 受伤

    // 角色状态
    ROLE_STAND: 1,                       // 站立
    ROLE_MOVE: 2,                        // 移动
    ROLE_ATTACK: 3,                      // 近战攻击
    ROLE_SHOOT: 4,                       // 射击
    ROLE_SKILL: 5,                       // 释放技能
    ROLE_DIE: 6,                         // 死亡

    // 角色方向
    ROLE_DIR_LEFT: 1,                    // 左
    ROLE_DIR_RIGHT: 2,                   // 右

    // 子弹状态
    BULLET_MOVE: 1,                      // 飞行
    BULLET_HIT: 2,                       // 击中

    // 子弹种类
    BULLET_TYPE_ORB: 1,                  // 法球(追踪,单体)
    BULLET_TYPE_MISSILE: 2,              // 导弹(追踪，群体)
    BULLET_TYPE_ARROW: 3,                // 箭矢(非追踪，单体)
    BULLET_TYPE_SHELL: 4,                // 炮弹(非追踪，群体)

    // 技能种类
    SKILL_TYPE_TARGETED: 1,              // 指向性技能
    SKILL_TYPE_NON_TARGETED: 2,          // 非指向性技能

    // 渲染层级 （数越大层级越高）
    LAYER_BG: 1,                          // 背景图层
    LAYER_BG_ELEMENT: 2,                  // 背景元素层
    LAYER_HERO: 10,                       // 英雄
    LAYER_ENEMY: 20,                      // 敌人
    LAYER_BULLET: 30,                     // 子弹
    LAYER_SHOW_INFO: 40,                  // 各种提示信息显示层

    // 英雄名
    HERO_NAME_ZHUGELIANG: 1,    // 诸葛亮
    HERO_NAME_GUANYU: 2             // 关羽

};
module.exports = Constant;