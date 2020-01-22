game.PlayScreen = me.ScreenObject.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
        // Initial level to load
        me.levelDirector.loadLevel("level1");
        
        // reset the score
        game.data.score = 0;
        
        // Play an overworld theme song
        me.audio.playTrack("forest_theme");

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
        
        // Stop playing the overworld theme song
        me.audio.stopTrack();
    }
});
