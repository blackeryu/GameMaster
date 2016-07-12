//-----------------------------------------------------------------------------
//  Galv's Message Styles
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  GALV_MessageStyles.js
//-----------------------------------------------------------------------------
//  2016-04-01 - Version 1.2 - added compatibility for Yanfly Message Core
//  2016-03-31 - Version 1.1 - fixed a bug when targeting event off screen
//                             above. Fixed minor other bugs.
//  2016-03-31 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_MessageStyles = true;

var Galv = Galv || {};                  // Galv's main object
Galv.Mstyle = Galv.Mstyle || {};        // Galv's stuff

//-----------------------------------------------------------------------------
/*:
 * @plugindesc Settings to change how your "Show Text" messages look as well as code to make them floating.
 * 
 * @author Galv - galvs-scripts.com
 *
 * @param Input Indicator
 * @desc pos,x,y - pos is a direction number (numpad). 1,2,3,4,6,7,8,9.
 * @default 2,0,-12
 *
 * @param Indicator Zoom
 * @desc The zoom % of the message indicator and message arrows.
 * default 100%
 * @default 100
 *
 * @param Message Padding
 * @desc Adds padding around the text in the message box... top,right,bottom,left
 * @default 0,0,0,0
 *
 * @param Message Windowskin
 * @desc Windowskin file from /img/system/ to use for all Show Text messages
 * Default: Window
 * @default Window
 *
 * @param Arrow Graphic
 * @desc Image from /img/system/ that is used to point at the target of a floating message box. Leave blank for none.
 * @default WindowArrow
 *
 * @param Windowskin Back Opacity
 * @desc The opacity of the window background.
 * 0 - 255
 * @default 192
 *
 * @param Y Offset
 * @desc How far away from the event/actor the message box will appear in pixels
 * @default 60
 *
 * @param Font
 * @desc Name of the font to use for just message box and choice box. Leave blank for default.
 * @default
 *
 * @param Font Outline
 * @desc true or false - if text has outlines on it or not.
 * @default true
 *
 * @param Font Size
 * @desc The size of the font in Show Text message boxes.
 * default 28
 * @default 28
 *
 * @help
 *   Galv's Message Styles
 * ----------------------------------------------------------------------------
 * The main purpose of this plugin is to allow your "Show Text" message boxes
 * to have a different style to other windows in the game. The plugin settings
 * have a variety of visual settings you can tweak, and in addition using a
 * text code in Show Text messages will allow you to turn that message into a
 * floating message.
 * ----------------------------------------------------------------------------
 *   CODE to use in SHOW TEXT message
 * ----------------------------------------------------------------------------
 * The following code MUST be put in the first line of a message to work.
 *
 *       \pop[x]
 *
 * x = event Id - to target an event on the map
 *     0 to target the event the Show Text command is used it
 *     -1,-2,-3,-4... negative numbers to target followers in those postions
 *     a1,a2,a3, etc... to target a specific actor IF they are a follower. If
 *                      not a follower, the message will not display
 *
 * EXAMPLES
 * \pop[23]  // targets event 23
 * \pop[-3]  // targets the 3rd follower in your follower lineup
 * \pop[a8]  // targets actor 8, only if the actor is a follower on the map
 */

//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------


