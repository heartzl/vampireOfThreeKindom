let BattleModule = cc.Class({

    extends: cc.Object,

    properties: {},

    init: function (){
        this.chooseHeroId = null;
    },

    setChooseHero: function (id){
        this.chooseHeroId = id;
    },

    getChooseHero: function (){
        return this.chooseHeroId;
    },

})

module.exports = BattleModule;
