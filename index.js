var c = document.getElementById("gameCanvas");
var ctx = c.getContext("2d");

var keys = [];

document.addEventListener("keydown", function (event) {
    keys[event.key] = true;
    if ([" ", "Enter", "Tab", "Control"].indexOf(event.key) > -1) {
        event.preventDefault();
    }
});

document.addEventListener("keyup", function (event) {
    keys[event.key] = false;
});

var mouseX;
var mouseY;

window.addEventListener("mousemove", function(event) {
    mouseX = (event.clientX - c.getBoundingClientRect().left) * scale;
    mouseY = (event.clientY - c.getBoundingClientRect().top) * scale;
});

var mouseDown, mouseButton;

window.addEventListener("mousedown", function(event) {
    mouseDown = true;
    mouseButton = event.buttons;
    if (gameScreen == SCREENTYPE.SETTINGS) {
        if (mouseX > 200 * scale && mouseX < 360 * scale && mouseY > 160 * scale && mouseY < 190 * scale) {
            playerCount++;
            if (playerCount > 4) { playerCount = 1; }
        }
        if (mouseX > 350 * scale && mouseX < 470 * scale && mouseY > 160 * scale && mouseY < 190 * scale) {
            checkWinSize++;
            if (checkWinSize > 9) { checkWinSize = 2; }
        }
    }
});

window.addEventListener("mouseup", function(event) {
    mouseDown = false;
});

ctx.imageSmoothingEnabled = false;

const displayWidth = 1360;
const displayHeight = 360;
const scale = 4;
c.style.width = displayWidth + 'px';
c.style.height = displayHeight + 'px';
c.width = displayWidth * scale;
c.height = displayHeight * scale;

const SCREENTYPE = {
    NULL_TO_TITLE: 0.1,
    TITLE: 1,
    TITLE_TO_SETTINGS: 1.2,
    TITLE_TO_GAME: 1.3,
    SETTINGS: 2,
    SETTINGS_TO_TITLE: 2.1,
    GAME: 3,
    GAME_TO_TITLE: 3.1,
}

var gameScreen = SCREENTYPE.NULL_TO_TITLE;

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

var elementBlockSize = 40;

const PLAYERTYPE = {
    NOUGHT: 0,
    CROSS: 1,
    SQUARE: 2,
    TRIANGLE: 3
}

var playerCount = 2;
var turn = PLAYERTYPE.NOUGHT;
var hasWon = -1;
var checkWinSize = 4;
var winningElements = [];
var lineLength = 0;

var winTimer = 0;
var winDelay = 400;
var removeOthers = false;

class ElementBlock {
    constructor(pos, symbol, name, col, number) {
        this.pos = pos;
        this.symbol = symbol;
        this.name = name;
        this.col = col;
        this.number = number;

        this.opacity = 1;
        this.targetOpacity = 1;
        this.selected = -1;
    }

