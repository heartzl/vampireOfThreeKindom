const zl = require("zl");
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        this.moveScene = cc.find("moveScene", this.node);

        this.jumpScene = cc.find("jumpScene", this.node);

        this.background = cc.find("background", this.node);
        this.ball = cc.find("ball", this.background);
        this.ground = cc.find("ground", this.background);

        this.modeLabel = cc.find("changeModeBtn/Background/Label", this.node).getComponent(cc.Label);
        this.sceneLabel = cc.find("changeSceneBtn/Background/Label", this.node).getComponent(cc.Label);
        this.timer = 0;
        this.initScene();
    },

    initScene(){
        this.winCenterX = -this.background.x;
        this.mapCenterX = this.background.x;
        this.scene = zl.Constant.SCENE_MOVE;
        this.mode = zl.Constant.MODE_PHYSICS;
        this.jumpScene.active = false;
        this.moveScene.active = true;
        this.velX = 0;
        this.velY = 0;
        this.accX = 0;
        this.accY = -2800; // 重力加速度
        this.startAngle = 0; // 初始角度
        this.startForce = 200; // 初始力度
        this.friction = 100; // 摩擦力
        this.windForce = 50; // 风力
        this.elasticity = 0.8;
        this.isOnGround = false;
        this.groundY = this.ground.y + this.ground.height / 2 - 7;
        this.firstTime = Math.sqrt(Math.abs((this.ball.y - this.ball.height / 2 - this.groundY) * 2 / this.accY));
    },

    setElasticity(editBox){
        let elasticity = parseFloat(editBox.string);
        elasticity = Math.min(elasticity, 1);
        elasticity = Math.max(elasticity, 0);
        this.elasticity = elasticity;
    },

    setStartAngle(editBox){
        let angle = parseInt(editBox.string);
        angle = Math.min(angle, 89);
        angle = Math.max(angle, 0);
        this.startAngle = angle;
    },

    setStartForce(editBox){
        this.startForce = parseInt(editBox.string);
    },

    setFriction(editBox){
        this.friction = parseInt(editBox.string);
    },

    setWindForce(editBox){
        this.windForce = parseInt(editBox.string);
    },

    onClickQuit(){
        cc.director.loadScene("MainMenu");
    },

    onClickChangeTest(){
        if(this.scene === zl.Constant.SCENE_MOVE){
            this.sceneLabel.string = '抛物';
            this.moveScene.active = false;
            this.jumpScene.active = true;
            this.scene = zl.Constant.SCENE_JUMP;
        }
        else if(this.scene === zl.Constant.SCENE_JUMP){
            this.jumpScene.active = false;
            this.moveScene.active = true;
            this.sceneLabel.string = '弹跳';
            this.scene = zl.Constant.SCENE_MOVE;
        }
    },

    onClickChangeMode(){
        if(this.mode === zl.Constant.MODE_PHYSICS){
            this.modeLabel.string = '曲线模拟';
            this.mode = zl.Constant.MODE_SIMULATE;
        }
        else if(this.mode === zl.Constant.MODE_SIMULATE){
            this.modeLabel.string = '物理模拟';
            this.mode = zl.Constant.MODE_PHYSICS;
        }
    },

    onClickReplayMove(){
        this.ball.setPosition(cc.v2(this.winCenterX, 100));
        this.background.x = this.mapCenterX;
        if(this.mode === zl.Constant.MODE_PHYSICS){
            this.isOnGround = false;
        }
        else if(this.mode === zl.Constant.MODE_SIMULATE){
            this.firstTime = Math.sqrt(Math.abs((this.ball.y - this.ball.height / 2 - this.groundY) * 2 / this.accY));
            this.simBallMove();
        }
    },

    onClickReplayJump(){
        this.background.x = this.mapCenterX;
        if(this.mode === zl.Constant.MODE_PHYSICS){
            this.ball.setPosition(cc.v2(-280 + this.winCenterX, 100));
            let vec = zl.Utils.getVec2ByAngAndDis(this.startAngle, this.startForce);
            this.velX = vec.x;
            this.velY = vec.y;
            this.isOnGround = false;
        }
        else if(this.mode === zl.Constant.MODE_SIMULATE){
            this.ball.setPosition(cc.v2(-280 + this.winCenterX, this.groundY + this.ball.height / 2));
            this.simBallMove();
        }
    },

    simBallMove(){
        if(this.scene === zl.Constant.SCENE_MOVE){
            cc.tween(this.ball)
                .to(this.firstTime, {position: cc.v2(0 + this.winCenterX, (this.groundY + this.ball.height / 2))}, {easing: 'quadIn'})
                .call(() => {
                    this.firstTime *= 0.8;
                    if(this.firstTime > (1 / 60)){
                        cc.tween(this.ball)
                            .by(this.firstTime, {position: cc.v2(0, -(this.accY * Math.pow(this.firstTime,2) / 2))}, {easing: 'quadOut'})
                            .call(() => {
                                this.simBallMove()
                            })
                            .start()
                    }
                })
                .start();
        }
        else if(this.scene === zl.Constant.SCENE_JUMP){
            let actArr = [];
            let vec = zl.Utils.getVec2ByAngAndDis(this.startAngle, this.startForce);
            let offsetX = vec.x;
            let time = - vec.y / this.accY * 2;
            while(time > (1 / 60)){
                let height = - this.accY * Math.pow(time / 2,2) / 2;
                let action = cc.jumpBy(time, cc.v2(offsetX * time, -(this.ball.y - (this.groundY + this.ball.height / 2))), height, 1);
                actArr.push(action);
                time *= 0.8;
            }
            let seq = cc.sequence(actArr);
            this.ball.runAction(seq);
        }
    },

    updateBall(dt){
        this.ball.x += this.velX * dt;
        this.ball.y += this.velY * dt;
    },

    updateBallV(dt){
        this.velX += this.accX * dt;
        // 风速的处理
        // 物体速度与风反向，物体跟随风的方向
        if(this.windForce !== 0){
            if(this.velX * this.windForce <= 0){
                this.velX += this.windForce * dt;
                if(this.accX === 0 && Math.abs(this.velX) > Math.abs(this.windForce)){
                    this.velX = this.windForce;
                }
            }
            // 物体速度与风同向
            else {
                // 如果速度小于风速，则继续跟随风的方向
                if(Math.abs(this.velX) < Math.abs(this.windForce)){
                    this.velX += this.windForce * dt;
                    if(this.accX === 0 && Math.abs(this.velX) > Math.abs(this.windForce)){
                        this.velX = this.windForce;
                    }
                }
                // 如果速度大于风速，则风变为阻力
                else if(Math.abs(this.velX) > Math.abs(this.windForce)){
                    this.velX -= (this.velX - this.windForce) * dt;
                    if(this.accX === 0 && Math.abs(this.velX) < Math.abs(this.windForce)){
                        this.velX = this.windForce;
                    }
                }
            }
        }


        // 摩擦力的处理
        if(this.velX > 0) {
            if(this.isOnGround){
                this.velX -= this.friction * dt;
                if(this.velX < 0){
                    this.velX = 0;
                }
            }
        }
        else if(this.velX < 0) {
            this.velX += this.accX * dt;
            if(this.isOnGround){
                this.velX += this.friction * dt;
                if(this.velX > 0){
                    this.velX = 0;
                }
            }
        }

        if(!this.isOnGround){
            this.velY += this.accY * dt;
        }
    },

    checkGround(dt){
        if((this.ball.y - this.ball.height / 2) < this.groundY && !this.isOnGround){
            this.ball.y = this.groundY + this.ball.height / 2;
            this.velY = - this.velY * this.elasticity;
            cc.log(this.velY);
            if((this.velY + dt * this.accY) < 0){
                this.ball.y = this.groundY + this.ball.height / 2;
                this.velY = 0;
                this.isOnGround = true;
            }
        }
    },

    updateMap(){
        let diffPosX = this.ball.x - this.winCenterX;
        this.background.x = this.mapCenterX - diffPosX;
    },

    // called every frame
    update: function (dt) {
        if(this.mode === zl.Constant.MODE_SIMULATE){
            if(this.scene === zl.Constant.SCENE_MOVE){
                if(this.timer < 1){
                    this.timer += dt;
                }
                if(this.timer > 1){
                    this.simBallMove();
                    this.timer = 1;
                }
            }
            else if(this.scene === zl.Constant.SCENE_JUMP){
            }
        }
        else if(this.mode === zl.Constant.MODE_PHYSICS){
            this.updateBall(dt);
            this.checkGround(dt);
            this.updateBallV(dt);
        }
        if(this.ball.x > this.winCenterX){
            this.updateMap();
        }
    },
});
