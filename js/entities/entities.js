/**
 * Player Entity
 */
game.PlayerEntity = me.Entity.extend({

    /**
     * constructor
     */
    init:function (x, y, settings) {
        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        
        // Add a new physic body
        this.body = new me.Body(this);
        // Add collision shapes which override the default shape in the tilemap
        // This collision box represents Merio's "hair" which he can use to climb ledges
        this.body.addShape(new me.Polygon(0, 0, [
           new me.Vector2d(0, 0), new me.Vector2d(this.width, 0), 
           new me.Vector2d(this.width, getHairHeight()), new me.Vector2d(0, getHairHeight())
        ]));
        // This is the collision box for Merio's body
        this.body.addShape(new me.Polygon(0, 0, [
           new me.Vector2d(getRightScaledValue(this.width), getHairHeight()), new me.Vector2d(getRightScaledValue(this.width), this.height),
           new me.Vector2d(getLeftScaledValue(this.width), this.height), new me.Vector2d(getLeftScaledValue(this.width), getHairHeight())
        ]));
        
        // Max walking speed
        this.body.setMaxVelocity(4, 20);
        
        // When on a moving platform, we want to be able to move around on it.
        // Use this value to make Merio slightly faster so he can move with the motion of the platform,
        // while also promoting a slight speed boost when running against it
        this.body.extendedMaxVelX = this.body.maxVel.x * 1.25;
        
        // Max jumping speed
        this.body.setFriction(0.5, 0);
        
        // When riding the platform, activate logic which causes motion when idling
        this.body.ridingplatform = false;
        
        // Make the display follow the player around on all 2D dimensions
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH, 0.5);
        
        // Update the player when outside the viewport
        this.alwaysUpdate = true;
        
        // Indicate the walking animation
        this.renderable.addAnimation("walk", [0])
        
        // Indicate which sprite is for idling
        this.renderable.addAnimation("stand", [0]);
        
        // Indicate which sprite is for jumping
        this.renderable.addAnimation("jump", [1]);

        // Default animation
        this.renderable.setCurrentAnimation("stand");
    },

    /**
     * update the entity
     */
    update : function (dt) {
        this.body.maxVel.x = 4;
        if (me.input.isKeyPressed("left")) {
            // Flip the sprite on X axis
            this.renderable.flipX(true);
            // Apply moving platform speed boost
            if (this.body.ridingplatform) {
                this.body.maxVel.x = this.body.extendedMaxVelX;
            }
            // Move the player by inverting their X axis force
            this.body.force.x = -this.body.maxVel.x;
            // Adjust the collision box so that you can cling onto edges
            this.body.getShape(1).points[0].x = this.width;
            this.body.getShape(1).points[1].x = this.width;
            this.body.getShape(1).points[2].x = getLeftScaledValue(this.width);
            this.body.getShape(1).points[3].x = getLeftScaledValue(this.width);
            //this.body.ridingplatform = false;
            
            // Set the actual walking animation
            if (!this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk");
            }
        } else if (me.input.isKeyPressed("right")) {
             // Since the default direction is right, remove X axis flip changes
            this.renderable.flipX(false);
            // Apply moving platform speed boost
            if (this.body.ridingplatform) {
                this.body.maxVel.x = this.body.extendedMaxVelX;
            }
            // Move the player by using their X axis force
            this.body.force.x = this.body.maxVel.x;
            // Adjust the collision box so that you can cling onto edges
            this.body.getShape(1).points[0].x = getRightScaledValue(this.width);
            this.body.getShape(1).points[1].x = getRightScaledValue(this.width);
            this.body.getShape(1).points[2].x = 0;
            this.body.getShape(1).points[3].x = 0;
            this.body.ridingplatform = false;
            
            // Set the actual walking animation
            if (!this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk");
            }
        } else {
            // Player is currently idling
            if (!this.body.ridingplatform){
                // When not on a moving platform, no motion is active.
                this.body.force.x = 0;
            }
            // Use the standing animation
            this.renderable.setCurrentAnimation("stand");
        }
        
        if (me.input.isKeyPressed("jump")) {
            // Can't jump while in mid-air
            if (!this.body.jumping && !this.body.falling) {
                // Push the player up according to their Y axis force
                // and rely on in-built gravity to make the player fall
                //    this.body.force.y = -this.body.maxVel.y;
                // Push the player up with some initial acceleration
                this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                this.body.jumping = true;
                this.body.ridingplatform = false;
            }
        }

        // Use the jump animation while airborne
        if (this.body.jumping || this.body.falling){
            this.renderable.setCurrentAnimation("jump");
        }

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

   /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
        // Reset from floaty behaviour
        this.body.gravity.y = 0.98;
        this.body.maxVel.y = 20;
        this.renderable.setOpacity(1);
        // Different reactions for colliding with different object types
        switch (response.b.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
                this.body.ridingplatform = false;
                if (other.type === "platform") {
                    // Allow the player to drop down from a platform with velocity considerations
                    if (this.body.falling && !me.input.isKeyPressed("down") && 
                        (response.overlapV.y > 0) && (~~this.body.vel.y >= ~~response.overlapV.y)) {
                            // Disable X axis collision to allow for the player to pass through
                            response.overlapV.x = 0;
                            // Try not to use the jump animation while on ground
                            this.renderable.setCurrentAnimation("stand");
                            // Still consider the platform to be solid
                            return true;
                        }
                    // Player is free to pass through in any case
                    return false;
                }
                break;
            case me.collision.types.USER:
                this.body.gravity.y = 0.98;
                this.body.maxVel.y = 20;
                // Allow the player to drop down from a platform with velocity considerations
                if ((response.overlapV.y > 0)) {
                    // Allow the player to ride on an enemy's motion
                    this.body.ridingplatform = true;
                    // Since true = 1 and false = 0, Merio's X axis motion can be toggled
                    // based on the current X velocity of the platform itself.
                    // As such, the direction can be 1 - 0 (right) or 0 - 1 (left).
                    let direction = ((response.b.body.vel.x > 0) - (response.b.body.vel.x < 0));
                    this.body.force.x = this.body.maxVel.x * direction;
                }else{this.body.ridingplatform = false;}
                // Player is free to pass through in any case
                return true;
            case me.collision.types.ENEMY_OBJECT:
                // If the enemy cannot be defeated, Merio will always lose to them.
                if (other.undefeatable) {
                    // Restart the level
                    me.levelDirector.reloadLevel();
                    return true;
                }
                // Action for when the player jumps on a known enemy object
                if ((response.overlapV.y > 0) && !this.body.jumping) {
                    // Force a mini jump when they have been defeated
                    /*this.body.falling = false;
                    this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                    this.body.jumping = true;*/
                } else {
                    // Player got hurt by colliding with the enemy
                    this.renderable.flicker(750);
                    // Restart the level
                    me.levelDirector.reloadLevel();
                }
                // Player is free to pass through in any case
                return true;
            default:
                // Player is free to pass through in any case
                return false;
        }
        
        // Make all other objects solid
        return true;
    }
});