    render() {
        ctx.globalAlpha = this.opacity;

        if (this.selected != -1) {
            this.targetOpacity = 0.5;
        } else {
            if (mouseX > (this.pos.x + 1) * elementBlockSize * scale && mouseX <= (this.pos.x + 2) * elementBlockSize * scale && mouseY > (this.pos.y + 1) * elementBlockSize * scale && mouseY <= (this.pos.y + 2) * elementBlockSize * scale) {
                if (mouseDown && hasWon == -1) {
                    this.selected = turn;
                    turn++; turn %= playerCount;
                    hasWon = checkWin(checkWinSize);
                }
                this.targetOpacity = 0.5;

                // name
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.fillStyle = "#ffffffff";
                ctx.font = String(40 * scale) + "px Arial";
                ctx.fillText(this.name + " (" + this.symbol + ")", 200 * scale, 120 * scale);
                ctx.fillText(this.number, 200 * scale, 160 * scale);
                ctx.globalAlpha = this.opacity;

            } else {
                this.targetOpacity = 1;
            }
        }
        this.opacity += ((this.targetOpacity - this.opacity) / 5) * deltaTime;

        ctx.beginPath();
        ctx.fillStyle = this.col;
        ctx.fillRect((this.pos.x + 1) * elementBlockSize * scale, (this.pos.y + 1) * elementBlockSize * scale, elementBlockSize * scale, elementBlockSize * scale);

        ctx.beginPath();
        ctx.fillStyle = "#ffffffff";
        ctx.font = String(20 * scale) + "px Arial";
        ctx.fillText(this.symbol, ((this.pos.x + 1 + 0.49) * elementBlockSize - (0.11 * ctx.measureText(this.symbol).width)) * scale, (this.pos.y + 1 + 0.67) * elementBlockSize * scale)

        ctx.globalAlpha = 1;

        // marking
        switch(this.selected) {
            case PLAYERTYPE.NOUGHT: {
                ctx.beginPath();
                ctx.strokeStyle = "#ffffffff";
                ctx.arc((this.pos.x + 1.5) * elementBlockSize * scale, (this.pos.y + 1.5) * elementBlockSize * scale, 0.45 * elementBlockSize * scale, 0, 2*Math.PI);
                ctx.lineWidth = 3 * scale;
                ctx.stroke();
                break;
            }
            case PLAYERTYPE.CROSS: {
                ctx.beginPath();
                ctx.strokeStyle = "#ffffffff";
                ctx.moveTo((this.pos.x + 1.1) * elementBlockSize * scale, (this.pos.y + 1.1) * elementBlockSize * scale);
                ctx.lineTo((this.pos.x + 1.9) * elementBlockSize * scale, (this.pos.y + 1.9) * elementBlockSize * scale);
                ctx.moveTo((this.pos.x + 1.1) * elementBlockSize * scale, (this.pos.y + 1.9) * elementBlockSize * scale);
                ctx.lineTo((this.pos.x + 1.9) * elementBlockSize * scale, (this.pos.y + 1.1) * elementBlockSize * scale);
                ctx.lineWidth = 3 * scale;
                ctx.stroke();
                break;
            }
            case PLAYERTYPE.SQUARE: {
                ctx.beginPath();
                ctx.strokeStyle = "#ffffffff";
                ctx.moveTo((this.pos.x + 1.1) * elementBlockSize * scale, (this.pos.y + 1.1) * elementBlockSize * scale);
                ctx.lineTo((this.pos.x + 1.9) * elementBlockSize * scale, (this.pos.y + 1.1) * elementBlockSize * scale);
                ctx.lineTo((this.pos.x + 1.9) * elementBlockSize * scale, (this.pos.y + 1.9) * elementBlockSize * scale);
                ctx.lineTo((this.pos.x + 1.1) * elementBlockSize * scale, (this.pos.y + 1.9) * elementBlockSize * scale);
                ctx.lineTo((this.pos.x + 1.1) * elementBlockSize * scale, (this.pos.y + 1.1) * elementBlockSize * scale);
                // close
                ctx.lineTo((this.pos.x + 1.9) * elementBlockSize * scale, (this.pos.y + 1.1) * elementBlockSize * scale);
                ctx.lineWidth = 3 * scale;
                ctx.stroke();
                break;
            }
            case PLAYERTYPE.TRIANGLE: {
                ctx.beginPath();
                ctx.strokeStyle = "#ffffffff";
                ctx.moveTo((this.pos.x + 1.1) * elementBlockSize * scale, (this.pos.y + 1.9) * elementBlockSize * scale);
                ctx.lineTo((this.pos.x + 1.9) * elementBlockSize * scale, (this.pos.y + 1.9) * elementBlockSize * scale);
                ctx.lineTo((this.pos.x + 1.5) * elementBlockSize * scale, (this.pos.y + 1.1) * elementBlockSize * scale);
                ctx.lineTo((this.pos.x + 1.1) * elementBlockSize * scale, (this.pos.y + 1.9) * elementBlockSize * scale);
                // close
                ctx.lineTo((this.pos.x + 1.9) * elementBlockSize * scale, (this.pos.y + 1.9) * elementBlockSize * scale);
                ctx.lineWidth = 3 * scale;
                ctx.stroke();
                break;
            }
        }
    }
}

