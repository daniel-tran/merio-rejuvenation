// Used for when we need to recalculate Merio's body collision box when going right.
// By not applying this function to the hair collision box, we effectively get a mechanism
// that allows Merio to hang onto ledges with better reliability than GamerMaker's collision masking.
function getRightScaledValue(val) {
    return val * 0.75;
}

// Used for when we need to recalculate Merio's body collision box when going left.
// By not applying this function to the hair collision box, we effectively get a mechanism
// that allows Merio to hang onto ledges with better reliability than GamerMaker's collision masking.
function getLeftScaledValue(val) {
    return val * 0.25;
}

// Used to determine how tall Merio's hair collision box should be, in pixels.
function getHairHeight() {
    return 20;
}

// Gets the maximum horizontal speed of Merio
function getPlayerMaxSpeedX() {
    return 4;
}

// Gets the maximum vertical speed of Merio
function getPlayerMaxSpeedY() {
    return 20;
}

// Gets the default gravity of Merio
function getPlayerMaxGravityY() {
    return 0.98;
}

// Gets the maximum vertical speed of Merio while in the gravity zone
function getPlayerSlowedSpeedY() {
    return getPlayerMaxSpeedY() / 4;
}

// Gets the lessened gravity of Merio while in the gravity zone
function getPlayerSlowedGravityY() {
    return getPlayerMaxGravityY() / 10;
}

// When on a moving platform, we want to be able to move around on it.
// Use this value to make Merio slightly faster so he can move with the motion of the platform,
// while also promoting a slight speed boost when running against it
function getPlayerExtendedMaxSpeedX() {
    return getMovingPlatformMaxSpeedX() * 1.34;
}

// Gets the maximum horizontal speed of a moving platform
function getMovingPlatformMaxSpeedX() {
    return 3;
}

// Gets the maximum horizontal speed of a moving platform
function getMovingPlatformMaxSpeedY() {
    return 2;
}

// Used for inCollision callbacks for applying player-specific collision logic
function detectMerio(entityName) {
    return entityName === "mainPlayer";
}

// Shows/Hides the message modal from index.html and sets its main body of text
function toggleMessage(message, isShown) {
    let textStatus = ["none", "block"];
    // Since true = 1 and false = 0, it can be multiplied with 1 to get an integer index
    document.getElementById("messageModal").style.display = textStatus[1 * isShown];
    document.getElementById("messageContents").innerText = message;
}

// Used to generalise pause/resume logic, often for message prompts
function toggleResume(isResuming, message) {
    // Disable/enable the system behaviour of resuming when focussing on the game again.
    me.sys.resumeOnFocus = isResuming;

    if (isResuming) {
        me.state.resume();
    } else {
        me.state.pause();
    }

    // Display a message upon pausing/resuming
    if (message) {
        toggleMessage(message, true);
    } else {
        // No message implies that the message prompt should be closed
        toggleMessage("", false);
    }
}

// To get the flash animation played, me.state needs to change to a new value.
// In game.js, two states are linked to the same GameScreen. So as long as the state
// is toggled between those two states, the transition effect will always play.
function MakeshiftFlashAnimation() {
    if (me.state.isCurrent(me.state.GAME_END)) {
        me.state.change(me.state.PLAY);
    } else {
        me.state.change(me.state.GAME_END);
    }
}

// Checks to see if the current room is a level that is part of the actual game.
function isGameLevel() {
    return me.levelDirector.getCurrentLevel().name.startsWith("level");
}

// An external interface to call BoxGuyEntity.nextMessage() from entities.js
function manualMessageUpdate() {
    // Note: me.game.world.getChildByName() is computationally expensive, so try not to do this all the time.
    let boxguys = me.game.world.getChildByName("BoxGuyEntity");

    // When no box guys are on the level, just treat the message as a one-message interaction
    if (boxguys.length === 0) {
        // Hide the message modal and resume user activity
        toggleResume(true, "");
    }

    for (let i = 0; i < boxguys.length; i++){
        // The one major issue with doing an external function call this way is that there's no good way of
        // determining which specific instance of an entity is being interacted with.
        // The naive implementation is to just assume that only one instance is being interacted at any one
        // time and finding this current instance is just a matter of looping over the entities with the same names.
        if (boxguys[i].messageSubIndex >= 0) {
            boxguys[i].nextMessage();
        }
    }
}