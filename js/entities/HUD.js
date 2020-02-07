/**
 * a HUD container and child items
 */

game.HUD = game.HUD || {};


game.HUD.Container = me.Container.extend({

    init: function() {
        // call the constructor
        this._super(me.Container, 'init');

        // persistent across level change
        this.isPersistent = true;

        // make sure we use screen coordinates
        this.floating = true;

        // give a name
        this.name = "HUD";

        // add our child score object at the top left corner
        this.addChild(new game.HUD.ScoreItem(5, 5));
    }
});


/**
 * a basic HUD item to display score
 */
game.HUD.ScoreItem = me.Renderable.extend({
    /**
     * constructor
     */
    init: function(x, y) {

        // call the parent constructor
        // (size does not matter here)
        this._super(me.Renderable, 'init', [x, y, 10, 10]);
        
        // Assign the font
        this.font = new me.BitmapText(0, 0, {font: "PressStart2P"});
        this.font.textAlign = "right";
        this.font.textBaseline = "top";

        // local copy of the global score
        this.score = -1;
    },

    /**
     * update function
     */
    update : function () {
        // we don't do anything fancy here, so just
        // return true if the score has been updated
        if (this.score !== game.data.score) {
            this.score = game.data.score;
            return true;
        }
        return false;
    },

    /**
     * draw the score
     */
    draw : function (context) {
        let currentLevel = me.levelDirector.getCurrentLevel().name;
        if (currentLevel !== "_startmenu") {
            // pos variables are relative to the viewport origin
            this.font.draw(context, `Score: ${game.data.score}`, me.game.viewport.width * 0.90 + this.pos.x, me.game.viewport.height * 0.10 + this.pos.y);
            this.font.draw(context, `Lifes: ${game.data.lives}`, me.game.viewport.width * 0.90 + this.pos.x, me.game.viewport.height * 0.25 + this.pos.y);
        }
    }

});
