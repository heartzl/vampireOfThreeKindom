const zl = require("zl");
cc.Class({
    extends: cc.Component,

    properties: {
        bulletAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },
    },

    onLoad: function () {
        this.bulletBody = cc.find('body', this.node);
        this.bulletSprite =  this.bulletBody.getComponent(cc.Sprite);
    },

    /**
     *
     * @param {int}id
     * @param {Vec2}position
     * @param {Class}origin
     * @param {Class|Vec2}target
     */
    initData(id, position, origin, target){
        this.objType = zl.Constant.NODE_TYPE_BULLET;
        this.origin = origin;
        this.id = id;
        this.data = zl.templateManager.getBulletCfgById(id);
        this.bulletSprite.spriteFrame = this.bulletAtlas.getSpriteFrame(this.data.spriteName);
        this.target = target;
        let targetPos = cc.v2(target.node.position.x, target.node.position.y + 30);
        let bulletType = this.data.type;
        if(bulletType !== zl.Constant.BULLET_TYPE_ORB && bulletType !== zl.Constant.BULLET_TYPE_MISSILE){
            this.target = targetPos;
        }
        this.node.setPosition(position);
        this.node.active = true;
        this.node.angle = zl.Utils.getAngleByTwoPoints(this.node.position, targetPos);
        this.radius = this.data.radius;
        this.speed = this.data.speed;
        this.maxOffsetAng = this.data.maxOffsetAng;
        this.damageRange = this.data.damageRange;

        this.state = zl.Constant.BULLET_MOVE;
    },

    setState(state){
        this.state = state;
    },

    updatePos(dt){
        if(!this.node.active){
            return;
        }
        switch (this.data.type) {
            case zl.Constant.BULLET_TYPE_ORB:
                this.updateOrbPos(dt);
                break;
            case zl.Constant.BULLET_TYPE_MISSILE:
                this.updateMissilePos(dt);
                break;
            case zl.Constant.BULLET_TYPE_ARROW:
                this.updateArrowPos(dt);
                break;
            case zl.Constant.BULLET_TYPE_SHELL:
                this.updateShellPos(dt);
                break;
        }
    },

    updateOrbPos(dt) {
        if(this.state !== zl.Constant.BULLET_MOVE){
            return;
        }
        let isOutWindow = this.host.checkBorder(this.node.position, 0);
        if(this.target.getState() === zl.Constant.ROLE_DIE || isOutWindow){
            this.host.removeObj(this);
        }
        let targetNode = this.target.node;
        let targetPos = cc.v2(targetNode.position.x, targetNode.position.y + 30);
        let bulletBox = zl.Utils.getCircle(this.node.position, this.radius);
        let targetBox = zl.Utils.getCircle(targetPos, 30);
        let isHit = zl.Collision.circularCircular(targetBox, bulletBox);
        if(isHit){
            this.setState(zl.Constant.BULLET_HIT);
            let otherData = {
                hitType: zl.Constant.ROLE_SHOOT
            }
            this.target.injury(this.origin.magic, otherData);
            this.host.removeObj(this);
        }
        let nowRot = zl.Utils.getAngleByTwoPoints(this.node.position, targetPos);
        let offsetRot = nowRot - this.node.angle;
        if(Math.abs(offsetRot) > this.maxOffsetAng){
            if(offsetRot > 0){
                offsetRot = this.maxOffsetAng;
            }
            else{
                offsetRot = - this.maxOffsetAng;
            }
        }
        let diffPos = zl.Utils.getVec2ByAngAndDis(this.node.angle, dt * this.speed);
        let destination = diffPos.add(cc.v2(this.node.x, this.node.y));
        this.node.setPosition(destination);
        this.node.angle = this.node.angle + offsetRot;
    },

    updateMissilePos(dt){

    },

    updateArrowPos(dt){
        if(this.state !== zl.Constant.BULLET_MOVE){
            return;
        }
        let isOutWindow = this.host.checkBorder(this.node.position, 0);
        if(isOutWindow){
            this.host.removeObj(this);
        }
        let targetPos = this.target;
        let destination = null;
        let dis = zl.Utils.getDistanceByTwoPoints(this.node.position, targetPos);
        let moveDis = this.speed * dt;
        if(dis <= moveDis){
            destination = targetPos;
        }
        else {
            let diffPos = zl.Utils.getVec2ByAngAndDis(this.node.angle, moveDis);
            destination = diffPos.add(cc.v2(this.node.x, this.node.y));
        }
        this.node.setPosition(destination);
        // 击中检测
        if(destination === targetPos){
            let checkList = [];
            if(this.origin.objType === zl.Constant.NODE_TYPE_HERO){
                checkList = this.host.enemyList;
            }
            else if(this.origin.objType === zl.Constant.NODE_TYPE_ENEMY){
                checkList = this.host.heroList;
            }
            for(let i = 0; i < checkList.length; i++) {
                let checkObj = checkList[i];
                let targetBox = zl.Utils.getCircle(targetPos, this.radius);
                let checkBox = zl.Utils.getCircle(checkObj.node.position.add(cc.v2(0, 30)), 30);
                let isHit = zl.Collision.circularCircular(targetBox, checkBox);
                if(isHit){
                    this.setState(zl.Constant.BULLET_HIT);
                    let otherData = {
                        hitType: zl.Constant.ROLE_SHOOT
                    }
                    checkObj.injury(this.origin.magic, otherData);
                    break;
                }
            }
            this.host.removeObj(this);
        }
    },

    updateShellPos(dt) {
        if(this.state !== zl.Constant.BULLET_MOVE){
            return;
        }
        let isOutWindow = this.host.checkBorder(this.node.position, 0);
        if(isOutWindow){
            this.host.removeObj(this);
        }
        let targetPos = this.target;
        let destination = null;
        let dis = zl.Utils.getDistanceByTwoPoints(this.node.position, targetPos);
        let moveDis = this.speed * dt;
        if(dis <= moveDis){
            destination = targetPos;
        }
        else {
            let diffPos = zl.Utils.getVec2ByAngAndDis(this.node.angle, moveDis);
            destination = diffPos.add(cc.v2(this.node.x, this.node.y));
        }
        this.node.setPosition(destination);
        // 击中检测
        if(destination === targetPos) {
            let checkList = [];
            if (this.origin.objType === zl.Constant.NODE_TYPE_HERO) {
                checkList = this.host.enemyList;
            } else if (this.origin.objType === zl.Constant.NODE_TYPE_ENEMY) {
                checkList = this.host.heroList;
            }
            for (let i = 0; i < checkList.length; i++) {
                let checkObj = checkList[i];
                let targetBox = zl.Utils.getCircle(targetPos, this.damageRange);
                let checkBox = zl.Utils.getCircle(checkObj.node.position.add(cc.v2(0, 30)), 30);
                let isHit = zl.Collision.circularCircular(targetBox, checkBox);
                if (isHit) {
                    this.setState(zl.Constant.BULLET_HIT);
                    let otherData = {
                        hitType: zl.Constant.ROLE_SHOOT
                    }
                    checkObj.injury(this.origin.magic, otherData);
                    this.host.removeObj(this);
                }
            }
            this.host.removeObj(this);
        }
    },

    update(dt){
    },
})