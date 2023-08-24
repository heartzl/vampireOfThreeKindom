const zl = require("zl");
cc.Class({
    extends: cc.Component,

    // 依赖预制及其他属性
    properties: {
        headPrefab:{
            default: null,
            type: cc.Prefab
        }
    },

    onLoad(){
        this.headContent = cc.find('heroHeadContent', this.node);
        this.bg = cc.find('bg', this.node);
        this.registerListeners()
        this.init();
    },

    registerListeners(){
        this.headContent.on('chooseHero', this.updateChooseHero, this);
    },

    init(){
        this.loadPlayer();
        this.loadTemplate();
    },

    loadPlayer(){
        zl.player.init();
    },

    loadTemplate() {
        let self = this;
        this.loadTemplateFinish = false;
        cc.resources.loadDir("template", cc.JsonAsset, (err, jsonList) => {
            for (let i = 0; i < jsonList.length; i++) {
                let jsonName = jsonList[i].name;
                zl.JsonData[jsonName] = jsonList[i].json;
            }
            zl.templateManager.init();
            self.initHeroInfo();
            this.loadTemplateFinish = true;
        });
    },

    initHeroInfo(){
        this.heroInfoList = zl.templateManager.getHeroCfgList();
        this.loadHeadIndex = 0;
    },

    onClickClose(){
        this.node.active = false;
    },

    onClickEnterBattle(){
        zl.player.battleModule.setChooseHero(this.chooseHeroId);
        cc.director.loadScene("Battle");
    },

    updateChooseHero(event){
        event.stopPropagation();
        this.chooseHeroId = event.getUserData();
        let children = this.headContent.children;
        for(let i = 0; i < children.length; i++){
            let node = children[i];
            let headObj = node.getComponent('Head');
            headObj.cancel(this.chooseHeroId);
        }
    },

    update(dt) {
        if(!this.loadTemplateFinish){
            return;
        }
        if(this.loadHeadFinish){
            return;
        }
        let heroInfo = this.heroInfoList[this.loadHeadIndex];
        let head = cc.instantiate(this.headPrefab);
        let headObj = head.getComponent('Head');
        this.headContent.addChild(head);
        headObj.host = this;
        headObj.init(heroInfo.id);
        this.loadHeadIndex ++;
        if(this.loadHeadIndex === this.heroInfoList.length){
            this.loadHeadFinish = true;
        }
    },
});