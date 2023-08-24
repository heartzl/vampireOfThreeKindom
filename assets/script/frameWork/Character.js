const Constant = require("Constant");
const Utils = require("Utils");

/**
 *
 * @class Character
 * @extends cc.Component
 */

var Character = cc.Class({

    extends: cc.Component,

    ctor: function(){
        this.hp = 0;
        this.maxHp = 0;
        this.state = null;
        this.direction = null;
        this.attackSpeed = 999;
        this._lastAttackTime = 0;
        this._isReadyAttack = true;
        this._isReadySkill = false;
    },

    properties: {
    },

    onLoad: function () {
        this.bodyNode = cc.find('body', this.node);
        this.bodySkeleton = this.bodyNode.getComponent('sp.Skeleton');
    },

    initData: function () {
        // override me
    },

    //-----------------------------角色形象------------------------------//
    _updateBody: function(path){
        cc.resources.load(path, sp.SkeletonData, (err, spine) => {
            if (err) {
                cc.log("==== load spine error: ====\n");
                return;
            }
            if (!this.node || !this.node.active) {
                return;
            }
            this.bodySkeleton.skeletonData = spine;
            this._loadBodyCallBack();
        });
    },

    // 加载完spine后的操作
    _loadBodyCallBack: function () {
        // override me
    },

    //-----------------------------近战------------------------------//
    // 近战
    melee: function (target) {
        if(!target) {
            cc.warn("no target of melee !!!");
        }
        this._updateIsReady();
        if(this._isReadyAttack){
            this._lastAttackTime = Utils.getTime();
            this._isReadyAttack = false;
            this._meleeTarget = target;
            this._beforeMeleeAnim();
            this._setState(Constant.ROLE_ATTACK);
        }
    },

    // 近战攻击动画开始播放前的操作
    _beforeMeleeAnim: function () {
        // override me
    },

    // 近战攻击动画播放完成后的操作
    _afterMeleeAnim: function () {
        // override me
    },

    clearMeleeTarget(){
        this._meleeTarget = null;
    },

    //-----------------------------射击------------------------------//
    // 远程射击
    shoot: function (target) {
        if(!target) {
            cc.warn("no target of shoot !!!");
        }
        this._updateIsReady();
        if(this._isReadyAttack){
            this._lastAttackTime = Utils.getTime();
            this._isReadyAttack = false;
            this._shootTarget = target;
            this._beforeShootAnim();
            this._setState(Constant.ROLE_SHOOT);
        }
    },

    // 远程射击动画开始播放前的操作
    _beforeShootAnim: function () {
        // override me
    },

    // 远程射击动画播放完成后的操作
    _afterShootAnim: function () {
        // override me
    },

    clearShootTarget(){
        this._shootTarget = null;
    },

    //-----------------------------技能------------------------------//
    // 释放技能
    skill: function (target) {
        if(!target){
            cc.warn("no target of skill !!!");
        }
        this._updateIsReady();
        if(this._isReadySkill && this._isReadyAttack){
            this._isReadySkill = false;
            this._isReadyAttack = false;
            this._skillTarget = target;
            this._beforeSkillAnim();
            this._setState(Constant.ROLE_SKILL);
        }
    },

    // 释放技能动画开始播放前的操作
    _beforeSkillAnim: function () {
        // override me
    },

    // 释放技能动画播放完成后的操作
    _afterSkillAnim: function () {
        // override me
    },

    clearSkillTarget(){
        this._skillTarget = null;
    },

    setReadySkill: function () {
        this._isReadySkill = true;
    },

    getIsReadySkill: function () {
        return this._isReadySkill;
    },

    //-----------------------------受击------------------------------//
    injury: function (damage, otherData) {
        if(this.state === Constant.ROLE_DIE){
            return;
        }
        this._hitOtherData = otherData ? otherData : null;
        this._injuryNum = damage;
        this._beforeDamageCalc();
        this.hp -= this._injuryNum;
        this._afterDamageCalc();
        if(this.hp <= 0){
            this.hp = 0
            this._beforeDieAnim();
            this._setState(Constant.ROLE_DIE);
        }
    },

    // 伤害结算前的操作
    _beforeDamageCalc: function () {
        // override me
    },

    // 伤害结算后的操作,时机在死亡结算前
    _afterDamageCalc: function () {
        // override me
    },

    // 死亡动画开始播放前的操作
    _beforeDieAnim: function () {
        // override me
    },

    // 死亡动画播放完成后的操作
    _afterDieAnim: function () {
        // override me
    },

    //-----------------------------其它------------------------------//
    getState: function () {
        return this.state;
    },

    _setState: function (state) {
        this.state = state;
        this._updateAction();
    },

    getDirection: function () {
        return this.direction;
    },

    _setDirection: function (dir) {
        if(dir === this.direction){
            return;
        }
        this.direction = dir;
        this._updateAction();
    },

    _updateAction: function () {
        let actionName = '';
        let directionName = 'right';
        let isLoop = false;
        let self = this;
        this._stateAnimCallback = null;
        if(this.objType === Constant.NODE_TYPE_ENEMY){
            directionName = 'left';
        }
        switch (this.state) {
            case Constant.ROLE_STAND:
                actionName = 'stand';
                isLoop = true;
                break;
            case Constant.ROLE_MOVE:
                actionName = 'run';
                isLoop = true;
                break;
            case Constant.ROLE_ATTACK:
                actionName = 'attack';
                this._stateAnimCallback = this._afterMeleeAnim;
                break;
            case Constant.ROLE_SHOOT:
                this._stateAnimCallback = this._afterShootAnim;
                actionName = 'shoot';
                break;
            case Constant.ROLE_SKILL:
                this._stateAnimCallback = this._afterSkillAnim;
                actionName = 'skill';
                break;
            case Constant.ROLE_DIE:
                this._stateAnimCallback = this._afterDieAnim;
                actionName = 'death';
                break;
        }

        switch (this.direction) {
            case Constant.ROLE_DIR_LEFT:
                if(this.objType === Constant.NODE_TYPE_ENEMY){
                    this.bodyNode.scaleX = Math.abs(this.bodyNode.scaleX);
                    break;
                }
                this.bodyNode.scaleX = - Math.abs(this.bodyNode.scaleX);
                break;
            case Constant.ROLE_DIR_RIGHT:
                if(this.objType === Constant.NODE_TYPE_ENEMY){
                    this.bodyNode.scaleX = - Math.abs(this.bodyNode.scaleX);
                    break;
                }
                this.bodyNode.scaleX = Math.abs(this.bodyNode.scaleX);
        }

        let animName = actionName + '_' + directionName;
        if(this.objType === Constant.NODE_TYPE_ENEMY){
            animName += 'Down';
        }
        if(!this.bodySkeleton.findAnimation(animName)){
            cc.log("Can not find animation '" + animName + "'. " + this.node.name + " will standing");
            animName = 'stand_right';
            isLoop = true;
        }

        this.bodySkeleton.setAnimation(0, animName, isLoop);
        if(this._stateAnimCallback !== null){
            this.bodySkeleton.setCompleteListener((trackEntry, loopCount) => {
                self._stateAnimCallback && self._stateAnimCallback();
            });
        }
    },


    _updateIsReady: function () {
        let nowTime = Utils.getTime();
        let interval = nowTime - this._lastAttackTime;
        this._isReadyAttack = interval > (1 / this.attackSpeed * 1000);
    },

    update(dt){
    },
})

module.exports = Character;