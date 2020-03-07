// These entities are not included in the main game, but pose as experimental mechanics for better understanding the melonJS game engine
 
/**
 * Flash block trigger entity - causes flash blocks to appear for a few seconds
 */
game.FlashBlockTriggerEntity = me.CollectableEntity.extend({
   // Base initialisation
   init: function (x, y, settings) {
       settings.image = "SECRET";
       this._super(me.CollectableEntity, 'init', [x, y, settings]);
   },

   // Collision event
   onCollision: function (response, other) {
       if (detectMerio(other.name) && game.data.flashBlockTimer >= game.data.flashBlockTimerMax) {
           this.renderable.setOpacity(0);
           game.data.flashBlockTimer = 0;
       }
       return false;
   },
   update: function(dt) {
       if (game.data.flashBlockTimer < game.data.flashBlockTimerMax) {
           game.data.flashBlockTimer++;
           // Opacity increases while the timer is active
           this.renderable.setOpacity(game.data.flashBlockTimer / game.data.flashBlockTimerMax);
       } else {
           this.renderable.setOpacity(1);
       }

       // Evaluates to true if this moved or the update function was called
       return false;
   }
});

/**
 * Flash block entity - Opacity decreases until it is invisible and cannot be collided with
 */
game.FlashBlockEntity = me.Entity.extend({
   init: function(x, y, settings) {
       // Define the sprite here instead of in the tilemap
       settings.image = "TRAMPOLINE";

       // Call parent constructor to apply the custom changes
       this._super(me.Entity, 'init', [x, y, settings]);

       // Set friction
       this.body.setFriction(0.5, 0);
       // Register the object as standard block
       this.body.collisionType = me.collision.types.NO_OBJECT;
   },
   update: function(dt) {
       if (game.data.flashBlockTimer < game.data.flashBlockTimerMax) {
           this.body.collisionType = me.collision.types.WORLD_SHAPE;
           // Opacity decreases while the timer is active
           this.renderable.setOpacity((game.data.flashBlockTimerMax - game.data.flashBlockTimer) / game.data.flashBlockTimerMax);
       } else {
           this.body.collisionType = me.collision.types.NO_OBJECT;
           this.renderable.setOpacity(0);
       }
       // Evaluates to true if this moved or the update function was called
       return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
   }
});
