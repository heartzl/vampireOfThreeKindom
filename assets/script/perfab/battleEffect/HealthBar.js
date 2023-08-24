const zl = require("zl");
cc.Class({
    extends: cc.Component,

    // 依赖预制及其他属性
    properties: {
    },

    onLoad(){
        this.hpProgress = cc.find('hpProgress', this.node).getComponent(cc.ProgressBar);
        this.objType = zl.Constant.NODE_TYPE_HIT_LABEL;
    },

    updateBar(pos, num){
        this.node.setPosition(pos);
        if(this.hpPercent && this.hpPercent === num){
            return;
        }
        this.hpPercent = num;
        this.node.active = this.hpPercent > 0;
        this.hpProgress.progress = this.hpPercent;
    },

    update (dt) {
    },
});