var ptableList = [];
var ptableMatrix = [];

function initPTableMatrix() {
    ptableMatrix = [];
    ptableMatrix.push([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]);
    ptableMatrix.push([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]);
    ptableMatrix.push([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]);
    ptableMatrix.push([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]);
    ptableMatrix.push([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]);
    ptableMatrix.push([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]);
    ptableMatrix.push([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]);
}

function checkWin(size) {
    for (var i = 0; i < ptableMatrix.length; i++) {
        for (var j = 0; j < ptableMatrix[i].length; j++) {
            // horizontal
            if (ptableMatrix[i][j] != null) {
                var check = true;
                var runningType = ptableMatrix[i][j].selected;
                winningElements = [];
                for (var k = 0; k < size; k++) {
                    if (j + k < ptableMatrix[i].length) {
                        winningElements.push(ptableMatrix[i][j + k]);
                        if (ptableMatrix[i][j + k] == null) {
                            check = false;
                        } else {
                            if (ptableMatrix[i][j + k].selected == -1) {
                                check = false;
                            }
                            if (ptableMatrix[i][j + k].selected != runningType) {
                                check = false;
                            }
                        }
                    } else {
                        check = false;
                    }
                }
                if (check) {
                    lineLength = 0;
                    return runningType;
                }
                // vertical
                check = true;
                runningType = ptableMatrix[i][j].selected;
                winningElements = [];
                for (var k = 0; k < size; k++) {
                    if (i + k < ptableMatrix.length) {
                        winningElements.push(ptableMatrix[i + k][j]);
                        if (ptableMatrix[i + k][j] == null) {
                            check = false;
                        } else {
                            if (ptableMatrix[i + k][j].selected == -1) {
                                check = false;
                            }
                            if (ptableMatrix[i + k][j].selected != runningType) {
                                check = false;
                            }
                        }
                    } else {
                        check = false;
                    }
                }
                if (check) {
                    lineLength = 0;
                    return runningType;
                }
                // diagonal 1
                check = true;
                runningType = ptableMatrix[i][j].selected;
                winningElements = [];
                for (var k = 0; k < size; k++) {
                    if (i + k < ptableMatrix.length && j + k < ptableMatrix[i].length) {
                        winningElements.push(ptableMatrix[i + k][j + k]);
                        if (ptableMatrix[i + k][j + k] == null) {
                            check = false;
                        } else {
                            if (ptableMatrix[i + k][j + k].selected == -1) {
                                check = false;
                            }
                            if (ptableMatrix[i + k][j + k].selected != runningType) {
                                check = false;
                            }
                        }
                    } else {
                        check = false;
                    }
                }
                if (check) {
                    lineLength = 0;
                    return runningType;
                }
                // diagonal 2
                check = true;
                runningType = ptableMatrix[i][j].selected;
                winningElements = [];
                for (var k = 0; k < size; k++) {
                    if (i + k < ptableMatrix.length && j - k >= 0) {
                        winningElements.push(ptableMatrix[i + k][j - k]);
                        if (ptableMatrix[i + k][j - k] == null) {
                            check = false;
                        } else {
                            if (ptableMatrix[i + k][j - k].selected == -1) {
                                check = false;
                            }
                            if (ptableMatrix[i + k][j - k].selected != runningType) {
                                check = false;
                            }
                        }
                    } else {
                        check = false;
                    }
                }
                if (check) {
                    lineLength = 0;
                    return runningType;
                }
            }
        }
    }
    winningElements = [];
    return -1;
}

function addElement(x, y, symbol, name, col, number) {
    ptableList.push(new ElementBlock(new Vector2(x, y), symbol, name, col, number));
    ptableMatrix[y][x] = ptableList[ptableList.length - 1];
}

