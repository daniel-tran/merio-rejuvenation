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
        this.body.setMaxVelocity(getPlayerMaxSpeedX(), getPlayerMaxSpeedY());
        
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
        
        // Indicates if Merio has lost a life
        this.alive = true;
    },

    /**
     * update the entity
     */
    update : function (dt) {
        
        // Actions for when if Merio has died. This cannot be done in the onCollision callback,
        // as Merio actually collides with enemies multiple times, triggering these more than once per life.
        if (!this.alive) {
            // Reduce the life count
            game.data.lives--;
            if (game.data.lives <= 0) {
                // GAME IS OVER
                // Keep lives at 0, so that it doesn't spike into the negative values
                game.data.lives = 0;
                // Go to a screen where it's more obvious that a GAME OVER has occurred.
                MakeshiftFlashAnimation();
                me.levelDirector.loadLevel("gameover");
            } else {
                // Player still has lives remaining
                me.levelDirector.reloadLevel();
                MakeshiftFlashAnimation();
            }
            return false;
        }
        
        // Default speed settings when not riding on a platform,
        // ensuring such motion changes aren't always applied.
        if (!this.body.ridingplatform){
            this.body.maxVel.x = getPlayerMaxSpeedX();
        } else {
            // Naively, this is also applied to vertical moving platforms.
            this.body.maxVel.x = getMovingPlatformMaxSpeedX();
        }

        if (me.input.isKeyPressed("left")) {
            // Flip the sprite on X axis
            this.renderable.flipX(true);
            // Apply moving platform speed boost
            if (this.body.ridingplatform) {
                this.body.maxVel.x = getPlayerExtendedMaxSpeedX();
            }
            // Move the player by inverting their X axis force
            this.body.force.x = -this.body.maxVel.x;
            // Adjust the collision box so that you can cling onto edges
            this.body.getShape(1).points[0].x = this.width;
            this.body.getShape(1).points[1].x = this.width;
            this.body.getShape(1).points[2].x = getLeftScaledValue(this.width);
            this.body.getShape(1).points[3].x = getLeftScaledValue(this.width);
            //this.body.ridingplatform = false;
            
            // Set the actual walking animation only when the player is physically grounded
            if (this.body.vel.y === 0 || this.body.ridingplatform) {
                this.renderable.setCurrentAnimation("walk");
            }
        } else if (me.input.isKeyPressed("right")) {
             // Since the default direction is right, remove X axis flip changes
            this.renderable.flipX(false);
            // Apply moving platform speed boost
            if (this.body.ridingplatform) {
                this.body.maxVel.x = getPlayerExtendedMaxSpeedX();
            }
            // Move the player by using their X axis force
            this.body.force.x = this.body.maxVel.x;
            // Adjust the collision box so that you can cling onto edges
            this.body.getShape(1).points[0].x = getRightScaledValue(this.width);
            this.body.getShape(1).points[1].x = getRightScaledValue(this.width);
            this.body.getShape(1).points[2].x = 0;
            this.body.getShape(1).points[3].x = 0;
            this.body.ridingplatform = false;
            
            // Set the actual walking animation only when the player is physically grounded
            if (this.body.vel.y === 0 || this.body.ridingplatform) {
                this.renderable.setCurrentAnimation("walk");
            }
        } else {
            // Player is currently idling
            if (!this.body.ridingplatform){
                // When not on a moving platform, no motion is active.
                this.body.force.x = 0;
            }
            // Use the standing animation when the player is physically grounded
            if (this.body.vel.y === 0 || this.body.ridingplatform) {
                this.renderable.setCurrentAnimation("stand");
            }
        }
        
        if (me.input.keyStatus("jump")) {
            // Can't jump while in mid-air
            if (!this.body.jumping && !this.body.falling) {
                // Push the player up according to their Y axis force
                // and rely on in-built gravity to make the player fall
                //    this.body.force.y = -this.body.maxVel.y;
                // Push the player up with some initial acceleration
                this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                this.body.jumping = true;
            }
        }

        // Use the jump animation while airborne
        if (this.body.jumping || this.body.falling){
            this.renderable.setCurrentAnimation("jump");
            // When airborne, the player is physically not riding the platform
            this.body.ridingplatform = false;
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
        this.body.gravity.y = getPlayerMaxGravityY();
        this.body.maxVel.y = getPlayerMaxSpeedY();
        this.renderable.setOpacity(1);
        // Different reactions for colliding with different object types
        switch (response.b.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
                if (!other.name.startsWith("MovingPlatform")){
                    // The block is just a static piece of the environment
                    this.body.ridingplatform = false;
                } else {
                    // Player is currently in contact with a moving platform.
                    // Only ride the platform when physically on top of it within a certain height range
                    if ((response.overlapV.y > 0) && (response.overlapV.y < this.body.height)) {
                        // Allow the player to ride on an enemy's motion
                        this.body.ridingplatform = true;
                        // Since true = 1 and false = 0, Merio's X axis motion can be toggled
                        // based on the current X velocity of the platform itself.
                        // As such, the direction can be 1 - 0 (right) or 0 - 1 (left).
                        let direction = ((response.b.body.vel.x > 0) - (response.b.body.vel.x < 0));
                        this.body.force.x = response.b.body.maxVel.x * direction;
                        // Use the idling animation when not moving around on the platform
                        if (!this.renderable.isCurrentAnimation("walk")) {
                            this.renderable.setCurrentAnimation("stand");
                        }
                    }else{
                        this.body.ridingplatform = false;
                    }
                }
                if (other.type === "platform") {
                    // Allow the player to drop down from a platform with velocity considerations
                    if (this.body.falling && (response.overlapV.y > 0) && (~~this.body.vel.y >= ~~response.overlapV.y)) {
                        // Disable X axis collision to allow for the player to pass through
                        response.overlapV.x = 0;
                        // Still consider the platform to be solid
                        return true;
                    }
                    // Player is free to pass through in any case
                    return false;
                }
                break;
            case me.collision.types.ENEMY_OBJECT:
                // If the enemy cannot be defeated, Merio will always lose to them.
                if (other.undefeatable) {
                    this.alive = false;
                    return true;
                }
                // Action for when the player jumps on a known enemy object
                if ((response.overlapV.y > 0) && !this.body.jumping) {
                    // Force a mini jump when they have been defeated
                    /*this.body.falling = false;
                    this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                    this.body.jumping = true;*/
                } else if (!detectMerio(other.name)) {
                    // Player got hurt by colliding with the enemy
                    //this.renderable.flicker(750);
                    this.alive = false;
                }
                // Player is free to pass through in any case
                return false;
            default:
                // Gravity zones cause strange behaviour when colliding with moving platforms.
                // These are manual speed fix-ups that try to alleviate scenarios such as:
                // - Jumping in the gravity zone from a moving platform while hanging on with your hair
                // - Jumping in the gravity zone and colliding with the moving platform while in mid-air
                if (other.name === "GravityEntity" && this.body.vel.y < 0) {
                    this.body.force.x = 0;
                    /** WARNING! THIS WILL PLAY THE JUMP ANIMATION WHEN HANGING FROM Y-AXIS MOVING PLATFORMS IN THE GRAVITY ZONE! **/
                    this.renderable.setCurrentAnimation("jump");
                }
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
         settings.image = "SECRET";
         this._super(me.CollectableEntity, 'init', [x, y, settings]);
     },
     
     // Collision event
     onCollision: function (response, other) {
         if (detectMerio(other.name)) {
            // Add various events to occur when this is collected
            game.data.score += 1000000;
            
            // Once collected, it should only register once
            this.body.setCollisionMask(me.collision.types.NO_OBJECT);
            
            // Garbage collection for a collected object
            me.game.world.removeChild(this);
         }
         
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
         this.body.setMaxVelocity(getEnemyMaxSpeedX(), 0);
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
         
         // Call parent constructor to apply the custom changes
         this._super(me.Sprite, 'init', [x, y, settings]);
         
         // Add a new physic body
         this.body = new me.Body(this);
         // Add a collision shape
         this.body.addShape(new me.Rect(0, 0, this.width, this.height));
         // Set max speed
         this.body.setMaxVelocity(getEnemyMaxSpeedX(), 0);
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
         
         // Call parent constructor to apply the custom changes
         this._super(me.Sprite, 'init', [x, y, settings]);
         
         // Add a new physic body
         this.body = new me.Body(this);
         // Add a collision shape
         this.body.addShape(new me.Rect(0, 0, this.width, this.height));
         // Set max speed
         this.body.setMaxVelocity(0, getEnemyMaxSpeedY());
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
 * Cowface entity
 */
 game.CowfaceEntity = me.Entity.extend({
     init: function(x, y, settings) {
         
         // Define the sprite here instead of in the tilemap
         settings.image = "COWFACE";
                  
         // Call parent constructor to apply the custom changes
         this._super(me.Entity, 'init', [x, y, settings]);
         
         // Inherit any custom properties defined in the tile map
         // Note that this can only be done when extending the Entity object
         this.settings = settings;
         
         // Add a new physic body
         this.body = new me.Body(this);
         // Add a collision shape
         this.body.addShape(new me.Rect(0, 0, this.width, this.height));
         // Set max speed
         this.body.setMaxVelocity(0, 0);
         // Enable physic collisions
         this.isKinematic = false;
         // Update the player when outside the viewport
         this.alwaysUpdate = true;
         
         // Indicate which sprite is for idling
        this.renderable.addAnimation("active", [0]);
        
        // Indicate which sprite is for jumping
        this.renderable.addAnimation("inactive", [1]);

        // Default animation
        this.renderable.setCurrentAnimation("active");
         
        // Indicate whether this enemy cannot be defeated
        this.undefeatable = true;
        
        // Reference to the main player, since this enemy's behaviour depends on the player's actions
        this.merio = undefined;
        
        // this.settings.active is a variable defined for the this enemy in the tile map.
        // When undefined, Cowface will always be asleep.
        // When defined, Cowface will use that state when Merio is airborne.
     },
     update: function(dt) {
         // A reference to the main player can only be done once all the entities on the level have loaded.
         // This only needs to be done once per instance of Cowface, to save computational resources.
         if (this.merio === undefined) {
             this.merio = me.game.world.getChildByName("mainPlayer")[0];
         }
         
         // Toggle the state of Cowface when a certain condition is met.
         // Compare that condition with the this.settings.active since not all Cowface instances should behave the same.
         if ((this.merio.body.jumping || this.merio.body.falling) === this.settings.active) {
             this.renderable.setCurrentAnimation("active");
             this.body.collisionType = me.collision.types.ENEMY_OBJECT;
         } else {
             this.renderable.setCurrentAnimation("inactive");
             // Change the collision type so it becomes safe to pass through Cowface
             this.body.collisionType = me.collision.types.ACTION;
         }
         
         // Check and update movement
         this.body.update(dt);
         
         // Evaluates to true if the enemy moved or the update function was called
         return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
     }
 });
 
 /**
 * Snowman entity, with custom initialisation of various settings
 */
 game.SnowmanEntity = me.Entity.extend({
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
         this.body.setMaxVelocity(0, 0);
         // Set friction
         this.body.setFriction(0.5, 0);
         // Enable physic collisions
         this.isKinematic = false;
         // This enemy doesn't move, so it does not require updating when outside the viewport
         this.alwaysUpdate = false;
         
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
 * Red box entity
 */
 game.BoxGuyEntity = me.Entity.extend({
     init: function(x, y, settings) {
         // Define the sprite here instead of in the tilemap
         settings.image = "BOXGUY";

         // Call parent constructor to apply the custom changes
         this._super(me.Entity, 'init', [x, y, settings]);
         // Inherit any custom properties defined in the tile map
         // Note that this can only be done when extending the Entity object
         this.settings = settings;

         // Add a new physic body
         this.body = new me.Body(this);
         // Add a collision shape
         this.body.addShape(new me.Rect(0, 0, this.width, this.height));
         // Set friction
         this.body.setFriction(0.5, 0);
         // Register the object as standard block
         this.body.collisionType = me.collision.types.WORLD_SHAPE;

         // Enable physic collisions
         this.isKinematic = false;
         
         // Allow this entity to continue updates when the game is paused
         this.updateWhenPaused = true;

         // Default message index if not defined in the tile map
         if (!this.settings.messageIndex) {
             this.settings.messageIndex = 0;
         }
         // Set the redirect property when the box guy is intended to transition the player to a new screen
         if (!this.settings.redirect) {
             this.settings.redirect = "";
         }

         // List of all possible messages the box guy can say.
         // Select a set of responses by defining the messageIndex custom property on a BoxGuyEntity in the tilemap.
         this.messages = [
            ["ARG?"],
            ["WHOOP, WE FOUND IT", "HOW ABOUT YOU"],
         ];
         this.messageLength = this.messages[this.settings.messageIndex].length;
         // Use a subindex to detect which message in the individual sets to display
         this.messageSubIndex = -1;
         
         // A custom function that can be called to read the next message, triggered by
         // either a key press in entities.js or using an external call to this function in entity-data.js.
         this.nextMessage = function(){
            // Relying on the update function to be called on an interval basis to display the next message text
            this.messageSubIndex++;
            
            // Once all the messages have been read, resume the game and hide the dialog box
            if (this.messageSubIndex >= this.messageLength) {
                this.messageSubIndex = -1;
                toggleResume(true, "");

                // Transition to a new screen (if any) once all the messages have been read
                if (this.settings.redirect) {
                    MakeshiftFlashAnimation();
                    me.levelDirector.loadLevel(this.settings.redirect);
                }
            }
         };
     },
     onCollision: function (response, other) {
         // Only react when the player jumps from below and hits the box guy
         if (detectMerio(other.name)) {
            if ((response.overlapV.y < 0) && other.body.vel.y < 0){
                // Print out specific messages from the list of possible messages
                this.messageSubIndex = 0;
            }
         }
         return false;
     },
     update: function(dt) {
         // Perform message display actions when it needs to be displayed
         if (this.messageSubIndex >= 0 && this.messageSubIndex < this.messageLength) {
             // Pause the game to provide time to read the messages
             // Show the message using the dialog box defined in index.html
             toggleResume(false, this.messages[this.settings.messageIndex][this.messageSubIndex]);
             
             // Read the next message using the spacebar
             if (me.input.isKeyPressed("space")) {
                this.nextMessage();
            }
         }
         
         // Evaluates to true if the enemy moved or the update function was called
         return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
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
         this.body.setMaxVelocity(getMovingPlatformMaxSpeedX(), 0);
         // Set friction
         this.body.setFriction(0.5, 0);
         // Register the object as standard block
         this.body.collisionType = me.collision.types.WORLD_SHAPE;
         
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
         this.body.setMaxVelocity(0, getMovingPlatformMaxSpeedY());
         // Set friction
         this.body.setFriction(0.5, 0);
         // Register the object as standard block
         this.body.collisionType = me.collision.types.WORLD_SHAPE;
         
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
         if (detectMerio(other.name)) {
            if (this.walkUp && (response.overlapV.y  > 0)){
                other.body.vel.y = -other.body.maxVel.y * 0.2 * me.timer.tick;
            }
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
         if (detectMerio(other.name)) {
            // Apply floaty motion
            other.body.gravity.y = getPlayerSlowedGravityY();
            other.body.maxVel.y = getPlayerSlowedSpeedY();
            // Just a visual reminder of floaty behaviour
            other.renderable.setOpacity(0.5);
         }
         return false;
     }
 });
 
 /**
 * Trampoline entity
 */
 game.TrampolineEntity = me.CollectableEntity.extend({
     // Base initialisation
     init: function (x, y, settings) {
         settings.image = "TRAMPOLINE";
         this._super(me.CollectableEntity, 'init', [x, y, settings]);
     },
     
     // Collision event
     onCollision: function (response, other) {
         if (detectMerio(other.name)) {
            other.body.falling = false;
            other.body.vel.y = -other.body.maxVel.y * me.timer.tick;
            other.body.jumping = true;
         }
         return false;
     }
 });
 