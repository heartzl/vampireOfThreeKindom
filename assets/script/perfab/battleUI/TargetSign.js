const zl = require("zl");
cc.Class({
    extends: cc.Component,

    // 依赖预制及其他属性
    properties: {
    },

    onLoad(){
        this.base = cc.find('base', this.node);
        this.arrow = cc.find('arrow', this.node);
        this.arrowStartPos = this.arrow.position;
        this.base.scale = 0;
        this.arrow.scale = 0;
    },

    show(pos){
        this.node.active = true;
        this.node.stopAllActions();
        if(!this._isInRest){
            this.reset();
        }
        this.node.setPosition(pos);
        this.node.runAction(cc.fadeIn(0));

        let arrowMove = cc.jumpTo(0.2, cc.v2(this.arrowStartPos.x, this.arrowStartPos.y - 10), 20, 1);
        let arrowScale = cc.scaleTo(0.1, 1);
        let spawn = cc.spawn(arrowMove, arrowScale);

        let baseScale = cc.scaleTo(0.3, 1.2);
        let delay = cc.delayTime(0.1);
        let callback = cc.callFunc(function () {
            this.hide();
        }, this);
        let seq = cc.sequence(baseScale, delay, callback);
        this.arrow.runAction(spawn);
        this.base.runAction(seq);
    },

    hide(){
        let hide = cc.fadeOut(0.1);
        let callback = cc.callFunc(function () {
            this._isInRest = true;
            this.reset();
        }, this);
        let seq = cc.sequence(hide, callback);
        this.node.runAction(seq);
    },

    reset(){
        this.base.scale = 0;
        this.arrow.scale = 0;
        this.arrow.setPosition(this.arrowStartPos);
        this._isInRest = false;
    },

    update (dt) {
    },
});