function createPTable() {
    ptableList = [];
    initPTableMatrix();

    addElement(0, 0, "H", "Hydrogen", "#0080f0ff", 1);

    addElement(0, 1, "Li", "Lithium", "#ff3434ff", 3);
    addElement(0, 2, "Na", "Sodium", "#ff3434ff", 11);
    addElement(0, 3, "K", "Potassium", "#ff3434ff", 19);
    addElement(0, 4, "Rb", "Rubidium", "#ff3434ff", 37);
    addElement(0, 5, "Cs", "Cesium", "#ff3434ff", 55);
    addElement(0, 6, "Fr", "Francium", "#ff3434ff", 87);
    
    addElement(1, 1, "Be", "Beryllium", "#ff8034ff", 4);
    addElement(1, 2, "Mg", "Magnesium", "#ff8034ff", 12);
    addElement(1, 3, "Ca", "Calcium", "#ff8034ff", 20);
    addElement(1, 4, "Sr", "Strontium", "#ff8034ff", 38);
    addElement(1, 5, "Ba", "Barium", "#ff8034ff", 56);
    addElement(1, 6, "Ra", "Radium", "#ff8034ff", 88);
    
    addElement(2, 5, "La", "Lanthanum", "#ff3480ff", 57);
    addElement(3, 5, "Ce", "Cerium", "#ff3480ff", 58);
    addElement(4, 5, "Pr", "Praseodymium", "#ff3480ff", 59);
    addElement(5, 5, "Nd", "Neodymium", "#ff3480ff", 60);
    addElement(6, 5, "Pm", "Promethium", "#ff3480ff", 61);
    addElement(7, 5, "Sm", "Samarium", "#ff3480ff", 62);
    addElement(8, 5, "Eu", "Europium", "#ff3480ff", 63);
    addElement(9, 5, "Gd", "Gadolinium", "#ff3480ff", 64);
    addElement(10, 5, "Tb", "Terbium", "#ff3480ff", 65);
    addElement(11, 5, "Dy", "Dysprosium", "#ff3480ff", 66);
    addElement(12, 5, "Ho", "Holmium", "#ff3480ff", 67);
    addElement(13, 5, "Er", "Erbium", "#ff3480ff", 68);
    addElement(14, 5, "Tm", "Thulium", "#ff3480ff", 69);
    addElement(15, 5, "Yb", "Ytterbium", "#ff3480ff", 70);
    addElement(16, 5, "Lu", "Lutetium", "#ff3480ff", 71);
    
    addElement(2, 6, "Ac", "Actinium", "#c01160ff", 89);
    addElement(3, 6, "Th", "Thorium", "#c01160ff", 90);
    addElement(4, 6, "Pa", "Proactinium", "#c01160ff", 91);
    addElement(5, 6, "U", "Uranium", "#c01160ff", 92);
    addElement(6, 6, "Np", "Neptunium", "#c01160ff", 93);
    addElement(7, 6, "Pu", "Plutonium", "#c01160ff", 94);
    addElement(8, 6, "Am", "Americium", "#c01160ff", 95);
    addElement(9, 6, "Cm", "Curium", "#c01160ff", 96);
    addElement(10, 6, "Bk", "Berkelium", "#c01160ff", 97);
    addElement(11, 6, "Cf", "Californium", "#c01160ff", 98);
    addElement(12, 6, "Es", "Einsteinium", "#c01160ff", 99);
    addElement(13, 6, "Fm", "Fermium", "#c01160ff", 100);
    addElement(14, 6, "Md", "Mendelevium", "#c01160ff", 101);
    addElement(15, 6, "No", "Nobelium", "#c01160ff", 102);
    addElement(16, 6, "Lr", "Lawrencium", "#c01160ff", 103);
    
    addElement(16, 3, "Sc", "Scandium", "#d0d000ff", 21);
    addElement(16, 4, "Y", "Yttrium", "#d0d000ff", 39);
    addElement(17, 3, "Ti", "Titanium", "#d0d000ff", 22);
    addElement(17, 4, "Zr", "Zirconium", "#d0d000ff", 40);
    addElement(17, 5, "Hf", "Hafnium", "#d0d000ff", 72);
    addElement(17, 6, "Rf", "Rutherfordium", "#d0d000ff", 104);
    addElement(18, 3, "V", "Vanadium", "#d0d000ff", 23);
    addElement(18, 4, "Nb", "Niobium", "#d0d000ff", 41);
    addElement(18, 5, "Ta", "Tantalum", "#d0d000ff", 73);
    addElement(18, 6, "Db", "Dubnium", "#d0d000ff", 105);
    addElement(19, 3, "Cr", "Chromium", "#d0d000ff", 24);
    addElement(19, 4, "Mo", "Molybdenum", "#d0d000ff", 42);
    addElement(19, 5, "W", "Tungsten", "#d0d000ff", 74);
    addElement(19, 6, "Sg", "Seaborgium", "#d0d000ff", 106);
    addElement(20, 3, "Mn", "Manganese", "#d0d000ff", 25);
    addElement(20, 4, "Tc", "Technetium", "#d0d000ff", 43);
    addElement(20, 5, "Re", "Rhenium", "#d0d000ff", 75);
    addElement(20, 6, "Bh", "Bohrium", "#d0d000ff", 107);
    addElement(21, 3, "Fe", "Iron", "#d0d000ff", 26);
    addElement(21, 4, "Ru", "Ruthenium", "#d0d000ff", 44);
    addElement(21, 5, "Os", "Osmium", "#d0d000ff", 76);
    addElement(21, 6, "Hs", "Hassium", "#d0d000ff", 108);
    addElement(22, 3, "Co", "Cobalt", "#d0d000ff", 27);
    addElement(22, 4, "Rh", "Rhodium", "#d0d000ff", 45);
    addElement(22, 5, "Ir", "Iridium", "#d0d000ff", 77);
    addElement(22, 6, "Mt", "Meitnerium", "#808080ff", 109);
    addElement(23, 3, "Ni", "Nickel", "#d0d000ff", 28);
    addElement(23, 4, "Pd", "Palladium", "#d0d000ff", 46);
    addElement(23, 5, "Pt", "Platinum", "#d0d000ff", 78);
    addElement(23, 6, "Ds", "Darmstadtium", "#808080ff", 110);
    addElement(24, 3, "Cu", "Copper", "#d0d000ff", 29);
    addElement(24, 4, "Ag", "Silver", "#d0d000ff", 47);
    addElement(24, 5, "Au", "Gold", "#d0d000ff", 79);
    addElement(24, 6, "Rg", "Roentgenium", "#808080ff", 111);
    addElement(25, 3, "Zn", "Zinc", "#d0d000ff", 30);
    addElement(25, 4, "Cd", "Cadmium", "#d0d000ff", 48);
    addElement(25, 5, "Hg", "Mercury", "#d0d000ff", 80);
    addElement(25, 6, "Cn", "Copernicium", "#808080ff", 112);
    
    addElement(26, 2, "Al", "Aluminum", "#50d000ff", 13);
    addElement(26, 3, "Ga", "Gallium", "#50d000ff", 31);
    addElement(26, 4, "In", "Indium", "#50d000ff", 49);
    addElement(26, 5, "Tl", "Thallium", "#50d000ff", 81);
    addElement(26, 6, "Nh", "Nihonium", "#808080ff", 113);
    addElement(27, 4, "Sn", "Tin", "#50d000ff", 50);
    addElement(27, 5, "Pb", "Lead", "#50d000ff", 82);
    addElement(27, 6, "Fl", "Flerovium", "#808080ff", 114);
    addElement(28, 5, "Bi", "Bismuth", "#50d000ff", 83);
    addElement(28, 6, "Mc", "Moscovium", "#808080ff", 115);
    addElement(29, 5, "Po", "Polonium", "#50d000ff", 84);
    addElement(29, 6, "Lv", "Livermorium", "#808080ff", 116);
    
    addElement(26, 1, "B", "Boron", "#007000ff", 5);
    addElement(27, 2, "Si", "Silicon", "#007000ff", 14);
    addElement(27, 3, "Ge", "Germanium", "#007000ff", 32);
    addElement(28, 3, "As", "Arsenic", "#007000ff", 33);
    addElement(28, 4, "Sb", "Antimony", "#007000ff", 51);
    addElement(29, 4, "Te", "Tellurium", "#007000ff", 52);
    
    addElement(27, 1, "C", "Carbon", "#0080f0ff", 6);
    addElement(28, 1, "N", "Nitrogen", "#0080f0ff", 7);
    addElement(28, 2, "P", "Phosphorus", "#0080f0ff", 15);
    addElement(29, 1, "O", "Oxygen", "#0080f0ff", 8);
    addElement(29, 2, "S", "Sulfur", "#0080f0ff", 16);
    addElement(29, 3, "Se", "Selenium", "#0080f0ff", 34);
    
    addElement(30, 1, "F", "Fluorine", "#003080ff", 9);
    addElement(30, 2, "Cl", "Chlorine", "#003080ff", 17);
    addElement(30, 3, "Br", "Bromine", "#003080ff", 35);
    addElement(30, 4, "I", "Iodine", "#003080ff", 53);
    addElement(30, 5, "At", "Astatine", "#003080ff", 85);
    addElement(30, 6, "Ts", "Tennessine", "#808080ff", 117);
    
    addElement(31, 0, "He", "Helium", "#6020abff", 2);
    addElement(31, 1, "Ne", "Neon", "#6020abff", 10);
    addElement(31, 2, "Ar", "Argon", "#6020abff", 18);
    addElement(31, 3, "Kr", "Krypton", "#6020abff", 36);
    addElement(31, 4, "Xe", "Xenon", "#6020abff", 54);
    addElement(31, 5, "Rn", "Radon", "#6020abff", 86);
    addElement(31, 6, "Og", "Oganesson", "#808080ff", 118);
}

