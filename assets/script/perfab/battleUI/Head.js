const zl = require("zl");
cc.Class({
    extends: cc.Component,

    // 依赖预制及其他属性
    properties: {
        headAtlas:{
            default: null,
            type: cc.SpriteAtlas
        }
    },

    onLoad(){
        this.headBg = cc.find('headBg', this.node).getComponent(cc.Sprite);
        this.chooseLight = cc.find('chooseLight', this.node);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClickHead, this);
    },

    init(id){
        this.id = id;
        let heroData = zl.templateManager.getHeroCfgById(id);
        this.headBg.spriteFrame = this.headAtlas.getSpriteFrame(heroData.headName);
        this.chooseLight.active = false;
    },

    cancel(id){
        if(this.id !== id){
            this.chooseLight.active = false;
        }
    },

    onClickHead(){
        this.chooseLight.active = true;
        let newEvent = new cc.Event.EventCustom('chooseHero', true);
        newEvent.setUserData(this.id);
        this.node.dispatchEvent(newEvent);
    },

    update(dt) {
    },
});