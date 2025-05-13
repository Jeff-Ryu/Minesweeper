const bombCount = 10;
const boardSize = 81;
const goalTiles = boardSize - bombCount;
const adjIndex = [[-1,-1], [0,-1], [1,-1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

let active = 0;
let firstClick = 1;
let revealedTiles = 0;
let gridArray = Array(boardSize).fill(null);
let gridStatus = Array(boardSize).fill(0);
let flagCount = 0;
let bombDisplay;
let face;
let timeElapsed = 0;
let timerInterval;
let timeDisplay;

window.addEventListener("DOMContentLoaded", () => {
    bombDisplay = document.getElementById("bomb-display");
    timeDisplay = document.getElementById("time-display");
    face = document.getElementById("face");

    populateBombs();
    populateNums();
    colorNums();

    document.querySelectorAll(".tile").forEach(tile => {
        tile.addEventListener("click", handleLClick);
        tile.addEventListener("contextmenu", handleRClick);
    });
});

function startTimer() {
    clearInterval(timerInterval);
    timeElapsed = 0;
    timerInterval = setInterval(() => {
        timeElapsed++;
        updateTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimer() {
    timeDisplay.innerHTML = timeElapsed.toString().padStart(3, "0");
}

function populateBombs() {
    let i = 0;
    while (i < bombCount) {
        let rand = Math.floor(Math.random() * boardSize);
        if (gridArray[rand] === null) {
            gridArray[rand] = 9;
            i++;
        }
    }
}

function populateNums() {
    document.querySelectorAll(".tile").forEach(tile => {
        const index = tile.dataset.index;

        if (gridArray[index] === 9) return;

        const x = parseInt(tile.dataset.x);
        const y = parseInt(tile.dataset.y);
        let bombs = 0;

        adjIndex.forEach(([a, b]) => {
            const neighbor = document.querySelector(`.tile[data-x="${x + a}"][data-y="${y + b}"]`);
            if (neighbor && gridArray[neighbor.dataset.index] == 9) bombs++;
        });

        if (bombs > 0) gridArray[index] = bombs;
        else gridArray[index] = 0;
    });
}

function colorNums() {
    document.querySelectorAll(".tile").forEach(tile => {
        const num = Number(gridArray[tile.dataset.index]);
        if (num < 8) tile.classList.add(`color-${num}`);
    });
}

function handleLClick(event) {
    if (firstClick) {
        firstClick = 0;
        active = 1;
        startTimer();
    }
    if (!active) return;
    const tile = event.currentTarget.closest(".tile");
    const index = tile.dataset.index;
    if (gridStatus[index] !== 0) return;

    revealTile(tile, index);

    if (gridArray[index] === 9) {
        active = 0;
        changeFace("lose");
        stopTimer();
        tile.innerHTML = "&#128165;";
        document.querySelectorAll(".tile").forEach(t => {
            if (gridArray[t.dataset.index] === 9 && t !== tile) {
                t.innerHTML = "&#128163;";
            }
        });
    } else if (gridArray[index] === 0) {
        revealZeros(tile);
    }
}

function revealTile(tile, index) {
    if (gridStatus[index] !== 0) return;

    gridStatus[index] = 1;
    revealedTiles++;

    tile.classList.remove("covered");
    void tile.offsetWidth;
    tile.classList.add("revealed");

    if (gridArray[index] > 0) tile.innerHTML = gridArray[index];
    if (gridArray[index] === 0) tile.innerHTML = "";
    checkWin();
}

function revealZeros(tile) {
    const x = parseInt(tile.dataset.x);
    const y = parseInt(tile.dataset.y);

    for (const [a, b] of adjIndex) {
        const neighbor = document.querySelector(`.tile[data-x="${x + a}"][data-y="${y + b}"]`);
        if (!neighbor) continue;

        const index = neighbor.dataset.index;
        if (gridStatus[index] !== 0) continue;

        revealTile(neighbor, index);
        if (gridArray[index] === 0) revealZeros(neighbor);
        else if (gridArray[index] > 0) neighbor.innerHTML = gridArray[index];
    }
}

function handleRClick(event) {
    event.preventDefault();
    if (!active) return;

    const tile = event.currentTarget.closest(".tile");
    const index = tile.dataset.index;

    if (gridStatus[index] === 0) {
        if (flagCount >= bombCount) return;
        tile.innerHTML = "&#128681;";
        gridStatus[index] = 2;
        flagCount++;
        updateCount();
    } else if (gridStatus[index] === 2) {
        tile.innerHTML = "";
        gridStatus[index] = 0;
        flagCount--;
        updateCount();
    }
    checkWin();
}

function checkWin() {
    let won = true;

    for (let i = 0; i < boardSize; i++) {
        if ((gridArray[i] !== 9 && gridStatus[i] !== 1) ||
            (gridArray[i] === 9 && gridStatus[i] !== 2)) {
            won = false;
            break;
        }
    }
    if (won) {
        changeFace("win");
        active = 0;
        stopTimer();
    }
}

function updateCount() {
    bombDisplay.innerHTML = (bombCount - flagCount).toString().padStart(3, "0");
}

function reset() {
    document.querySelectorAll(".tile").forEach(tile => {
        tile.innerHTML = "";
        tile.classList.remove("revealed");
        for (let i = 1; i <= 8; i++) {
            tile.classList.remove(`color-${i}`);
        }
        void tile.offsetWidth;
        tile.classList.add("covered");
    });
    active = 1;
    firstClick = 1;
    revealedTiles = 0;
    gridArray = Array(boardSize).fill(null);
    gridStatus = Array(boardSize).fill(0);
    flagCount = 0;
    stopTimer();
    timeElapsed = 0;
    updateTimer();
    updateCount();
    changeFace("default");
    populateBombs();
    populateNums();
    colorNums();
}

function changeFace(event) {
    if (!face) return;
    switch (event) {
        case "win":
            face.innerHTML = "&#128526;";
            break;
        case "lose":
            face.innerHTML = "&#128128;";
            break;
        case "default":
            face.innerHTML = "&#128512;";
            break;
        case "active":
            face.innerHTML = "&#128528;";
            break;
    }
}