(function() {

Galv.Mstyle.skin = PluginManager.parameters('Galv_MessageStyles')['Message Windowskin'];
Galv.Mstyle.font = PluginManager.parameters('Galv_MessageStyles')['Font'];
Galv.Mstyle.arrow = PluginManager.parameters('Galv_MessageStyles')['Arrow Graphic'];
Galv.Mstyle.opacity = Number(PluginManager.parameters('Galv_MessageStyles')['Windowskin Back Opacity']);
Galv.Mstyle.fontSize = Number(PluginManager.parameters('Galv_MessageStyles')['Font Size']);
Galv.Mstyle.yOffet = Number(PluginManager.parameters('Galv_MessageStyles')['Y Offset']);
Galv.Mstyle.iZoom = Number(PluginManager.parameters('Galv_MessageStyles')['Indicator Zoom']) * 0.01;


Galv.Mstyle.outline = PluginManager.parameters('Galv_MessageStyles')['Font Outline'].toLowerCase() == 'true' ? true : false;

Galv.Mstyle.indPos = PluginManager.parameters('Galv_MessageStyles')['Input Indicator'].split(",");
for (var i = 0; i < Galv.Mstyle.indPos.length; i++) {
	Galv.Mstyle.indPos[i] = Number(Galv.Mstyle.indPos[i]);
};

Galv.Mstyle.padding = PluginManager.parameters('Galv_MessageStyles')['Message Padding'].split(",");
for (var i = 0; i < Galv.Mstyle.padding.length; i++) {
	Galv.Mstyle.padding[i] = Number(Galv.Mstyle.padding[i]);
};

Galv.Mstyle.target = null;
Galv.Mstyle.thisEvent = null;

Galv.Mstyle.checkTarget = function(text) {
	var target = null;
    var tmp = text.replace(/\\/g, '\x1b');
    tmp = tmp.replace(/\x1b\x1b/g, '\\');
    tmp = tmp.replace(/\x1bpop\[([-a]*\d*)\]/gi, function() {
		target = arguments[1];
    }.bind(this));
	return target;
};

Galv.Mstyle.setTarget = function(target) {
	if (target[0] != "a") { // If Target is an ID (event or negatives for follower)
		target = Number(target);
		// event ID or player
		if (target >= -1) {
			switch (target) {
				case 0:
					return $gameMap.event(Galv.Mstyle.thisEvent);
					break;
				case -1:
					return $gamePlayer;
					break;
				default:
					return $gameMap.event(target);
					break;
			};
		} else {
			var f = Math.abs(target);
			
			if (f > $gameParty.battleMembers().length) {
				// if no follower exists - don't do it!
				return false;
			} else {
				return $gamePlayer._followers.follower(f - 2);
			};
		};
	} else if (target[0] == "a") { // Target an actor - check if in followers
		var actor = $gameActors.actor(Number(target.replace("a","")));
		actorIndex = actor.index();
		if (actorIndex < 0 || actorIndex > $gameParty.battleMembers().length) {
			return false;
		} else {
			return $gamePlayer._followers.follower(actorIndex - 1);
		};
	};
};


// INTERPRETER
//-----------------------------------------------------------------------------

Galv.Mstyle.Game_Interpreter_command101 = Game_Interpreter.prototype.command101;
Game_Interpreter.prototype.command101 = function() {
	var ispop = this._list[this._index + 1].parameters[0].match(/\\pop/i);
	if (ispop) {
		Galv.Mstyle.thisEvent = this._eventId;
		Galv.Mstyle.target = Galv.Mstyle.setTarget(Galv.Mstyle.checkTarget(this._list[this._index + 1].parameters[0]));
		if (Galv.Mstyle.target == false) {
			while (this.nextEventCode() === 401) {  // Text data
				this._index++;
			};
			return false;
		};
	} else {
		Galv.Mstyle.thisEvent = null;
		Galv.Mstyle.target = null;
	};
	Galv.Mstyle.Game_Interpreter_command101.call(this);
};



// ESCAPE CODE ADD
Galv.Mstyle.Window_Base_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
Window_Base.prototype.convertEscapeCharacters = function(text) {
	var text = Galv.Mstyle.Window_Base_convertEscapeCharacters.call(this,text);
		text = text.replace(/\x1bpop\[([-a]*\d*)\]/gi, function() {
        return "";
    }.bind(this));
	return text;
};



Window_Message.prototype.textWidthEx = function(text) {
    return this.drawTextEx(text, 0, this.contents.height);
};



// WINDOW MESSAGE
//-----------------------------------------------------------------------------

Galv.Mstyle.Window_Message_initialize = Window_Message.prototype.initialize;
Window_Message.prototype.initialize = function() {
	Galv.Mstyle.Window_Message_initialize.call(this);
	this.backOpacity = Galv.Mstyle.opacity;
};

Window_Message.prototype.createWindowTail = function() {
	this._tailSprite = new Sprite();
	this._tailSprite.bitmap = ImageManager.loadSystem(Galv.Mstyle.arrow);
	this._tailSprite.opacity = 0;
	this._tailSprite.anchor.x = 0.5;
	this.addChild(this._tailSprite);
};


Galv.Mstyle.Window_Message_resetFontSettings = Window_Message.prototype.resetFontSettings;
Window_Message.prototype.resetFontSettings = function() {
    Galv.Mstyle.Window_Message_resetFontSettings.call(this);
	if (Galv.Mstyle.font != "") this.contents.fontFace = Galv.Mstyle.font;
	this.contents.fontSize = Galv.Mstyle.fontSize;
};


Galv.Mstyle.Window_Message_startMessage = Window_Message.prototype.startMessage;
Window_Message.prototype.startMessage = function() {
	Galv.Mstyle.Window_Message_startMessage.call(this);
	this.changeWindowDimensions();
};

Galv.Mstyle.Window_Message_updatePlacement = Window_Message.prototype.updatePlacement;
Window_Message.prototype.updatePlacement = function() {

	if (!Galv.Mstyle.outline) this.contents._drawTextOutline = function() {};
	if (Galv.Mstyle.target) {
		this.pTarget = Galv.Mstyle.target;
		// if target is undefined - cancel this message.
		//this.changeWindowDimensions();
		this.updateFloatPlacement();
		this._goldWindow.y = this.y > 0 ? 0 : Graphics.boxHeight - this._goldWindow.height;
	} else {
		this.pTarget = null;
		this.changeWindowDimensions();
		Galv.Mstyle.Window_Message_updatePlacement.call(this);
	};
};

Galv.Mstyle.Window_Message_terminateMessage = Window_Message.prototype.terminateMessage;
Window_Message.prototype.terminateMessage = function() {
	Galv.Mstyle.Window_Message_terminateMessage.call(this);
	this.pTarget = null;
	Galv.Mstyle.target = null;
	Galv.Mstyle.thisEvent = null;
};

Galv.Mstyle.Window_Message_update = Window_Message.prototype.update;
Window_Message.prototype.update = function() {
	Galv.Mstyle.Window_Message_update.call(this);
	this.updateFloatPlacement();
};

Window_Message.prototype.updateFloatPlacement = function() {
	if (!this._tailSprite) this.createWindowTail();
	if (this.pTarget == null) {
		this._tailSprite.opacity = 0;
		return
	};
	
	if (this.openness < 255) this._tailSprite.opacity = 0;
	// Update the text box position
	var posX = this.pTarget.screenX() - this.width / 2;
	var posY = this.pTarget.screenY() + this.yOffset;
	
	
	if (posX + this.width > Graphics.boxWidth) {
		posX = Graphics.boxWidth - this.width;
	} else if (posX < 0) {
		posX = 0;
	};
	if (posY + this.height > Graphics.boxHeight) {
		posY = Graphics.boxHeight - this.height;
	} else if (posY < 0) {
		posY = Math.max(this.pTarget.screenY() + 15,0); // position box under when it hits top of screen
		this._tailSprite.y = 2;
		this._tailSprite.scale.y = -1;
	} else {
		this._tailSprite.scale.y = 1;
		this._tailSprite.y = this.height - 2;
	};
	
	this.x = posX;
	this.y = posY;
	
	this._tailSprite.x = this.pTarget.screenX() - this.x;
	if (this.openness > 200) {
		this._tailSprite.opacity += 50;
	};
	
	this.updateFloats(this.x,this.width,this.y,this.height);
};

Window_Message.prototype.updateFloats = function(x,w,y,h) {
	this._choiceWindow.updateChoiceFloat(x,w,y + h);
};

// Yanfly Core Compatibility
if (Imported.YEP_MessageCore) {
	Galv.Mstyle.Window_Message_updateFloats = Window_Message.prototype.updateFloats;
	Window_Message.prototype.updateFloats = function(x,w,y,h) {
		Galv.Mstyle.Window_Message_updateFloats.call(this,x,w,y,h);
		this._nameWindow.updateNameFloat();
	};

	Window_NameBox.prototype.updateNameFloat = function() {
		this.adjustPositionX();
		this.adjustPositionY();
	};
	
	Galv.Mstyle.Window_NameBox_initialize = Window_NameBox.prototype.initialize;
	Window_NameBox.prototype.initialize = function(parentWindow) {
		Galv.Mstyle.Window_NameBox_initialize.call(this,parentWindow);
		this.backOpacity = Galv.Mstyle.opacity;
	};
	

	Galv.Mstyle.Window_NameBox_resetFontSettings = Window_NameBox.prototype.resetFontSettings;
	Window_NameBox.prototype.resetFontSettings = function() {
		Galv.Mstyle.Window_NameBox_resetFontSettings.call(this);
		if (Galv.Mstyle.font != "") this.contents.fontFace = Yanfly.Param.MSGFontName;
		this.contents.fontSize = Galv.Mstyle.fontSize;
		if (!Galv.Mstyle.outline) this.contents._drawTextOutline = function() {};
	};
	
	
	if (Galv.Mstyle.skin != 'window') {
	// Overwrite
		Window_NameBox.prototype.loadWindowskin = function() {
			this.windowskin = ImageManager.loadSystem(Galv.Mstyle.skin);
		};
	};
	
};
	




Galv.Mstyle.Window_Message_newLineX = Window_Message.prototype.newLineX;
Window_Message.prototype.newLineX = function() {
	return Galv.Mstyle.Window_Message_newLineX.call(this) + Galv.Mstyle.padding[3];
};

Galv.Mstyle.Window_Message_newPage = Window_Message.prototype.newPage;
Window_Message.prototype.newPage = function(textState) {
	Galv.Mstyle.Window_Message_newPage.call(this,textState);
	textState.y += Galv.Mstyle.padding[0];
};


Window_Message.prototype.changeWindowDimensions = function() {
	if (this.pTarget != null) {
		// Calc max width and line height to get dimensions
		var w = 10;
		var xO = $gameMessage._faceName ? Window_Base._faceWidth + 15 : 0;
		xO += Galv.Mstyle.padding[1] + Galv.Mstyle.padding[3]; // Added padding
		
		for (var i = 0; i < $gameMessage._texts.length; i++) {
			var lineWidth = this.textWidthEx($gameMessage._texts[i]) + this.standardPadding() * 2;
			if (w < lineWidth) {
				w = lineWidth;
			};
		}
		var minlines = 1;
		if ($gameMessage._faceName) {
			w += 15;
			minlines = 4;
		};
		
		this.width = Math.min(Graphics.boxWidth,w + xO);
		
		this.height = this.fittingHeight(Math.max($gameMessage._texts.length,minlines));
		this.height += Galv.Mstyle.padding[0] + Galv.Mstyle.padding[2];
		this.yOffset = -Galv.Mstyle.yOffet - this.height;
		
		
	} else {
		this.yOffset = 0;
		this.width = this.windowWidth();
		this.height = this.windowHeight();
		this.x = (Graphics.boxWidth - this.width) / 2;
	}
};


if (Galv.Mstyle.skin != 'window') {
	// Overwrite
	Window_Message.prototype.loadWindowskin = function() {
		this.windowskin = ImageManager.loadSystem(Galv.Mstyle.skin);
	};
};

Galv.Mstyle.Window_Message__refreshPauseSign = Window_Message.prototype._refreshPauseSign;
Window_Message.prototype._refreshPauseSign = function() {
	Galv.Mstyle.Window_Message__refreshPauseSign.call(this);
	
	var x = 0;
	var y = 0;
	var oX = Galv.Mstyle.indPos[1];
	var oY = Galv.Mstyle.indPos[2];
	
	this._windowPauseSignSprite.anchor.y = 0.5;
	this._windowPauseSignSprite.anchor.x = 0.5;
	
	var pos = Galv.Mstyle.indPos[0];
	
	switch (pos) {
		case 1:
			x = oX;
			y = this._height + oY;
			break;
		case 2:
			x = this._width / 2 + oX;
			y = this._height + oY;
			break;
		case 3:
			x = this.width + oX;
			y = this._height + oY;
			break;
		case 4:
			x = oX;
			y = this.height / 2 + oY;
			break;
		case 6:
			x = this.width + oX;
			y = this.height / 2 + oY;
			break;
		case 7:
			x = oX;
			y = oY;
			break;
		case 8:
			x = this._width / 2 + oX;
			y = oY;
			break;
		case 9:
			x = this.width + oX;
			y = oY;
			break;
	}
	this._windowPauseSignSprite.move(x, y);
};

Galv.Mstyle.Window_Message__createAllParts = Window_Message.prototype._createAllParts;
Window_Message.prototype._createAllParts = function() {
	Galv.Mstyle.Window_Message__createAllParts.call(this);
	this._windowPauseSignSprite.scale.x = Galv.Mstyle.iZoom;
	this._windowPauseSignSprite.scale.y = Galv.Mstyle.iZoom;
	this._downArrowSprite.scale.x = Galv.Mstyle.iZoom;
	this._downArrowSprite.scale.y = Galv.Mstyle.iZoom;
	this._upArrowSprite.scale.x = Galv.Mstyle.iZoom;
	this._upArrowSprite.scale.y = Galv.Mstyle.iZoom;
};


// SCENE BOOT
//-----------------------------------------------------------------------------

Galv.Mstyle.Scene_Boot_loadSystemImages = Scene_Boot.prototype.loadSystemImages;
Scene_Boot.prototype.loadSystemImages = function() {
	Galv.Mstyle.Scene_Boot_loadSystemImages.call(this);
	ImageManager.loadSystem(Galv.Mstyle.skin);
	if (Galv.Mstyle.arrow != "") ImageManager.loadSystem(Galv.Mstyle.arrow);
};




// WINDOW CHOICE
//-----------------------------------------------------------------------------

Galv.Mstyle.Window_ChoiceList_initialize = Window_ChoiceList.prototype.initialize;
Window_ChoiceList.prototype.initialize = function(messageWindow) {
	Galv.Mstyle.Window_ChoiceList_initialize.call(this,messageWindow);
	this.backOpacity = Galv.Mstyle.opacity;
};


Galv.Mstyle.Window_ChoiceList_drawItem = Window_ChoiceList.prototype.drawItem;
Window_ChoiceList.prototype.drawItem = function(index) {
	if (!Galv.Mstyle.outline) this.contents._drawTextOutline = function() {};
    Galv.Mstyle.Window_ChoiceList_drawItem.call(this,index);
};

Galv.Mstyle.Window_ChoiceList_resetFontSettings = Window_ChoiceList.prototype.resetFontSettings;
Window_ChoiceList.prototype.resetFontSettings = function() {
    Galv.Mstyle.Window_ChoiceList_resetFontSettings.call(this);
	if (Galv.Mstyle.font != "") this.contents.fontFace = Galv.Mstyle.font;
	this.contents.fontSize = Galv.Mstyle.fontSize;
};

Window_ChoiceList.prototype.updateChoiceFloat = function(x,w,y) {
	var positionType = $gameMessage.choicePositionType();
	this.y = y;
    switch (positionType) {
    case 0:
        this.x = x;
        break;
    case 1:
        this.x = x + (w / 2) - this.width / 2;
        break;
    case 2:
        this.x = x + w - this.width;
        break;
    };
};

if (Galv.Mstyle.skin != 'window') {
	// Overwrite
	Window_ChoiceList.prototype.loadWindowskin = function() {
		this.windowskin = ImageManager.loadSystem(Galv.Mstyle.skin);
	};
};

})();