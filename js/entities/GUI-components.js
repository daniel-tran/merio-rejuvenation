game.MessageButtonEntity = me.GUI_Object.extend({
    // Base initialisation
    init: function (x, y, settings) {
        settings.image = "BUTTONS";
        
        settings.framewidth = 32;
        settings.frameheight = 32;
        settings.width = settings.framewidth;
        settings.height = settings.frameheight;
        
        this._super(me.GUI_Object, 'init', [x, y, settings]);
        
        // Inherit any custom properties defined in the tile map
        this.settings = settings;
        
        // Default custom settings if not defined in the tile map
        if (!this.settings.message) {
            this.settings.message = "Indubitably.";
        }
        // redirect is a string indicating a level to load when the button is pressed
        if (!this.settings.redirect) {
            this.settings.redirect = "";
        }
        // label is the text displayed next to the button
        if (!this.settings.label) {
            this.settings.label = "";
        }

        // Allow this entity to continue updates when the game is paused
        this.updateWhenPaused = true;
        
        // Set up animation states and the default animation
        this.addAnimation("off", [0]);
        this.addAnimation("on", [1]);
        this.setCurrentAnimation("off");
        
        // If there is no label, save rendering resources by not adding an extra object to the world, which would be invisible anyway
        if (this.settings.label.length > 0) {
            let label = new game.BasicTextEntity(x + ( settings.framewidth * 1.5 ), y - ( settings.frameheight * 0.1 ), this.settings.label, settings);
            me.game.world.addChild(label);
        }
    },
    
    // Runs an action when the pointer enters the collision box
    onOver: function (event) {
        this.setCurrentAnimation("on");
        return (this._super(me.GUI_Object, 'onOver', [event]));
    },
    
    // Runs an action when the pointer exits the collision box
    onOut: function (event) {
        this.setCurrentAnimation("off");
        return (this._super(me.GUI_Object, 'onOut', [event]));
    },
    
    // Update callback which is called every interval
    update: function (dt) {
        // Allow the space bar to close the message prompt
        if (me.input.isKeyPressed("space") && me.state.isPaused()) {
            toggleResume(true, "")
        }
        return (this._super(me.GUI_Object, 'update', [dt]));
    },
    
    // Click event
    onClick: function (event) {
        if (this.settings.redirect) {
            // Makes the game flash and then load the main game
            MakeshiftFlashAnimation();
            me.levelDirector.loadLevel(this.settings.redirect);
            return false;
        }
        // Pause the game to provide time to read the messages
        toggleResume(false, this.settings.message);
        return false;
    }
});

/**
* Generic text entity using BitmapText. Used display text in a single room.
*/
game.BasicTextEntity = me.GUI_Object.extend({
   // Base initialisation
   init: function (x, y, message, settings) {
       this._super(me.GUI_Object, 'init', [x, y, settings]);

       // Define a font using local .fnt and .png images.
       this.font = new me.BitmapText(0, 0, getDefaultFontSettings());

       this.message = message;
   },
   
   /**
    * draw the text
    */
   draw : function (context) {
       this.font.draw(context, this.message, this.pos.x, this.pos.y);
   }
})