function renderBackground() {
    ctx.beginPath();
    ctx.fillStyle = "#071a31ff";
    ctx.fillRect(0, 0, displayWidth * scale, displayHeight * scale);
}

function renderPTable() {
    for (var i = 0; i < ptableList.length; i++) {
        if (ptableList[i] != null) {
            ptableList[i].render();
        }
    }
}

function renderWinLines() {
    if (winningElements.length > 0 && winTimer <= winDelay) {
        winTimer += deltaTime;
        lineLength += ((1 - lineLength) / 15) * deltaTime;
        ctx.beginPath();
        ctx.strokeStyle = "#ff0000ff";
        ctx.moveTo((winningElements[0].pos.x + 1.5) * elementBlockSize * scale, (winningElements[0].pos.y + 1.5) * elementBlockSize * scale);
        ctx.lineTo(((winningElements[0].pos.x + 1.5) + ((winningElements[winningElements.length - 1].pos.x + 1.5) - (winningElements[0].pos.x + 1.5)) * lineLength) * elementBlockSize * scale, ((winningElements[0].pos.y + 1.5) + ((winningElements[winningElements.length - 1].pos.y + 1.5) - (winningElements[0].pos.y + 1.5)) * lineLength) * elementBlockSize * scale);
        ctx.lineWidth = 5 * scale;
        ctx.stroke();
    }

    if (winTimer > winDelay) {
        if (!removeOthers) {
            removeOthers = true;
            for (var i = 0; i < ptableList.length; i++) {
                if (winningElements.includes(ptableList[i])) {
                    ptableList[i].selected = -1;
                    lineLength = 0;
                    winningElements.sort((a, b) => a.number - b.number);
                } else {
                    if (ptableList[i] != null) {
                        ptableMatrix[ptableList[i].pos.y][ptableList[i].pos.x] = null;
                        ptableList[i] = null;
                    }
                }
            }
        }

        for (var i = 0; i < checkWinSize; i++) {
            winningElements[i].pos.x += (((15.5 + 3*(i - ((checkWinSize - 1) / 2))) - winningElements[i].pos.x) / 25) * deltaTime;
            winningElements[i].pos.y += ((5 - winningElements[i].pos.y) / 25) * deltaTime;
            renderWinTurn();
        }

        renderRestartButton();
    }
}

