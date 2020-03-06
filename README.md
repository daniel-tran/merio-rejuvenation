# MERIO Rejuvenation

The long-awaited sequel to [MERIO Reborn](https://github.com/daniel-tran/merio-reborn). Made from the ground-up using melonJS 7.1.1.

# How to run locally?

- Install Node.js *(if you want to do local packaging, please install v9.2.1. Otherwise the latest version should be OK)*
- `npm install`
- `npm install -g grunt-cli`

Once you've followed these steps, you can just execute `run.bat` to start the local version of the game which is hosted on http://localhost:8000.

# How to package locally?

**Requires Node.js v9.2.1.** as one of the boilerplate dependencies uses an old internal API that doesn't work anymore in later versions of Node.js.

Just run `standalone_export.bat` to create a local executable with its supporting libraries under the bin folder.

To package for use on a dedicated server, just run `grunt` and find the build outputs under the build folder.

# Why choose melonJS?
In the past, GameMaker 8.1 Lite Edition was the go-to game engine for MERIO games. Since [18 May 2015](https://www.yoyogames.com/blog/358/farewell-gamemaker-8-1), this engine is no longer supported by Yoyo Games, so this was a good opportunity to use a more modern game engine for the next MERIO sequel.

One of the major advantages of melonJS that stuck out to me was the native integration with Tiled, which decouples the game logic from the level designs and is reminiscent of the GameMaker 8.1 workflow, where you would define all your game objects and set up a "room" where you'd drag & drop instances to create your levels.

Of course, melonJS has its own problems such as the debug panel not working out-of-the-box in the boilerplate and the lack of in-built support for pop-up messages, but fortunately there are custom workarounds for a lot of these issues. Although there are some unintended side effects at times...

# Legal Info

"MERIO Rejuvenation" is built using the [melonJS boilerplate](https://github.com/melonjs/boilerplate), which is licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php)

Copyright (C) 2011 - 2017 Olivier Biot *(not sure if this is valid anymore, but is still preserved since it was included with the original melonJS boilerplate)*
