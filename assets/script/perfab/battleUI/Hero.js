const zl = require("zl");
cc.Class({
    extends: zl.BaseCharacter,

    properties: {},

    /**
     *
     * @param {int}id
     * @example
     * let info = {
     *     name:            string
     *     maxHp:           int
     *     volRadius:       int
     *     physical:        int
     *     magic:           int
     *     attackSpeed:     int(次/s)
     *     bulletType:      string
     *     bulletName:      string
     *     shootRadius:     int
     *     meleeRadius:     int
     * }
     * initData(info)
     */
    initData(id){
        this.hpNode = cc.find('hp', this.node);
        this.hpProgress = cc.find('hp/hpProgress', this.node).getComponent(cc.ProgressBar);
        this.objType = zl.Constant.NODE_TYPE_HERO;
        let info = zl.templateManager.getHeroCfgById(id);
        this.id = id;
        this.maxHp = info.maxHp;
        this.hp = this.maxHp;
        this.volRadius = info.volRadius;
        this.speed = info.speed;
        this.physical = info.physical;
        this.magic = info.magic;
        this.bulletId = info.bulletId;
        this.skillId = info.skillId;
        this.attackSpeed = info.attackSpeed;
        this.skillCd = info.skillCd;
        this.shootRadius = info.shootRadius;
        this.meleeRadius = info.meleeRadius;
        this.originScale = info.scale;
        this.bodyNode.setScale(info.scale);
        this.skillTimer = 0;

        let birthNode = this.host.herBirthNode;
        this.goToPos = cc.v2(birthNode.position.x, birthNode.position.y);
        this.isDead = false;
        this.deadTimer = 0;
        // 复活时间
        this.respawnTime = 3; // s
        let bodyPath = zl.Constant.SPINE_PATH_HERO + info.spineName;
        this._updateBody(bodyPath);
        this.updateHp();
    },

    _beforeMeleeAnim(){
        if(this.state === zl.Constant.ROLE_MOVE){
            this._meleeTarget = null;
            return;
        }
        let delayTime = zl.templateManager.getHeroMeleeDelay(this.id);
        let angle = zl.Utils.getAngleByTwoPoints(this.node.position, this._meleeTarget.node.position);
        this.updateDirectionByAngle(angle);
        this.scheduleOnce(function () {
            let otherData = {
                hitType: zl.Constant.ROLE_ATTACK
            }
            this._meleeTarget.injury(this.physical, otherData);
        }, delayTime)

        this.skillTimer ++;
        if(this.skillTimer >= this.skillCd){
            this.skillTimer = 0;
            this.setReadySkill();
        }
    },

    _afterMeleeAnim(){
        this._setState(zl.Constant.ROLE_STAND);
    },

    _beforeShootAnim(){
        if(this.state === zl.Constant.ROLE_MOVE){
            this._shootTarget = null;
            return;
        }
        let delayTime = zl.templateManager.getHeroMeleeDelay(this.id);
        let angle = zl.Utils.getAngleByTwoPoints(this.node.position, this._shootTarget.node.position);
        this.updateDirectionByAngle(angle);
        this.scheduleOnce(function () {
            this.host.addBullet(this.bulletId, this.node.position, this, this._shootTarget);
        }, delayTime)

        this.skillTimer ++;
        if(this.skillTimer >= this.skillCd){
            this.skillTimer = 0;
            this.setReadySkill();
        }
    },

    _afterShootAnim(){
        this._setState(zl.Constant.ROLE_STAND);
    },

    _beforeSkillAnim(){
        if(this.state === zl.Constant.ROLE_MOVE){
            this._skillTarget = null;
            return;
        }
        let delayTime = zl.templateManager.getHeroSkillDelay(this.id);
        let angle = zl.Utils.getAngleByTwoPoints(this.node.position, this._skillTarget.node.position);
        this.updateDirectionByAngle(angle);
        this.scheduleOnce(function () {
            let target = cc.v2(this._skillTarget.node.position.x, this._skillTarget.node.position.y + 30);
            this.host.addSkill(this.skillId, target, this, target);
        }, delayTime);
    },

    _afterSkillAnim(){
        this._setState(zl.Constant.ROLE_STAND);
    },

    _afterDamageCalc(){
        let hitLabel = this.host.getHitLabel();
        let labelObj = hitLabel.getComponent('HitLabel');
        let hpWorldPos = this.node.convertToWorldSpaceAR(this.hpNode.position);
        let hpBgPos = this.host.bg.convertToNodeSpaceAR(hpWorldPos);
        labelObj.host = this.host;
        labelObj.show(zl.Constant.LABEL_TYPE_INJURY, hpBgPos, this._injuryNum);

        if(this._hitOtherData && this._hitOtherData.hasOwnProperty('hitType')){
            let hitEffect = this.host.getHitEffect();
            this.node.addChild(hitEffect);
            let effectObj = hitEffect.getComponent('HitEffect');
            effectObj.host = this.host;
            effectObj.show(this._hitOtherData.hitType);
        }

        let injuryAnim1 = cc.scaleTo(0.05, this.originScale * 1.2);
        let injuryAnim2 = cc.scaleTo(0.05, this.originScale);
        if(this.direction === zl.Constant.ROLE_DIR_LEFT){
            injuryAnim1 = cc.scaleTo(0.05,-this.originScale * 1.2, this.originScale * 1.2);
            injuryAnim2 = cc.scaleTo(0.05, -this.originScale, this.originScale);
        }

        let seq = cc.sequence(injuryAnim1, injuryAnim2);
        this.bodyNode.runAction(seq);
        this.updateHp();
    },

    _afterDieAnim(){
        this.host.removeObj(this);
    },

    _loadBodyCallBack(){
        this._setState(zl.Constant.ROLE_STAND);
        this.host.addInitProgress(34);
    },

    // 设置目的地
    setDestination(pos){
        if(pos.x === this.node.position.x && pos.y === this.node.position.y){
            return;
        }
        this.goToPos = cc.v2(pos.x, pos.y);
        let angle = zl.Utils.getAngleByTwoPoints(this.node.position, this.goToPos);
        this.updateDirectionByAngle(angle);
        if(this.state !== zl.Constant.ROLE_MOVE){
            this._setState(zl.Constant.ROLE_MOVE);
        }
    },

    // 复活
    respawn(){
        this.isDead = false;
        this.hp = this.maxHp;
        this.node.active = true;
        this.goToPos = cc.v2(this.node.position.x, this.node.position.y);
        this.updateHp();
        this._setState(zl.Constant.ROLE_STAND);
    },

    updateHp(){
        this.hpNode.active = this.hp !== 0;
        this.hpProgress.progress = this.hp / this.maxHp;
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
        // 英雄死亡并且active为false，开始复活倒计时
        if(this.isDead){
            this.deadTimer += dt;
            if(this.deadTimer >= this.respawnTime){
                this.deadTimer = 0;
                this.respawn();
            }
        }
        else if(this.state !== zl.Constant.ROLE_DIE){
            if(this.node.position.x === this.goToPos.x && this.node.position.y === this.goToPos.y){
                return;
            }
            let dis = zl.Utils.getDistanceByTwoPoints(this.node.position, this.goToPos);
            let moveDis = this.speed * dt;
            if(dis <= moveDis){
                this.node.setPosition(this.goToPos);
                this._setState(zl.Constant.ROLE_STAND);
                return;
            }
            let angle = zl.Utils.getAngleByTwoPoints(this.node.position, this.goToPos);
            let offset = zl.Utils.getVec2ByAngAndDis(angle, moveDis);
            this.node.setPosition(this.node.position.add(offset));
        }
    },

    update(dt){
    },
})