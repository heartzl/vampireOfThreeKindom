const zl = require("zl");
cc.Class({
    extends: cc.Component,

    properties: {
        loadingPagePrefab: {
            default: null,
            type: cc.Prefab
        },
        // 指针
        targetSignPrefab: {
            default: null,
            type: cc.Prefab
        },
        // 伤害字符
        hitLabelPrefab: {
            default: null,
            type: cc.Prefab
        },
        // 伤害特效
        hitEffectPrefab: {
            default: null,
            type: cc.Prefab
        },
        // 血条
        healthBarPrefab: {
            default: null,
            type: cc.Prefab
        },
        // 英雄
        heroPrefab: {
            default: null,
            type: cc.Prefab
        },

        // 敌人
        enemyPrefab: {
            default: null,
            type: cc.Prefab
        },

        // 子弹
        bulletPrefab: {
            default: null,
            type: cc.Prefab
        },

        // 技能
        skillPrefab: {
            default: null,
            type: cc.Prefab
        },
    },

    onLoad: function () {
        this.herBirthNode = cc.find('heroBirth', this.node);
        this.bg = cc.find('battleNode', this.node);
        this.showEnemyTimer = 0;
        this.registerListeners();
        this.initScene();
    },

    registerListeners(){
        this.bg.on(cc.Node.EventType.TOUCH_START, this.onClickHeroGoTo, this);
    },

    initScene(){
        this.gameState = zl.Constant.GAME_STATE_LOAD;
        this.initProgress = 0;
        this.showLoadPage();
        this.hero = null;
        this.heroList = [];
        this.enemyPool = [];
        this.enemyList = [];
        this.bulletPool = [];
        this.bulletList = [];
        this.hitLabelPool = [];
        this.hitEffectPool = [];
        this.healthBarPool = [];
        this.skillList = [];
        this.skillPool = [];
        this.skillEffectMap = {};
        this.maxEnemyNum = 10;
        this.showEnemyInterval = 1; // s
        this.enemyBirthPosList = [cc.v2(100, 120), cc.v2(200, 120), cc.v2(-100, 120), cc.v2(-200, 120)];
        this.initSkillPrefabMap();
        this.initPool();
        this.initHero();
        this.initTarget();
        this.addInitProgress(34);
    },

    showLoadPage(){
        let loadingPge = cc.instantiate(this.loadingPagePrefab);
        this.node.addChild(loadingPge);
        this.loadingObj = loadingPge.getComponent('LoadingPage');
    },

    onClickQuit(){
        cc.director.loadScene("MainMenu");
    },

    initSkillPrefabMap(){
        let heroId = zl.player.battleModule.getChooseHero();
        let heroInfo = zl.templateManager.getHeroCfgById(heroId);
        let skillName = zl.templateManager.getSkillCfgById(heroInfo.skillId).prefabName;
        this.skillEffectList = [skillName];
        for(let i = 0; i < this.skillEffectList.length; i++){
            let skillName = this.skillEffectList[i]
            let path = zl.Constant.PREFAB_PATH_SKILL + skillName;
            let self = this;
            cc.resources.load(path, cc.Prefab, (err, prefab) => {
                if (err) {
                    cc.log("==== load prefab error: ====\n");
                    return;
                }
                if (!this.node || !this.node.active) {
                    return;
                }
                this.skillEffectMap[skillName] = prefab;
                if(i === this.skillEffectList.length - 1){
                    self.addInitProgress(33);
                }
            });
        }
    },

    initPool(){
        for(let i = 0; i < 5; i++) {
            let enemy = cc.instantiate(this.enemyPrefab);
            this.bg.addChild(enemy);
            enemy.zIndex = zl.Constant.LAYER_ENEMY;
            enemy.active = false;
            this.enemyPool.push(enemy);
        }

        for(let i = 0; i < 5; i++) {
            let bullet = cc.instantiate(this.bulletPrefab);
            this.bg.addChild(bullet);
            bullet.zIndex = zl.Constant.LAYER_BULLET;
            bullet.active = false;
            this.bulletPool.push(bullet);
        }

        for(let i = 0; i < 2; i++) {
            let skill = cc.instantiate(this.skillPrefab);
            this.bg.addChild(skill);
            skill.zIndex = zl.Constant.LAYER_BULLET;
            skill.active = false;
            this.skillPool.push(skill);
        }

        for(let i = 0; i < 8; i++){
            let hitLabel = cc.instantiate(this.hitLabelPrefab);
            this.bg.addChild(hitLabel);
            hitLabel.zIndex = zl.Constant.LAYER_SHOW_INFO;
            hitLabel.active = false;
            this.hitLabelPool.push(hitLabel);
        }

        for(let i = 0; i < 8; i++){
            let hitEffect = cc.instantiate(this.hitEffectPrefab);
            this.hitEffectPool.push(hitEffect);
        }

        for(let i = 0; i < 100; i++){
            let healthBar = cc.instantiate(this.healthBarPrefab);
            this.bg.addChild(healthBar);
            healthBar.zIndex = zl.Constant.LAYER_SHOW_INFO;
            healthBar.active = false;
            this.healthBarPool.push(healthBar);
        }

        this.addInitProgress(33);
    },

    initHero(){
        let heroNode = cc.instantiate(this.heroPrefab);
        this.bg.addChild(heroNode);
        heroNode.zIndex = zl.Constant.LAYER_HERO;
        this.hero = heroNode.getComponent('Hero');
        let heroId = zl.player.battleModule.getChooseHero();
        this.hero.host = this;
        this.hero.initData(heroId);
        this.hero.node.setPosition(this.herBirthNode.position);
        this.heroList.push(this.hero);
    },

    initTarget(){
        let target = cc.instantiate(this.targetSignPrefab);
        this.bg.addChild(target);
        target.zIndex = zl.Constant.LAYER_BG_ELEMENT;
        target.active = false;
        this.targetSign = target.getComponent('TargetSign');
    },

    addInitProgress(num){
        if(typeof num === 'string'){
            num = parseInt(num);
        }
        if(this.initProgress >= 100){
            return;
        }
        this.initProgress += num;
        this.loadingObj.addLoadNum(num);
        if(this.initProgress >= 100){
            this.loadingObj.node.active = false;
            this.gameState = zl.Constant.GAME_STATE_START;
        }
    },

    addSkill(id, position, origin, target){
        let skill = null;
        if(this.skillPool.length > 0){
            skill = this.skillPool.pop();
        }
        else {
            skill = cc.instantiate(this.skillPrefab);
            this.bg.addChild(skill);
            skill.zIndex = zl.Constant.LAYER_BULLET;
        }
        let skillObj = skill.getComponent("Skill");
        skillObj.host = this;
        skillObj.initData(id, position, origin, target);
        this.skillList.push(skill);
    },

    addBullet(id, position, origin, target){
        let bullet = null;
        if(this.bulletPool.length > 0){
            bullet = this.bulletPool.pop();
        }
        else {
            bullet = cc.instantiate(this.bulletPrefab);
            this.bg.addChild(bullet);
            bullet.zIndex = zl.Constant.LAYER_BULLET;
        }
        let bulletObj = bullet.getComponent("Bullet");
        bulletObj.host = this;
        bulletObj.initData(id, position, origin, target);
        this.bulletList.push(bulletObj);
    },

    addEnemy(){
        let index = zl.Utils.randomInt(0, 3);
        let birthPos = this.enemyBirthPosList[index];
        let enemy = null;
        if(this.enemyPool.length > 0){
            enemy = this.enemyPool.pop();
        }
        else {
            enemy = cc.instantiate(this.enemyPrefab);
            enemy.zIndex = zl.Constant.LAYER_ENEMY;
            this.bg.addChild(enemy);
        }
        let info = zl.templateManager.getEnemyCfgById(1);
        let enemyObj = enemy.getComponent("Enemy");
        enemy.active = true;
        enemy.setPosition(birthPos);
        enemyObj.host = this;
        enemyObj.initData(info);
        this.enemyList.push(enemyObj);
    },

    getHitLabel(){
        let label = new cc.Node();
        if(this.hitLabelPool.length > 0){
            label = this.hitLabelPool.pop();
        }
        else {
            label = cc.instantiate(this.hitLabelPrefab);
            this.bg.addChild(label);
            label.zIndex = zl.Constant.LAYER_SHOW_INFO;
        }
        return label;
    },

    getHitEffect(){
        let effect = new cc.Node();
        if(this.hitEffectPool.length > 0){
            effect = this.hitEffectPool.pop();
        }
        else {
            effect = cc.instantiate(this.hitEffectPrefab);
        }
        return effect;
    },

    getHealthBar(){
        let bar = new cc.Node();
        if(this.healthBarPool.length > 0){
            bar = this.healthBarPool.pop();
        }
        else {
            bar = cc.instantiate(this.healthBarPrefab);
            this.bg.addChild(bar);
            bar.zIndex = zl.Constant.LAYER_SHOW_INFO;
        }
        return bar;
    },

    removeObj(obj){
        obj.node.active = false;
        switch (obj.objType) {
            case zl.Constant.NODE_TYPE_BULLET:
                for(let i = 0; i < this.bulletList.length; i++){
                    let bullet = this.bulletList[i];
                    if(bullet === obj){
                        this.bulletList.splice(i ,1);
                        break;
                    }
                }
                this.bulletPool.push(obj.node);
                break;
            case zl.Constant.NODE_TYPE_ENEMY:
                for(let i = 0; i < this.enemyList.length; i++){
                    let enemy = this.enemyList[i];
                    if(enemy === obj){
                        this.enemyList.splice(i ,1);
                        break;
                    }
                }
                this.enemyPool.push(obj.node);
                break;
            case zl.Constant.NODE_TYPE_HERO:
                obj.isDead = true;
                break;
            case zl.Constant.NODE_TYPE_SKILL:
                obj.effect.removeFromParent();
                this.skillPool.push(obj.node);
                break;
            case zl.Constant.NODE_TYPE_HIT_LABEL:
                this.hitLabelPool.push(obj.node);
                break;
            case zl.Constant.NODE_TYPE_HIT_EFFECT:
                obj.node.removeFromParent();
                this.hitEffectPool.push(obj.node);
                break;
        }
    },

    onClickHeroGoTo(event){
        if(this.gameState !== zl.Constant.GAME_STATE_START){
            return;
        }
        if(this.hero.getState() === zl.Constant.ROLE_DIE){
            return;
        }
        let touchLoc = event.getLocation();
        let inNodeLoc = this.bg.convertToNodeSpaceAR(touchLoc);
        this.hero.setDestination(inNodeLoc);
        this.targetSign.show(inNodeLoc);
    },

    updateHero(dt){
        this.hero.updatePos(dt);
    },

    updateBullet(dt){
        for(let i = 0; i < this.bulletList.length; i++){
            let bullet = this.bulletList[i];
            bullet.updatePos(dt);
        }
    },

    updateEnemy(dt){
        for(let i = 0; i < this.enemyList.length; i++){
            let enemy = this.enemyList[i];
            enemy.updatePos(dt);
        }
    },

    checkBorder(position, r) {
        let borderTop = cc.winSize.height / 2;
        let borderBottom = -borderTop;
        let borderRight = cc.winSize.width / 2;
        let borderLeft = -borderRight;

        return position.y + r > borderTop ||
            position.y - r < borderBottom ||
            position.x + r > borderRight ||
            position.x - r < borderLeft;
    },


    checkHeroHitEnemy(){
        let heroState = this.hero.getState();
        if(!heroState || heroState === zl.Constant.ROLE_MOVE || heroState === zl.Constant.ROLE_SKILL){
            return;
        }
        for(let i = 0; i < this.enemyList.length; i++) {
            let enemy = this.enemyList[i];
            let enemyState = enemy.getState();
            if(!enemyState || enemyState === zl.Constant.ROLE_DIE){
                continue;
            }
            let dis = zl.Utils.getDistanceByTwoPoints(enemy.node.position, this.hero.node.position);
            let isAttack = dis < this.hero.meleeRadius + enemy.volRadius;
            let isShoot = dis < this.hero.shootRadius + enemy.volRadius;
            let isReadySkill = this.hero.getIsReadySkill();
            if(isReadySkill && (isShoot || isAttack)){
                this.hero.skill(enemy);
                break;
            }

            if (isAttack) {
                this.hero.melee(enemy);
                break;
            }

            if(isShoot){
                this.hero.shoot(enemy);
                break;
            }
        }
    },

    checkEnemyHitHero(){
        for(let i = 0; i < this.enemyList.length; i++) {
            let enemy = this.enemyList[i];
            let enemyState = enemy.getState();
            if(!enemyState || enemyState === zl.Constant.ROLE_DIE){
                continue;
            }
            let dis = zl.Utils.getDistanceByTwoPoints(enemy.node.position, this.hero.node.position);
            let isAttack = dis <= enemy.meleeRadius + this.hero.volRadius;
            if (isAttack) {
                enemy.melee(this.hero);
            }

            let isShoot = dis <= enemy.shootRadius + this.hero.volRadius;
            if(isShoot){
                enemy.shoot(this.hero);
            }

        }
    },

    update(dt){
        if(this.gameState !== zl.Constant.GAME_STATE_START){
            return;
        }
        if(this.gameState === zl.Constant.GAME_STATE_START){
            if(this.enemyList.length < this.maxEnemyNum){
                this.showEnemyTimer += dt;
                if(this.showEnemyTimer > this.showEnemyInterval){
                    this.showEnemyTimer -= this.showEnemyInterval;
                    this.addEnemy();
                }
            }
            this.updateHero(dt);
            this.updateEnemy(dt);
            this.updateBullet(dt);
            let heroState = this.hero.getState();
            if(heroState && heroState !== zl.Constant.ROLE_DIE){
                this.checkHeroHitEnemy();
                this.checkEnemyHitHero();
            }
        }
    },
})