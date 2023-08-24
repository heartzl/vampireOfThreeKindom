const zl = require("zl");

const BattleModule = require("BattleModule");

let Player = cc.Class({

    extends: cc.Object,

    properties: {
    },

    statics: {
        _instance: null,
        getSelf: function() {
            if (!this._instance) {
                this._instance = new Player();
            }
            return this._instance;
        },
    },

    ctor: function() {
        this.allModules = [];
        this.allModules.push(this.battleModule = new BattleModule());
    },

    init: function(){
        for(let i = 0; i < this.allModules.length; i++){
            let mod = this.allModules[i];
            mod.init();
        }
    },
})

zl.player = Player.getSelf();