const zl = require("zl");
cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {
        this.skillBody = cc.find('body', this.node);
    },

    /**
     *
     * @param {int}id
     * @param {Vec2}position
     * @param {Class}origin
     * @param {Class|Vec2}target
     */
    initData(id, position, origin, target){
        this.objType = zl.Constant.NODE_TYPE_SKILL;
        this.target = target;
        this.origin = origin;
        this.id = id;
        this.isChecked = false;
        this.data = zl.templateManager.getSkillCfgById(id);
        this.node.setPosition(position);
        this.node.active = true;
        this.startSkill();
    },

    startSkill(){
        switch (this.data.type) {
            case zl.Constant.SKILL_TYPE_TARGETED:
                break;
            case zl.Constant.SKILL_TYPE_NON_TARGETED:
                this.effect = cc.instantiate(this.host.skillEffectMap[this.data.prefabName]);
                this.skillBody.addChild(this.effect);
                let anim = this.effect.getComponent(cc.Animation);
                let self = this;
                anim.play();
                anim.on('finished', function () {
                    self.host.removeObj(self);
                })
                break;
        }
    },

    lateUpdate(){
        switch (this.id) {
            case 1: {
                let sprite = cc.find('enemybullet_10_hit', this.effect).getComponent(cc.Sprite);
                if (sprite.spriteFrame.name === 'enemybullet_10_hit_01' && !this.isChecked) {
                    let checkList = [];
                    if (this.origin.objType === zl.Constant.NODE_TYPE_HERO) {
                        checkList = this.host.enemyList;
                    } else if (this.origin.objType === zl.Constant.NODE_TYPE_ENEMY) {
                        checkList = this.host.heroList;
                    }
                    for (let i = 0; i < checkList.length; i++) {
                        let checkObj = checkList[i];
                        let damageBox = zl.Utils.getCircle(this.target, this.data.damageRange);
                        let checkBox = zl.Utils.getCircle(checkObj.node.position.add(cc.v2(0, 30)), 30);
                        let isHit = zl.Collision.circularCircular(damageBox, checkBox);
                        if (isHit) {
                            checkObj.injury(this.data.damage);
                        }
                    }
                    this.isChecked = true;
                }
                break;
            }
            case 2: {
                let sprite = cc.find('lizi', this.effect).getComponent(cc.Sprite);
                if (sprite.spriteFrame.name === 'lizi_01' && !this.isChecked){
                    let checkList = [];
                    if (this.origin.objType === zl.Constant.NODE_TYPE_HERO) {
                        checkList = this.host.enemyList;
                    } else if (this.origin.objType === zl.Constant.NODE_TYPE_ENEMY) {
                        checkList = this.host.heroList;
                    }
                    for (let i = 0; i < checkList.length; i++) {
                        let checkObj = checkList[i];
                        let damageBox = zl.Utils.getCircle(this.target, this.data.damageRange);
                        let checkBox = zl.Utils.getCircle(checkObj.node.position.add(cc.v2(0, 30)), 30);
                        let isHit = zl.Collision.circularCircular(damageBox, checkBox);
                        if (isHit) {
                            checkObj.injury(this.data.damage);
                        }
                    }
                    this.isChecked = true;
                }
                break;
            }
        }

    },

    setState(state){
        this.state = state;
    },

    update(dt){
    },
})