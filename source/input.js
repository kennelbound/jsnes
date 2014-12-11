/*
JSNES, based on Jamie Sanders' vNES
Copyright (C) 2010 Ben Firshman

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// Input events are bound in the UI
JSNES.Input = function() {
    var i;

    this.XBox360ButtonConfig = {
        'A': 0,
        'B': 1,
        'X': 2,
        'Y': 3,
        'UP': 12,
        'DOWN': 13,
        'RIGHT': 15,
        'LEFT': 14,
        'SELECT': 8,
        'START': 9
    };

    this.buttonConfig = this.XBox360ButtonConfig;

    this.buttons = {
        BUTTON_A: 0,
        BUTTON_B: 1,
        BUTTON_SELECT: 2,
        BUTTON_START: 3,
        BUTTON_UP: 4,
        BUTTON_DOWN: 5,
        BUTTON_LEFT: 6,
        BUTTON_RIGHT: 7
    };
    this.gamepads = [];
    this.activeGamepads = false;

    this.state1 = new Array(8);
    for (i = 0; i < this.state1.length; i++) {
        this.state1[i] = 0x40;
    }
    this.state2 = new Array(8);
    for (i = 0; i < this.state2.length; i++) {
        this.state2[i] = 0x40;
    }

    this.pollGamepads();
};

JSNES.Input.prototype = {
    setKey: function(key, value) {
        if (this.activeGamepads) return false;
        switch (key) {
            case 88: this.state1[this.buttons.BUTTON_A] = value; break;      // X
            case 89: this.state1[this.buttons.BUTTON_B] = value; break;      // Y (Central European keyboard)
            case 90: this.state1[this.buttons.BUTTON_B] = value; break;      // Z
            case 17: this.state1[this.buttons.BUTTON_SELECT] = value; break; // Right Ctrl
            case 13: this.state1[this.buttons.BUTTON_START] = value; break;  // Enter
            case 38: this.state1[this.buttons.BUTTON_UP] = value; break;     // Up
            case 40: this.state1[this.buttons.BUTTON_DOWN] = value; break;   // Down
            case 37: this.state1[this.buttons.BUTTON_LEFT] = value; break;   // Left
            case 39: this.state1[this.buttons.BUTTON_RIGHT] = value; break;  // Right

            case 103: this.state2[this.buttons.BUTTON_A] = value; break;     // Num-7
            case 105: this.state2[this.buttons.BUTTON_B] = value; break;     // Num-9
            case 99: this.state2[this.buttons.BUTTON_SELECT] = value; break; // Num-3
            case 97: this.state2[this.buttons.BUTTON_START] = value; break;  // Num-1
            case 104: this.state2[this.buttons.BUTTON_UP] = value; break;    // Num-8
            case 98: this.state2[this.buttons.BUTTON_DOWN] = value; break;   // Num-2
            case 100: this.state2[this.buttons.BUTTON_LEFT] = value; break;  // Num-4
            case 102: this.state2[this.buttons.BUTTON_RIGHT] = value; break; // Num-6
            default: return true;
        }
        return false; // preventDefault
    },

    keyDown: function(evt) {
        if (!this.setKey(evt.keyCode, 0x41) && evt.preventDefault) {
            evt.preventDefault();
        }
    },

    keyUp: function(evt) {
        if (!this.setKey(evt.keyCode, 0x40) && evt.preventDefault) {
            evt.preventDefault();
        }
    },

    keyPress: function(evt) {
        evt.preventDefault();
    },

    setButton: function(button, value) {
        this.state1[button] = value ? 0x41 : 0x40;
    },

    getGamepads: function() { return (navigator.getGamepads && navigator.getGamepads()) || (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) },

    updateGamepads: function() {
        // Make sure none of the old gamepads have been unplugged
        var gamepad, i, gamepads = this.getGamepads();
        window.myGamepads = gamepads;
        for(i = 0; i < this.gamepads.length; i++) {
            gamepad = this.gamepads[i];
            var rawGamepad = gamepads[i];

            if(gamepad !== rawGamepad) {
                this.gamepadDisconnected(gamepad);
            }
        }

        for (i = 0; i < gamepads.length; i++) {
            gamepad = gamepads[i];
            if(!gamepad || !gamepad.connected || this.gamepads[i] === gamepads[i]) continue;
            this.gamepadConnected(gamepad);
        }
    },

    pollGamepads: function() {
        this.updateGamepads();

        var bc = this.buttonConfig;

        var index = -1;
        var active = false;
        for (var i = 0; i < this.gamepads.length; i++) {
            var gamepad = this.gamepads[i];
            if (!gamepad || !gamepad.connected) continue;
            index++;
            active = true;
            var buttons = gamepad.buttons;
            var state = index === 0 ? this.state1 : (index === 1 ? this.state2 : undefined);
            if (!state) break;
            state[this.buttons.BUTTON_A] = (buttons[bc.A].pressed || buttons[bc.X].pressed) ? 0x41 : 0x40;
            state[this.buttons.BUTTON_B] = (buttons[bc.B].pressed || buttons[bc.Y].pressed) ? 0x41 : 0x40;
            state[this.buttons.BUTTON_SELECT] = buttons[bc.SELECT].pressed ? 0x41 : 0x40;
            state[this.buttons.BUTTON_START] = buttons[bc.START].pressed ? 0x41 : 0x40;
            state[this.buttons.BUTTON_UP] = buttons[bc.UP].pressed ? 0x41 : 0x40;
            state[this.buttons.BUTTON_DOWN] = buttons[bc.DOWN].pressed ? 0x41 : 0x40;
            state[this.buttons.BUTTON_LEFT] = buttons[bc.LEFT].pressed ? 0x41 : 0x40;
            state[this.buttons.BUTTON_RIGHT] = buttons[bc.RIGHT].pressed ? 0x41 : 0x40;
        }
        this.activeGamepads = active;

        var self = this;
        window.requestAnimationFrame(function(){self.pollGamepads()});
    },

    gamepadConnected: function(gamepad) {
        console.log("Gamepad connected", gamepad);
        window.gp = this.gamepads[gamepad.index] = gamepad;
    },

    gamepadDisconnected: function(gamepad) {
        console.log("Gamepad disconnected", gamepad)
        this.gamepads[gamepad.index] = undefined;
    }
};
