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