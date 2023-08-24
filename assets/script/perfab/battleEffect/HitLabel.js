const zl = require("zl");
cc.Class({
    extends: cc.Component,

    // 依赖预制及其他属性
    properties: {
    },

    onLoad(){
        this.hitNode =  cc.find('layout1', this.node);
        this.recoverNode = cc.find('layout2', this.node);
        this.hitLabel = cc.find('layout1/damageNum', this.node).getComponent(cc.Label);
        this.recoverLabel = cc.find('layout2/recoverNum', this.node).getComponent(cc.Label);
        this.node.scale = 0;
        this.objType = zl.Constant.NODE_TYPE_HIT_LABEL;
    },

    show(type, pos, num){
        this.node.setPosition(pos);
        this.node.active = true;
        this.node.runAction(cc.fadeIn());
        switch(type){
            case zl.Constant.LABEL_TYPE_RECOVER:
                this.hitNode.active = false;
                this.recoverNode.active = true;
                this.recoverLabel.string = '+' + num;
                break;
            case zl.Constant.LABEL_TYPE_INJURY:
                this.hitNode.active = true;
                this.recoverNode.active = false;
                this.hitLabel.string = '-' + num;
                break;
        }
        let jump = cc.jumpBy(0.2, cc.v2(0, 20), 30, 1);
        let scale = cc.scaleTo(0.1, 1);
        let hide = cc.fadeOut(0.1);
        let self = this;
        let callback = cc.callFunc(function () {
            self.node.active = false;
            self.host.removeObj(self);
        })
        let spawn = cc.spawn(jump, scale);
        let seq = cc.sequence(spawn, hide, callback);
        this.node.runAction(seq);
    },

    update (dt) {
    },
});