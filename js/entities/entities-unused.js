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

/**
 * Donut entity - Just bounces around and can be jumped on to be defeated
 */
game.DonutEntity = me.Entity.extend({
    init: function(x, y, settings) {
        // Define the sprite here instead of in the tilemap
        settings.image = "SNOWMAN";

        // Call parent constructor to apply the custom changes
        this._super(me.Entity, 'init', [x, y, settings]);

        // Add a new physic body
        this.body = new me.Body(this);
        // Add a collision shape
        this.body.addShape(new me.Rect(0, 0, this.width, this.height));

        // Set max speed
        // X-axis velocity MUST be 1 or higher to enable X-axis movements, and is primarily controlled using this.body.force.x
        // Y-axis velocity is used to control the height of bouncing
        //
        // Why then is Y-axis motion controlled by this.body.vel.y rather than this.body.force.y?
        // Currently, using Y-axis velocity provides a better end result, and is consistent with the existing player jumping implementation.
        this.body.setMaxVelocity(getEnemyMaxSpeedX(), 6);
        // Gravity effectively controls the speed of bouncing - lower gravity = slower bounces
        this.body.gravity.y = 0.24;
        // Need to apply an initial force to get this entity moving
        this.body.force.x = 3;
        // Set friction
        this.body.setFriction(0.5, 0);
        // Enable physic collisions
        this.isKinematic = false;

        this.alwaysUpdate = true;

        // Indicate whether this enemy cannot be defeated
        this.undefeatable = false;

        // Indicate default state of the enemy
        this.alive = true;
    },
    update: function(dt) {
        if (!this.alive) {
            game.data.score += 800;
            me.game.world.removeChild(this);
        }

        // Check and update movement
        this.body.update(dt);
        // Check against collisions
        if (this.alive) {
            me.collision.check(this);
        }

        // Evaluates to true if the enemy moved or the update function was called
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },
    onCollision: function(response, other) {
        if (detectMerio(other.name) && response.b.body.collisionType !== me.collision.types.WORLD_SHAPE) {
            // Basically die if the enemy was jumped on.
            // Need to check for pos.y on each entity involved, partly because this entity moves around.
            if (this.alive && (response.overlapV.y > 0) && (other.pos.y < this.pos.y)) {
                this.alive = false;
            } else {
                // Player touched this entity, but did not result in it dying. Therefore, the player is hurt.
                other.alive = false;
            }
        } else if (response.b.body.collisionType == me.collision.types.WORLD_SHAPE) {
            // Bouncing on a solid block results in a jumping motion
            if ((response.overlapV.y > 0) && (response.overlapV.y < this.body.height)) {
                this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
            }
            // Bouncing off a wall results in bouncing back in the opposite X-axis direction
            if ((response.overlapV.x != 0) && (response.overlapV.x < this.body.width)) {
                this.body.force.x *= -1;
            }
            // Register a solid collision
            return true;
        }

        // All other objects are not solid
        return false;
    }
});
