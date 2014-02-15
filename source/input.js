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

    pollGamepads: function() {
        var index = -1;
        var active = false;
        for (var i = 0; i < this.gamepads.length; i++) {
            var gamepad = this.gamepads[i];
            if (!gamepad || !gamepad.connected) continue;
            index++;
            active = true;
            var buttons = gamepad.buttons;
            var axes = gamepad.axes;
            var state = index === 0 ? this.state1 : (index === 1 ? this.state2 : undefined);
            if (!state) break;
            state[this.buttons.BUTTON_A] = (buttons[1].pressed || buttons[3].pressed) ? 0x41 : 0x40;
            state[this.buttons.BUTTON_B] = (buttons[0].pressed || buttons[2].pressed) ? 0x41 : 0x40;
            state[this.buttons.BUTTON_SELECT] = buttons[8].pressed ? 0x41 : 0x40;
            state[this.buttons.BUTTON_START] = buttons[9].pressed ? 0x41 : 0x40;
            state[this.buttons.BUTTON_UP] = buttons[12].pressed ? 0x41 : 0x40;
            state[this.buttons.BUTTON_DOWN] = buttons[13].pressed ? 0x41 : 0x40;
            state[this.buttons.BUTTON_LEFT] = buttons[14].pressed ? 0x41 : 0x40;
            state[this.buttons.BUTTON_RIGHT] = buttons[15].pressed ? 0x41 : 0x40;
        }
        this.activeGamepads = active;
    },

    gamepadConnected: function(gamepad) {
        this.gamepads[gamepad.index] = gamepad;
    },

    gamepadDisconnected: function(gamepad) {
        this.gamepads[gamepad.index] = undefined;
    }
};
