
/* Game namespace */
var game = {

    // an object where to store game information
    data : {
        // initial values, referenced when the game needs to be reset.
        // Note that these are not made immutable, even though they are not to be modified.
        initialScore: 0,
        initialLives: 3,
        // score and lives. These are set in play.js when it realises a new game is starting
        score : 0,
        lives : 0
    },


    // Run on page load.
    "onload" : function () {
        // Initialize the video.
        if (!me.video.init(640, 480, {wrapper : "screen", scale : "auto", scaleMethod: "flex-width"})) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        // Initialize the audio.
        me.audio.init("mp3,ogg");

        // set and load all resources.
        // (this will also automatically switch to the loading screen)
        me.loader.preload(game.resources, this.loaded.bind(this));
    },

    // Run on game resources loaded.
    "loaded" : function () {
        me.state.set(me.state.MENU, new game.TitleScreen());
        // Set up the necessary states to get the flash animation playing when restarting the level
        let screen = new game.PlayScreen();
        me.state.set(me.state.PLAY, screen);
        me.state.set(me.state.GAME_END, screen);
        
        // Global fading transition
        me.state.transition("fade", "#FFFFFF", 250);

        // add our player entity in the entity pool
        me.pool.register("mainPlayer", game.PlayerEntity);
        
        // Individually register other objects such as collectibles and enemies
        me.pool.register("CoinEntity", game.CoinEntity);
        me.pool.register("EnemyEntity", game.EnemyEntity);
        me.pool.register("MonstoidEntity", game.MonstoidEntity);
        me.pool.register("DustGuyEntity", game.DustGuyEntity);
        me.pool.register("BoxGuyEntity", game.BoxGuyEntity);
        me.pool.register("CowfaceEntity", game.CowfaceEntity);
        me.pool.register("MovingPlatformXEntity", game.MovingPlatformXEntity);
        me.pool.register("MovingPlatformYEntity", game.MovingPlatformYEntity);
        me.pool.register("GravityEntity", game.GravityEntity);
        
        // Various key bindings for use in js\entities\entities.js
        me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP, "jump", true);
        me.input.bindKey(me.input.KEY.J, "jump", true);
        me.input.bindKey(me.input.KEY.SPACE, "space", true);

        // Start the game. PLAY to play immediately, MENU to display other options
        me.state.change(me.state.MENU);
    }
};
