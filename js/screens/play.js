game.PlayScreen = me.Stage.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
        // Initial level to load
        // Since levels can be restarted, the loaded level needs to vary 
        // based on which tile set this callback is called in.
        var currentLevel = me.levelDirector.getCurrentLevel().name;
        me.levelDirector.loadLevel(currentLevel);

        // reset the score and life count when starting a new game
        if (game.data.lives <= 0) {
            resetScoreAndLives();
        }

        // Add our HUD to the game world, add it last so that this is on top of the rest.
        // Can also be forced by specifying a "Infinity" z value to the addChild function.
        this.HUD = new game.HUD.Container();
        me.game.world.addChild(this.HUD);
    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        // remove the HUD from the game world
        me.game.world.removeChild(this.HUD);
    }
});
