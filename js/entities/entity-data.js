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
    return 3.25;
}

// Gets the maximum vertical speed of Merio
function getPlayerMaxSpeedY() {
    return 11;
}

// Gets the default gravity of Merio
function getPlayerMaxGravityY() {
    return 0.48;
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
    return getMovingPlatformMaxSpeedX() * 1.5;
}

// Gets the maximum horizontal speed of a moving platform
function getMovingPlatformMaxSpeedX() {
    return 2;
}

// Gets the maximum horizontal speed of a moving platform
function getMovingPlatformMaxSpeedY() {
    return 2;
}

// Gets the maximum horizontal speed of moving enemies. Conventionally, they are usually slower than the player.
function getEnemyMaxSpeedX() {
    return 1;
}

// Gets the maximum vertical speed of moving enemies. Conventionally, they deliberately move slow to make then avoidable.
function getEnemyMaxSpeedY() {
    return 1;
}

// Gets the JSON object containing default font settings
function getDefaultFontSettings() {
    return {font: "verdana", size: 1};
}

// Used for inCollision callbacks for applying player-specific collision logic
function detectMerio(entityName) {
    return entityName === "mainPlayer";
}

// Used to play the background music for various levels without needing to change game states
function playBGM() {
    let currentLevel = me.levelDirector.getCurrentLevel().name;
    let currentBGM = me.audio.getCurrentTrack();
    let expectedBGM = currentBGM;

    // Play an overworld theme song
    switch (currentLevel) {
        case "level1": expectedBGM = "forest_theme"; break;
        case "level2": expectedBGM = "industrial_theme"; break;
        case "level3": expectedBGM = "space_theme"; break;
        case "_startmenu": me.audio.stopTrack(); break;
        case "gameover": me.audio.stopTrack(); break;
    }

    // Only play the music if isn't already playing, otherwises the music will reset to the beginning
    if (currentBGM != expectedBGM) {
        me.audio.stopTrack();
        me.audio.playTrack(expectedBGM);
    }
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
    if (me.state.isCurrent(me.state.FLASH_ANIMATION)) {
        me.state.change(me.state.PLAY);
    } else {
        me.state.change(me.state.FLASH_ANIMATION);
    }
}

// Checks to see if the current room is a level that is part of the actual game.
function isGameLevel() {
    return me.levelDirector.getCurrentLevel().name.startsWith("level");
}


// Uses existing properties in game.data to create a fresh game (properties found in game.js)
function resetScoreAndLives() {
    game.data.lives = game.data.initialLives;
    game.data.score = game.data.initialScore;
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
            break;
        }
    }
}

// Gets all possible messages + submessages that the Box guys can display. Mostly used in the BoxGuyEntity init callback.
function getAllMessages() {
    return [
        ["Hey ho, Merio! We're finally living in the future! Through an internet browser! Using those new-fangled \"HTML\" and \"JavaScript\" doodads that those technical folks keep whining about. And look! The game doesn't lag anymore when you move around! Anyway, you'd better get going to progress on your adventure - I'm starting to get motion sickness from all the physics optimisations in this game engine..."],
        ["Watch the enemy's movements carefully and use the power of the arrow keys to outsmart them!"],
        ["To complete your haphazard quest to find happiness, you'll need to jump through these jiggling portals.", "This particular portal smells like kerosene. Mmmm..."],
    ];
}