function renderWinTurn() {
    ctx.fillStyle = "#ffffffff";
    ctx.font = String(80 * scale) + "px Arial";
    switch (hasWon) {
        case PLAYERTYPE.CROSS: {
            ctx.fillText("X", 650 * scale, 150 * scale);
            break;
        }
        case PLAYERTYPE.NOUGHT: {
            ctx.fillText("O", 650 * scale, 150 * scale);
            break;
        }
        case PLAYERTYPE.SQUARE: {
            ctx.fillText("\u{25A1}", 650 * scale, 150 * scale);
            break;
        }
        case PLAYERTYPE.TRIANGLE: {
            ctx.fillText("\u{25B3}", 650 * scale, 150 * scale);
            break;
        }
    }
}

function renderRestartButton() {
    ctx.beginPath();
    ctx.fillStyle = "#5e82b1ff";
    ctx.fillRect(0, 0, 70 * scale, 30 * scale);
    ctx.fillStyle = "#ffffffff";
    ctx.font = String(20 * scale) + "px Arial";
    ctx.fillText("Redo", 10 * scale, 20 * scale);
    if (mouseX > 0 && mouseX < 70 * scale && mouseY > 0 && mouseY < 30 * scale) {
        if (mouseDown) {
            ptableList = [];
            ptableMatrix = [];
            init();
            hasWon = -1;
            winningElements = [];
            lineLength = 0;
            turn = PLAYERTYPE.NOUGHT;
            winTimer = 0;
            removeOthers = false;
        }
    }
}

