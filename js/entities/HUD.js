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

        // Space buffer from the top of the screen
        this.offsetY = 32;

        // Score label needs to be persistent between levels, so it is manually set up and drawn as needed
        this.scoreLabel = new me.BitmapText(0, 0, getDefaultFontSettings());

        // local copy of the global score
        this.score = -1;
        
        this.lifeImage = me.loader.getImage("LIFES");
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
        // When on any menu screen, it usually indicates that the game is currently not active
        if (!isGameLevel()) {
            resetScoreAndLives();
        }
        return false;
    },

    /**
     * draw the score
     */
    draw : function (context) {
        if (isGameLevel()) {
            // Print the score display, which should not be drawn on non-levels such as the main menu
            this.scoreLabel.draw(context, "Numero: " + game.data.score, me.game.viewport.width * 0.05 + this.pos.x, this.offsetY);
            // Draw remaining lives as a series of images
            for (var i = 0; i < game.data.lives; i++) {
                // The X postition calculation draws the images from right to left, ensuring that lives are depleted from left to right.
                context.drawImage(this.lifeImage, me.game.viewport.width * 0.90 - (this.lifeImage.width * i), this.offsetY, this.lifeImage.width, this.lifeImage.height);
            }
        }
    }
});
