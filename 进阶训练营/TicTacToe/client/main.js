let pattern = [
    0, 0, 0,
    0, 0, 0,
    0, 0, 0,
];
let color = 1;
let column = 3;

let resetBtn = document.getElementById("reset-btn");
resetBtn.onclick = resetChessboard;

/**
 * 创建棋盘
 */
function createChessBoard() {
    let chessboard = document.getElementById("chessboard");
    chessboard.innerHTML = "";

    for (let i = 0; i < column; i++) {
        for (let j = 0; j < column; j++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.innerText = pattern[i * column + j] === 2 ? "❌" :
                             pattern[i * column + j] === 1 ? "⭕️" : "";
            cell.addEventListener("click", () => move(j, i));
            chessboard.appendChild(cell);
        }
        chessboard.appendChild(document.createElement("br"));
    }
}

function move(x, y) {
    if (pattern[y * column + x]) {
        return;
    }
    pattern[y * column + x] = color;
    if (check(pattern, color)) {
        alert(`${color === 1 ? '⭕️' : '❌'} is win!`);
    }
    color = 3 - color;
    createChessBoard();
    
}

function check(pattern, color) {
    // 校验行是否一致
    for (let i = 0; i < column; i++) {
        let win = true;
        for (let j = 0; j < column; j++) {
            if (pattern[i * 3 + j] !== color) {
                win = false;
            }
        }
        if (win) {
            return true;
        }
    }
    // 校验列是否一致
    for (let i = 0; i < column; i++) {
        let win = true;
        for (let j = 0; j < column; j++) {
            if (pattern[j * 3 + i] !== color) {
                win = false;
            }
        }
        if (win) {
            return true;
        }
    }
    {
        let win = true;
        for (let i = 0; i < column; i++) {
            //0 2  1 4  2 6
            if (pattern[i * 2 + 2] !== color) {
                win = false;
            }
        }
        if (win) {
            return true;
        }
    }
    {
        let win = true;
        for (let i = 0; i < column; i++) {
            if (pattern[i * 3 + i] !== color) {
                win = false;
            }
        }
        if (win) {
            return true;
        }
    }
}


function resetChessboard() {
    pattern = [
        0, 0, 0,
        0, 0, 0,
        0, 0, 0,
    ];
    color = 1;
    createChessBoard();
}

createChessBoard();