function renderTitle() {
    ctx.beginPath();
    ctx.fillStyle = "#ffffffff";
    ctx.font = String(40 * scale) + "px Arial";
    ctx.fillText("Periodic Tac Toe", 200 * scale, 120 * scale);
}

var playButtonX = 200;
function renderPlayButton() {
    ctx.beginPath();
    ctx.fillStyle = "#5e82b1ff";
    ctx.roundRect(playButtonX * scale, 160 * scale, 70 * scale, 30 * scale, 5 * scale);
    ctx.fill();
    ctx.fillStyle = "#ffffffff";
    ctx.font = String(20 * scale) + "px Arial";
    ctx.fillText("PLAY", (playButtonX + 10) * scale, 182 * scale);
    if (mouseX > 200 * scale && mouseX < 290 * scale && mouseY > 160 * scale && mouseY < 190 * scale) {
        playButtonX += ((220 - playButtonX) / 15) * deltaTime;
        if (mouseDown) {
            gameScreen = SCREENTYPE.TITLE_TO_GAME;
        }
    } else {
        playButtonX += ((200 - playButtonX) / 15) * deltaTime;
    }
}

var settingsButtonX = 200;
function renderSettingsButton() {
    ctx.beginPath();
    ctx.fillStyle = "#5e82b1ff";
    ctx.roundRect(settingsButtonX * scale, 200 * scale, 120 * scale, 30 * scale, 5 * scale);
    ctx.fill();
    ctx.fillStyle = "#ffffffff";
    ctx.font = String(20 * scale) + "px Arial";
    ctx.fillText("SETTINGS", (settingsButtonX + 10) * scale, 222 * scale);
    if (mouseX > 200 * scale && mouseX < 340 * scale && mouseY > 200 * scale && mouseY < 230 * scale) {
        settingsButtonX += ((220 - settingsButtonX) / 15) * deltaTime;
        if (mouseDown) {
            gameScreen = SCREENTYPE.TITLE_TO_SETTINGS;
        }
    } else {
        settingsButtonX += ((200 - settingsButtonX) / 15) * deltaTime;
    }
}

