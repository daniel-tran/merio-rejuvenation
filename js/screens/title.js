game.TitleScreen = me.Stage.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
        let backgroundImage = new me.Sprite(0, 0, {
            image: me.loader.getImage("title_screen")
        });
        
        // Fit the title screen background into the viewport
        backgroundImage.anchorPoint.set(0, 0);
        backgroundImage.scale(
            me.game.viewport.width / backgroundImage.width,
            me.game.viewport.height / backgroundImage.height
        );
        
        // Add to the world container
        me.game.world.addChild(backgroundImage, 1);
        
        // Add scrollable text
        me.game.world.addChild(new (me.Renderable.extend({
            init: function() {
                this._super(me.Renderable, "init", [0, 0, me.game.viewport.width, me.game.viewport.height]);

                // Assign the font
                this.font = new me.BitmapText(0, 0, {font: "PressStart2P"});

                // Animate the arrow
                this.scrollertween = new me.Tween(this).to({scrollerpos: -2200}, 10000).onComplete(this.scrollover.bind(this)).start();

                this.scroller = "ONE SMALL STEP FOR MAN...";
                this.scrollerpos = 600;
            },
            
            // Tween callback functions
            scrollover: function(){
                this.scrollerpos = 640;
                this.scrollertween.to({scrollerpos: -2200}, 10000).onComplete(this.scrollover.bind(this)).start();
            },
            
            update: function(dt) {
                return true;
            },
            
            // Initial drawing
            draw: function(renderer) {
                this.font.draw(renderer, "PLAY! NOW!", me.game.viewport.width * 0.75, me.game.viewport.height * 1.25);
                this.font.draw(renderer, this.scroller, this.scrollerpos, 440);
            },
            
            onDestroyEvent: function() {
                this.scrollertween.stop();
            }
        })), 2);
        
        // Define triggers for starting the game
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        me.input.bindPointer(me.input.pointer.LEFT, me.input.KEY.ENTER);
        this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge){
            if (action === "enter") {
                me.state.change(me.state.PLAY);
            }
        });
    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindPointer(me.input.pointer.LEFT);
        me.event.unsubscribe(this.handler);
    }
});
