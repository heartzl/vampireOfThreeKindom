const zl = require("zl");

zl.TemplateManager = cc.Class({
    extends:cc.Object,

    properties: {
        heroMap: null,
        heroList: null,
        enemyMap: null,
        bulletMap: null,
        skillMap: null,
    },

    statics:{
        _instance: null,
        getInstance: function() {
            if (!this._instance) {
                this._instance = new zl.TemplateManager();
            }
            return this._instance;
        }
    },

    init: function () {
        this.initHeroCfg();
        this.initEnemyCfg();
        this.initBulletCfg();
        this.initSkillCfg();
    },

    initHeroCfg(){
        this.heroMap = {}
        this.heroList = [];
        for(let i = 0; i < zl.JsonData.Hero.length; i++){
            let heroData = zl.JsonData.Hero[i];
            this.heroMap[heroData.id] = heroData;
            this.heroList.push(heroData);
        }
    },

    getHeroCfgById(id){
        return this.heroMap[id] ? this.heroMap[id] : null;
    },

    getHeroCfgList(){
        return this.heroList;
    },

    initEnemyCfg(){
        this.enemyMap = {}
        for(let i = 0; i < zl.JsonData.Enemy.length; i++){
            let enemyData = zl.JsonData.Enemy[i];
            this.enemyMap[enemyData.id] = enemyData;
        }
    },

    getEnemyCfgById(id){
        return this.enemyMap[id] ? this.enemyMap[id] : null;
    },

    initBulletCfg(){
        this.bulletMap = {}
        for(let i = 0; i < zl.JsonData.Bullet.length; i++){
            let bulletData = zl.JsonData.Bullet[i];
            this.bulletMap[bulletData.id] = bulletData;
        }
    },

    getBulletCfgById(id){
        return this.bulletMap[id] ? this.bulletMap[id] : null;
    },

    initSkillCfg(){
        this.skillMap = {}
        for(let i = 0; i < zl.JsonData.Skill.length; i++){
            let skillData = zl.JsonData.Skill[i];
            this.skillMap[skillData.id] = skillData;
        }
    },

    getSkillCfgById(id){
        return this.skillMap[id] ? this.skillMap[id] : null;
    },

    getHeroMeleeDelay(id){
        switch (id) {
            case zl.Constant.HERO_NAME_ZHUGELIANG:
                return 7 / 30;
            case zl.Constant.HERO_NAME_GUANYU:
                return 7 / 30;
        }
    },

    getHeroShootDelay(id){
        switch (id) {
            case zl.Constant.HERO_NAME_ZHUGELIANG:
                return 7 / 30;
            case zl.Constant.HERO_NAME_GUANYU:
                return 0;
        }

    },

    getHeroSkillDelay(id){
        switch (id) {
            case zl.Constant.HERO_NAME_ZHUGELIANG:
                return 7 / 30;
            case zl.Constant.HERO_NAME_GUANYU:
                return 15 / 30;
        }

    },
});

zl.templateManager = zl.TemplateManager.getInstance();