function renderSettings() {
    // title
    ctx.beginPath();
    ctx.fillStyle = "#ffffffff";
    ctx.font = String(40 * scale) + "px Arial";
    ctx.fillText("Settings", 200 * scale, 120 * scale);

    // playercount
    ctx.beginPath();
    if (mouseX > 200 * scale && mouseX < 310 * scale && mouseY > 160 * scale && mouseY < 190 * scale) {
        ctx.fillStyle = "#314d72ff";
    } else {
        ctx.fillStyle = "#5e82b1ff";
    }
    ctx.roundRect(200 * scale, 160 * scale, 110 * scale, 30 * scale, 5 * scale);
    ctx.fill();
    ctx.fillStyle = "#ffffffff";
    ctx.font = String(20 * scale) + "px Arial";
    ctx.fillText("Players: " + playerCount, 210 * scale, 182 * scale);

    // checkWinSize
    ctx.beginPath();
    if (mouseX > 350 * scale && mouseX < 470 * scale && mouseY > 160 * scale && mouseY < 190 * scale) {
        ctx.fillStyle = "#314d72ff";
    } else {
        ctx.fillStyle = "#5e82b1ff";
    }
    ctx.roundRect(350 * scale, 160 * scale, 120 * scale, 30 * scale, 5 * scale);
    ctx.fill();
    ctx.fillStyle = "#ffffffff";
    ctx.font = String(20 * scale) + "px Arial";
    ctx.fillText("Win Size: " + checkWinSize, 360 * scale, 182 * scale);

    // back
    ctx.beginPath();
    ctx.fillStyle = "#5e82b1ff";
    ctx.fillRect(0, 0, 70 * scale, 30 * scale);
    ctx.fillStyle = "#ffffffff";
    ctx.font = String(20 * scale) + "px Arial";
    ctx.fillText("Back", 10 * scale, 20 * scale);
    if (mouseX > 0 * scale && mouseX < 70 * scale && mouseY > 0 * scale && mouseY < 30 * scale) {
        if (mouseDown) {
            gameScreen = SCREENTYPE.SETTINGS_TO_TITLE;
        }
    }
}

function renderBack() {
    ctx.beginPath();
    ctx.fillStyle = "#5e82b1ff";
    ctx.fillRect(0, 330 * scale, 70 * scale, 30 * scale);
    ctx.fillStyle = "#ffffffff";
    ctx.font = String(20 * scale) + "px Arial";
    ctx.fillText("Back", 10 * scale, 350 * scale);
    if (mouseX > 0 && mouseX < 70 * scale && mouseY > 330 && mouseY < 360 * scale) {
        if (mouseDown) {
            gameScreen = SCREENTYPE.GAME_TO_TITLE;
        }
    }
}

function main() {
    switch (gameScreen) {
        case SCREENTYPE.NULL_TO_TITLE: {
            playButtonX = 200;
            gameScreen = SCREENTYPE.TITLE;
            break;
        }
        case SCREENTYPE.TITLE: {
            renderBackground();
            renderTitle();
            renderPlayButton();
            renderSettingsButton();
            break;
        }
        case SCREENTYPE.TITLE_TO_SETTINGS: {
            gameScreen = SCREENTYPE.SETTINGS;
            break;
        }
        case SCREENTYPE.SETTINGS: {
            renderBackground();
            renderSettings();
            break;
        }
        case SCREENTYPE.SETTINGS_TO_TITLE: {
            playButtonX = 200;
            settingsButtonX = 200;
            gameScreen = SCREENTYPE.TITLE;
            break;
        }
        case SCREENTYPE.TITLE_TO_GAME: {
            init();
            winningElements = [];
            winTimer = 0;
            hasWon = -1;
            lineLength = 0;
            turn = PLAYERTYPE.NOUGHT;
            removeOthers = false;
            gameScreen = SCREENTYPE.GAME;
            break;
        }
        case SCREENTYPE.GAME: {
            renderBackground();
            renderPTable();
            renderWinLines();
            renderBack();
            break;
        }
        case SCREENTYPE.GAME_TO_TITLE: {
            playButtonX = 200;
            settingsButtonX = 200;
            gameScreen = SCREENTYPE.TITLE;
            break;
        }
    }
}

var deltaTime = 0;
var deltaCorrect = (1 / 8);
var prevTime = Date.now();
function loop() {
    deltaTime = (Date.now() - prevTime) * deltaCorrect;
    prevTime = Date.now();

    main();
    window.requestAnimationFrame(loop);
}

function init() {
    createPTable();
}
window.requestAnimationFrame(init);
window.requestAnimationFrame(loop);