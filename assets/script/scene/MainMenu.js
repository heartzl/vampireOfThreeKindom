cc.Class({
    extends: cc.Component,

    properties: {
        chooseHeroPagePrefab: {
            default: null,
            type: cc.Prefab
        }
    },

    onLoad: function () {
    },

    onClickPhysics(){
        cc.director.loadScene("Physics");
    },

    onClickFindWay(){
        cc.director.loadScene("FindWay");
    },

    onClickBattle(){
        let chooseHeroPage = this.node.getChildByName('chooseHeroPage');
        if(chooseHeroPage){
            chooseHeroPage.active = true;
            return;
        }
        chooseHeroPage = cc.instantiate(this.chooseHeroPagePrefab);
        this.node.addChild(chooseHeroPage);
    },

    update(dt){
    },
})