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
        this.bg = cc.find('bg', this.node);
        this.loadingCircle = cc.find('loading', this.node);
        this.loadingNumLable = cc.find('loadNum', this.node).getComponent(cc.Label);
        this.rotatingRate = 4;
        this.loadingNum = 0;
        this.loadingNumLable.string = this.loadingNum + '%';
    },

    updateCircle(dt){
        this.loadingCircle.angle += this.rotatingRate;
    },

    addLoadNum(num){
        this.loadingNum += num;
        this.loadingNumLable.string = this.loadingNum  + '%';
    },

    update(dt) {
        this.updateCircle();
    },
});