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
        
        // Define a font using existing CSS styles. Mandatory properties are font and size.
        this.font = new me.Text(0, 0, {font: "Arial", size: 32, fillStyle: "#FFFFFF"});
        this.font.textAlign = "right";
        this.font.textBaseline = "top";

        // local copy of the global score
        this.score = -1;
    },

    /**
     * update function
     */
    update : function () {
        // This is present in all screens, so it can be used to determine the background music.
        playBGM();
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
        if (isGameLevel()) {
            // pos variables are relative to the viewport origin
            this.font.draw(context, `Score: ${game.data.score}`, me.game.viewport.width * 0.90 + this.pos.x, me.game.viewport.height * 0.10 + this.pos.y);
            this.font.draw(context, `Lifes: ${game.data.lives}`, me.game.viewport.width * 0.90 + this.pos.x, me.game.viewport.height * 0.25 + this.pos.y);
        }
    }

});
