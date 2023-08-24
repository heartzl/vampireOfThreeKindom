const zl = require("zl");
cc.Class({
    extends: zl.BaseCharacter,

    properties: {},

    initData(info){
        this.objType = zl.Constant.NODE_TYPE_ENEMY;
        this.maxHp = info.maxHp;
        this.hp = this.maxHp;
        this.speed = info.speed;
        this.volRadius = info.volRadius;
        this.physical = info.physical;
        this.magic = info.magic;
        this.attackSpeed = info.attackSpeed;
        this.bulletId = info.bulletId;
        this.shootRadius = info.shootRadius;
        this.meleeRadius = info.meleeRadius;
        this.originScale = info.scale;
        this.bodyNode.setScale(info.scale);

        let bodyPath = zl.Constant.SPINE_PATH_ENEMY + info.spineName;
        this.angle = zl.Utils.randomInt(0, 359);
        this._updateBody(bodyPath);
        this.initHealthBar();
        this.updateHp();
    },

    initHealthBar(){
        if(this.hpBar){
            return;
        }
        let bar = this.host.getHealthBar();
        this.hpBar = bar.getComponent('HealthBar');
    },

    _beforeMeleeAnim(){
        let angle = zl.Utils.getAngleByTwoPoints(this.node.position, this._meleeTarget.node.position);
        this.updateDirectionByAngle(angle);
        this.scheduleOnce(function () {
            if(this._meleeTarget && this._meleeTarget.getState() !== zl.Constant.ROLE_DIE){
                let otherData = {
                    hitType: zl.Constant.ROLE_ATTACK
                }
                this._meleeTarget.injury(this.physical, otherData);
            }
        }, 0.05)
    },

    _afterMeleeAnim(){
        let targetPos = this._meleeTarget ? this._meleeTarget.node.position : null;
        let dis = targetPos ? zl.Utils.getDistanceByTwoPoints(this.node.position, targetPos) - this._shootTarget.volRadius: null;
        if(dis && dis <= this.meleeRadius && this._meleeTarget.getState() !== zl.Constant.ROLE_DIE){
            this._setState(zl.Constant.ROLE_STAND);
        }
        // 目标丢失或目标死亡则继续移动
        else {
            // this.updateDirectionByAngle(this.angle);
            this._setState(zl.Constant.ROLE_MOVE);
        }
    },

    _beforeShootAnim(){
        let angle = zl.Utils.getAngleByTwoPoints(this.node.position, this._shootTarget.node.position);
        this.updateDirectionByAngle(angle);
        this.host.addBullet(this.bulletId, this.node.position, this, this._shootTarget);
    },

    _afterShootAnim(){
        let targetPos = this._shootTarget ? this._shootTarget.node.position : null;
        let dis = targetPos ? zl.Utils.getDistanceByTwoPoints(this.node.position, targetPos) - this._shootTarget.volRadius: null;
        if(dis && dis <= this.shootRadius && this._shootTarget.getState() !== zl.Constant.ROLE_DIE){
            this._setState(zl.Constant.ROLE_STAND);
        }
        // 目标丢失或目标死亡则继续移动
        else {
            // this.updateDirectionByAngle(this.angle);
            this._setState(zl.Constant.ROLE_MOVE);
        }
    },

    _afterDamageCalc(){
        let hitLabel = this.host.getHitLabel();
        let LabelObj = hitLabel.getComponent('HitLabel');
        let hpBgPos = this.hpBar.node.position;
        LabelObj.host = this.host;
        LabelObj.show(zl.Constant.LABEL_TYPE_INJURY, hpBgPos, this._injuryNum);

        if(this._hitOtherData && this._hitOtherData.hasOwnProperty('hitType')){
            let hitEffect = this.host.getHitEffect();
            this.node.addChild(hitEffect);
            hitEffect.active = true;
            let effectObj = hitEffect.getComponent('HitEffect');
            effectObj.host = this.host;
            effectObj.show(this._hitOtherData.hitType);
        }

        let injuryAnim1 = cc.scaleTo(0.05,-this.originScale * 1.2, this.originScale * 1.2);
        let injuryAnim2 = cc.scaleTo(0.05, -this.originScale, this.originScale);
        if(this.direction === zl.Constant.ROLE_DIR_LEFT){
            injuryAnim1 = cc.scaleTo(0.05,this.originScale * 1.2);
            injuryAnim2 = cc.scaleTo(0.05, this.originScale);
        }

        let seq = cc.sequence(injuryAnim1, injuryAnim2);
        this.bodyNode.runAction(seq);
        this.updateHp();
    },


    _afterDieAnim(){
        this.host.removeObj(this);
    },

    _loadBodyCallBack(){
        this._setState(zl.Constant.ROLE_MOVE);
        this.bodySkeleton.setSkin('red');
        this.updateDirectionByAngle(this.angle);
    },

    changeDirection(){
        let angle = 0;
        if(this.node.position.x < 0){
            angle = zl.Utils.randomInt(0, 180);
            if(angle > 90){
                angle += 90;
            }
        }
        else {
            angle = zl.Utils.randomInt(90, 270);
        }
        this.angle = angle;
        this.updateDirectionByAngle(this.angle);
    },

    updateHp(){
        let pos = this.node.position.add(cc.v2(0,80));
        this.hpBar.updateBar(pos,this.hp / this.maxHp);
    },

    // 以本角色为起点指向目标的向量与水平向右向量的夹角(0~360)
    updateDirectionByAngle(angle){
        if(angle > 90 && angle < 270){
            this._setDirection(zl.Constant.ROLE_DIR_LEFT);
        }
        else {
            this._setDirection(zl.Constant.ROLE_DIR_RIGHT);
        }
    },

    updatePos(dt){
        if(this.state === zl.Constant.ROLE_STAND && this.host.hero.getState() !== zl.Constant.ROLE_DIE){
            let dis = zl.Utils.getDistanceByTwoPoints(this.node.position, this.host.hero.node.position) - this.volRadius;
            if(dis > this.shootRadius){
                this._setState(zl.Constant.ROLE_MOVE);
            }
        }
        if(!this.node.active || this.state !== zl.Constant.ROLE_MOVE || this.host.hero.getState() === zl.Constant.ROLE_DIE){
            return
        }
        let targetPos = this.host.hero.node.position;
        let nowRot = zl.Utils.getAngleByTwoPoints(this.node.position, targetPos);
        let offsetRot = nowRot - this.angle;
        if(Math.abs(offsetRot) > 30){
            if(offsetRot > 0){
                offsetRot = 30;
            }
            else{
                offsetRot = - 30;
            }
        }
        let diffPos = zl.Utils.getVec2ByAngAndDis(this.angle, dt * this.speed);
        let dis = zl.Utils.getDistanceByTwoPoints(this.node.position, targetPos) - this.meleeRadius - this.volRadius;
        let moveDis = this.speed * dt;
        if(dis <= moveDis){
            diffPos = zl.Utils.getVec2ByAngAndDis(this.angle, dis);
            this._setState(zl.Constant.ROLE_STAND);
        }
        let destination = diffPos.add(cc.v2(this.node.x, this.node.y));
        this.angle = this.angle + offsetRot;

        // 随机走动
        // let dis = this.speed * dt;
        // let offsetPos = zl.Utils.getVec2ByAngAndDis(this.angle, dis);
        // let destination = this.node.position.add(offsetPos);
        // let isReachBorder = this.host.checkBorder(destination, this.volRadius);
        // if(isReachBorder){
        //     this.changeDirection();
        //     return;
        // }
        this.node.setPosition(destination);
        this.updateHp();
    },

    update(dt){
    },
})