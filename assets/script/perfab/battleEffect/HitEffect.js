const zl = require("zl");
cc.Class({
    extends: cc.Component,

    // 依赖预制及其他属性
    properties: {
    },

    onLoad(){
        this.hitAnim = this.node.getComponent(cc.Animation);
        this.objType = zl.Constant.NODE_TYPE_HIT_EFFECT;
        this.registerListeners();
    },

    registerListeners(){
        this.hitAnim.on('finished', this.remove, this);
    },

    show(type){
        if(type === zl.Constant.ROLE_SHOOT){
            this.hitAnim.play('pvpHit2');
        }
        else if(type === zl.Constant.ROLE_ATTACK){
            this.hitAnim.play('pvpHit1');
        }
    },

    remove(){
        this.host.removeObj(this);
    },

    update (dt) {
    },
});