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