const utils = require("Utils");
cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad: function () {
        this.startFlag = cc.find("startPoint", this.node);
        this.endFlag = cc.find("endPoint", this.node);
        this.monster = cc.find("yearMonster", this.node);
        this.initScene();
    },

    initScene(){
        this.reachEndPos = false;
        this.loadNum = 0
        this.loadEnd = false;
        this.loadPathList = ['prefab/path', 'prefab/wall'];
        this.prefabMap = {};
        this.mapHeight = 8;
        this.mapWidth = 5;
        this.mapPace = 50;
        this.initWallPosList();
        this.initPath();
        this.loadPrefab();

        this.monsterV = 200;
        this.pathPointIndex = this.path.length;
        this.changeTargetPos();
    },

    loadPrefab(){
        for(let i = 0; i < this.loadPathList.length; i++){
            let path = this.loadPathList[i];
            let self = this;
            cc.resources.load(path, cc.Prefab, (err, prefab) => {
                if (err) {
                    cc.error(err);
                    return;
                }
                if(!this.node || !this.node.active){
                    return;
                }
                self.prefabMap[path] = prefab;
                self.loadNum ++;
                if(self.loadNum === this.loadPathList.length){
                    self.loadWall();
                    self.loadWay();
                    self.loadEnd = true;
                }
            });
        }
    },

    loadWall(){
        for(let i = 0; i < this.wallPosList.length; i++){
            let wallPos = this.wallPosList[i];
            let wall = cc.instantiate(this.prefabMap['prefab/wall']);
            this.node.addChild(wall);
            wall.setPosition(cc.v2(wallPos[0] * this.mapPace, wallPos[1] * this.mapPace));
        }
    },

    loadWay(){
        for(let i = 0; i < this.path.length; i++){
            let roadPos = this.path[i];
            let road = cc.instantiate(this.prefabMap['prefab/path']);
            this.node.addChild(road);
            road.setPosition(cc.v2(roadPos[0] * this.mapPace, roadPos[1] * this.mapPace));
        }
    },

    initWallPosList(){
        this.wallPosList = [];
        let pointList = [];
        for(let i = 0; i < this.mapHeight * 2 + 1; i++){
            for(let n = 0; n < this.mapWidth * 2 + 1; n++){
                pointList.push([- this.mapWidth + n, - this.mapHeight + i]);
            }
        }
        for(let i = 0; i < this.mapHeight * this.mapWidth * 4 / 4; i++){
            let posIndex = utils.randomInt(0, pointList.length - 1);
            this.wallPosList.push(pointList[posIndex]);
            pointList.splice(posIndex, 1);
        }
    },

    initPath(){
        let starFlagPos = this.startFlag.position;
        let endFlagPos = this.endFlag.position;
        let starPos = {
            x: Math.floor(starFlagPos.x / this.mapPace),
            y: Math.floor(starFlagPos.y / this.mapPace),
        }
        let endPos = {
            x: Math.floor(endFlagPos.x / this.mapPace),
            y: Math.floor(endFlagPos.y / this.mapPace),
        }

        this.path = utils.a_StartFindWay(starPos, endPos, this.wallPosList, true);
    },

    onClickQuit(){
        cc.director.loadScene("MainMenu");
    },

    changeTargetPos(){
        this.pathPointIndex --;
        if(this.pathPointIndex < 0){
            this.reachEndPos = true;
            cc.log("到终点了");
            return;
        }
        let targetPoint = this.path[this.pathPointIndex];
        this.targetPos = cc.v2(targetPoint[0] * this.mapPace, targetPoint[1] * this.mapPace);
        this.moveAngle = utils.getAngleByTwoPoints(this.monster.position, this.targetPos);
    },

    updateMonster(dt){
        if(this.reachEndPos || !this.loadEnd){
            return;
        }
        let s = this.monsterV * dt;
        let dis = utils.getDistanceByTwoPoints(this.monster.position, this.targetPos);
        if(s > dis){
            this.monster.setPosition(cc.v2(this.targetPos.x, this.targetPos.y));
            this.changeTargetPos();
        }
        else {
            let offsetPos = utils.getVec2ByAngAndDis(this.moveAngle, s);
            let destination = this.monster.position.add(offsetPos);
            this.monster.setPosition(destination);
        }
    },

    update(dt){
        this.updateMonster(dt);
    },
})