/**
 * Coin entity
 */
 game.CoinEntity = me.CollectableEntity.extend({
     // Base initialisation
     init: function (x, y, settings) {
         this._super(me.CollectableEntity, 'init', [x, y, settings]);
     },
     
     // Collision event
     onCollision: function (response, other) {
         // Add various events to occur when this is collected
         game.data.score += 5000;
         
         // Once collected, it should only register once
         this.body.setCollisionMask(me.collision.types.NO_OBJECT);
         
         // Garbage collection for a collected object
         me.game.world.removeChild(this);
         
         return false;
     }
 });
 
 
/**
 * Enemy entity, with custom initialisation of various settings
 */
 game.EnemyEntity = me.Sprite.extend({
     init: function(x, y, settings) {
         // Get the area size that was defined in the tilemap
         let width = settings.width;
         
         // Define the sprite here instead of in the tilemap
         settings.image = "MONSTOID";
         
         // Create the object at the right size
         settings.framewidth = 64;
         settings.frameheight = 64;
         settings.width = settings.framewidth;
         settings.height = settings.frameheight;
         
         // Call parent constructor to apply the custom changes
         this._super(me.Sprite, 'init', [x, y, settings]);
         
         // Add a new physic body
         this.body = new me.Body(this);
         // Add a collision shape
         this.body.addShape(new me.Rect(0, 0, this.width, this.height));
         // Set max speed
         this.body.setMaxVelocity(2, 0);
         // Set friction
         this.body.setFriction(0.5, 0);
         // Enable physic collisions
         this.isKinematic = false;
         // Update the player when outside the viewport
         this.alwaysUpdate = true;
         
         // Positioning
         x = this.pos.x;
         this.startX = x;
         this.pos.x = x + width - this.width;
         this.endX = this.pos.x;
         
         // Indicate default walking direction
         this.walkLeft = false;
         
         // Indicate default state of the enemy
         this.alive = true;
     },
     update: function(dt) {
         // Enemy moves side to side
         if (this.alive) {
             if (this.walkLeft && this.pos.x <= this.startX) {
                 this.walkLeft = false;
                 this.body.force.x = this.body.maxVel.x;
             } else if (!this.walkLeft && this.pos.x >= this.endX) {
                 this.walkLeft = true;
                 this.body.force.x = -this.body.maxVel.x;
             }
             this.flipX(this.walkLeft);
         } else {
             this.body.force.x = 0;
             me.game.world.removeChild(this);
         }
         
         // Check and update movement
         this.body.update(dt);
         // Check against collisions
         if (this.alive) {
            me.collision.check(this);
         }
         
         // Evaluates to true if the enemy moved or the update function was called
         return (this._super(me.Sprite, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
     },
     onCollision: function(response, other) {
         if (response.b.body.collisionType !== me.collision.types.WORLD_SHAPE) {
             // Basically die if the enemy was jumped on
             if (this.alive && (response.overlapV.y  > 0) && response.a.body.falling) {
                 this.alive = false;
             }
             return false;
         }
         // All other objects are solid
         return true;
     }
 });
 
 /**
 * Orange monstoid entity
 */
 game.MonstoidEntity = me.Sprite.extend({
     init: function(x, y, settings) {
         // Get the area size that was defined in the tilemap
         let width = settings.width;
         
         // Define the sprite here instead of in the tilemap
         settings.image = "MONSTOID";
         
         // Create the object at the right size
         settings.framewidth = 64;
         settings.frameheight = 64;
         settings.width = settings.framewidth;
         settings.height = settings.frameheight;
         
         // Call parent constructor to apply the custom changes
         this._super(me.Sprite, 'init', [x, y, settings]);
         
         // Add a new physic body
         this.body = new me.Body(this);
         // Add a collision shape
         this.body.addShape(new me.Rect(0, 0, this.width, this.height));
         // Set max speed
         this.body.setMaxVelocity(2, 0);
         // Set friction
         this.body.setFriction(0.5, 0);
         // Enable physic collisions
         this.isKinematic = false;
         // Update the player when outside the viewport
         this.alwaysUpdate = true;
         
         // Positioning
         x = this.pos.x;
         this.startX = x;
         this.pos.x = x + width - this.width;
         this.endX = this.pos.x;
         
         // Indicate default walking direction
         this.walkLeft = false;
         
         // Indicate whether this enemy cannot be defeated
         this.undefeatable = true;
     },
     update: function(dt) {
         // Enemy moves side to side
         if (this.walkLeft && this.pos.x <= this.startX) {
             this.walkLeft = false;
             this.body.force.x = this.body.maxVel.x;
         } else if (!this.walkLeft && this.pos.x >= this.endX) {
             this.walkLeft = true;
             this.body.force.x = -this.body.maxVel.x;
         }
         
         // Check and update movement
         this.body.update(dt);
         
         // Evaluates to true if the enemy moved or the update function was called
         return (this._super(me.Sprite, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
     }
 });
 
 /**
 * Grey dust guy entity
 */
 game.DustGuyEntity = me.Sprite.extend({
     init: function(x, y, settings) {
         // Get the area size that was defined in the tilemap
         let height = settings.height;
         
         // Define the sprite here instead of in the tilemap
         settings.image = "DUSTGUY";
         
         // Create the object at the right size
         settings.framewidth = 64;
         settings.frameheight = 64;
         settings.width = settings.framewidth;
         settings.height = settings.frameheight;
         
         // Call parent constructor to apply the custom changes
         this._super(me.Sprite, 'init', [x, y, settings]);
         
         // Add a new physic body
         this.body = new me.Body(this);
         // Add a collision shape
         this.body.addShape(new me.Rect(0, 0, this.width, this.height));
         // Set max speed
         this.body.setMaxVelocity(0, 2);
         // Set friction
         this.body.setFriction(0.5, 0);
         // Enable physic collisions
         this.isKinematic = false;
         // Update the player when outside the viewport
         this.alwaysUpdate = true;
         
          // Positioning
         y = this.pos.y;
         this.startY = y;
         this.pos.y = y + height - this.height;
         this.endY = this.pos.y;
         
         // Indicate default walking direction
         this.walkUp = false;
         
         // Indicate whether this enemy cannot be defeated
         this.undefeatable = true;
     },
     update: function(dt) {
         // Enemy moves side to side
         if (this.walkUp && this.pos.y <= this.startY) {
             this.walkUp = false;
             this.body.force.y = this.body.maxVel.y;
         } else if (!this.walkUp && this.pos.y >= this.endY) {
             this.walkUp = true;
             this.body.force.y = -this.body.maxVel.y;
         }
         
         // Check and update movement
         this.body.update(dt);
         
         // Evaluates to true if the enemy moved or the update function was called
         return (this._super(me.Sprite, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
     }
 });
 
 /**
 * X Axis Moving platform entity
 */
 game.MovingPlatformXEntity = me.Sprite.extend({
     init: function(x, y, settings) {
         // Get the area size that was defined in the tilemap
         let width = settings.width;
         
         // Define the sprite here instead of in the tilemap
         settings.image = "MOVINGPLATFORM";
         
         // Create the object at the right size
         settings.framewidth = 128;
         settings.frameheight = 32;
         settings.width = settings.framewidth;
         settings.height = settings.frameheight;
         
         // Call parent constructor to apply the custom changes
         this._super(me.Sprite, 'init', [x, y, settings]);
         
         // Add a new physic body
         this.body = new me.Body(this);
         // Add a collision shape
         this.body.addShape(new me.Rect(0, 0, this.width, this.height));
         // Set max speed. Keep the values the same as Merio's max speeds so he can ride on these reliably.
         this.body.setMaxVelocity(4, 0);
         // Set friction
         this.body.setFriction(0.5, 0);
         // Register the object as not an ENEMY_OBJECT
         // Omitting this line means you are applying enemy collision triggers
         // Also, it seems USER is the only type that maintains the proprties of regular platforms
         this.body.collisionType = me.collision.types.USER;
         
         // Update the player when outside the viewport
         this.alwaysUpdate = true;
         
         // Enable physic collisions
         this.isKinematic = false;
         
         // Positioning
         x = this.pos.x;
         this.startX = x;
         this.pos.x = x + width - this.width;
         this.endX = this.pos.x;
         
         // Indicate default walking direction
         this.walkLeft = false;
     },
     update: function(dt) {
         // Enemy moves side to side
         if (this.walkLeft && this.pos.x <= this.startX) {
             this.walkLeft = false;
             this.body.force.x = this.body.maxVel.x;
         } else if (!this.walkLeft && this.pos.x >= this.endX) {
             this.walkLeft = true;
             this.body.force.x = -this.body.maxVel.x;
         }
         
         // Check and update movement
         this.body.update(dt);
         
         // Evaluates to true if the enemy moved or the update function was called
         return (this._super(me.Sprite, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
     }
 });
 
  /**
 * Y Axis Moving platform entity
 */
 game.MovingPlatformYEntity = me.Sprite.extend({
     init: function(x, y, settings) {
         // Get the area size that was defined in the tilemap
         let height = settings.height;
         
         // Define the sprite here instead of in the tilemap
         settings.image = "MOVINGPLATFORM";
         
         // Create the object at the right size
         settings.framewidth = 128;
         settings.frameheight = 32;
         settings.width = settings.framewidth;
         settings.height = settings.frameheight;
         
         // Call parent constructor to apply the custom changes
         this._super(me.Sprite, 'init', [x, y, settings]);
         
         // Add a new physic body
         this.body = new me.Body(this);
         // Add a collision shape
         this.body.addShape(new me.Rect(0, 0, this.width, this.height));
         // Set max speed
         this.body.setMaxVelocity(0, 1);
         // Set friction
         this.body.setFriction(0.5, 0);
         // Register the object as not an ENEMY_OBJECT
         // Omitting this line means you are applying enemy collision triggers
         // Also, it seems USER is the only type that maintains the proprties of regular platforms
         this.body.collisionType = me.collision.types.USER;
         
         // Update the player when outside the viewport
         this.alwaysUpdate = true;
         
         // Enable physic collisions
         this.isKinematic = false;
         
         // Positioning
         y = this.pos.y;
         this.startY = y;
         this.pos.y = y + height - this.height;
         this.endY = this.pos.y;
         
         // Indicate default walking direction
         this.walkUp = false;
     },
     update: function(dt) {
         // Enemy moves side to side
         if (this.walkUp && this.pos.y <= this.startY) {
             this.walkUp = false;
             this.body.force.y = this.body.maxVel.y;
         } else if (!this.walkUp && this.pos.y >= this.endY) {
             this.walkUp = true;
             this.body.force.y = -this.body.maxVel.y;
         }
         
         // Check and update movement
         this.body.update(dt);
         
         // Evaluates to true if the enemy moved or the update function was called
         return (this._super(me.Sprite, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
     },
     onCollision: function (response, other) {
         // When riding up, prevent the collision boxes from mashing which stops jumping
         // Check for overlap, so this is only applied when standing on top of the platform
         if (this.walkUp && (response.overlapV.y  > 0)){
            other.body.vel.y = -other.body.maxVel.y * 0.1 * me.timer.tick;
         }
         return false;
     }
 });
 
 /**
 * Gravity entity
 */
 game.GravityEntity = me.CollectableEntity.extend({
     // Base initialisation
     init: function (x, y, settings) {
         this._super(me.CollectableEntity, 'init', [x, y, settings]);
     },
     
     // Collision event
     onCollision: function (response, other) {
         // Apply floaty motion
         other.body.gravity.y = 0.1;
         other.body.maxVel.y = 5;
         // Just a visual reminder of floaty behaviour
         other.renderable.setOpacity(0.5);
         return false;
     }
 });