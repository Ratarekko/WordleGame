import { dictionaries, wordForKey } from './dictionaries.js';

let secret;
let grid = [];
let currentRow;
let currentCol;
let gameEnded;

const GRID_ROWS = 6;
const GRID_COLS = 5;

document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

const initGame = () => {
    secret = getRandomWord();
    grid = [];
    currentRow = 0;
    currentCol = 0;
    gameEnded = false;

    console.log(secret)

    const gameElement = document.getElementById('game');
    gameElement.innerHTML = '';

    const endMessageElement = document.getElementById('end-message');
    endMessageElement.style.display = 'none';

    drawGrid(gameElement);
    registerKeyboardEvents();
};

const getRandomWord = () => wordForKey[Math.floor(Math.random() * wordForKey.length)];

const drawGrid = (container) => {
    const gridElement = document.createElement('div');
    gridElement.className = 'grid';

    for (let row = 0; row < GRID_ROWS; row++) {
        const gridRow = [];
        for (let col = 0; col < GRID_COLS; col++) {
            const box = drawBox(gridElement, row, col);
            gridRow.push(box);
        }
        grid.push(gridRow);
    }

    container.appendChild(gridElement);
};

const drawBox = (container, row, col) => {
    const box = document.createElement('div');
    box.className = 'box';
    box.id = `box${row}${col}`;
    container.appendChild(box);
    return box;
};

const registerKeyboardEvents = () => {
    document.body.onkeydown = (e) => handleKeyPress(e.key);
};

const handleKeyPress = (key) => {
    if (gameEnded) return;
    if (key === 'Enter') {
        handleEnterKey();
    } else if (key === 'Backspace') {
        removeLetter();
    } else if (isLetter(key)) {
        addLetter(key);
    }
};

const isLetter = (key) => /^[а-їґєії]$/i.test(key);

const addLetter = (letter) => {
    if (currentCol < GRID_COLS) {
        grid[currentRow][currentCol].textContent = letter;
        currentCol++;
    }
};

const removeLetter = () => {
    if (currentCol > 0) {
        grid[currentRow][currentCol - 1].textContent = '';
        currentCol--;
    }
};

const handleEnterKey = () => {
    if (currentCol === GRID_COLS) {
        const word = getCurrentWord();
        if (dictionaries.includes(word)) {
            revealWord(word);
            currentRow++;
            currentCol = 0;
        } else {
            showMessage("Такого слова не існує", 1000);
        }
    }
};

const getCurrentWord = () => Array.from(grid[currentRow]).map(box => box.textContent).join('');

const revealWord = (guess) => {
    const animationDuration = 500; // ms
    animateBoxes(guess, currentRow, animationDuration);
    checkGameStatus(guess, animationDuration);
};

const animateBoxes = (guess, row, animationDuration) => {
    for (let col = 0; col < GRID_COLS; col++) {
        const box = grid[row][col];
        const letter = box.textContent;

        setTimeout(() => {
            box.classList.add(getBoxClass(letter, guess, col));
        }, ((col + 1) * animationDuration) / 2);

        box.classList.add('animated');
        box.style.animationDelay = `${(col * animationDuration) / 2}ms`;
    }
};

const getBoxClass = (letter, guess, col) => {
    if (letter === secret[col]) {
        return 'right';
    } else if (secret.includes(letter)) {
        const correctOccurrences = countOccurrences(secret, letter);
        const guessedOccurrences = countOccurrences(guess.slice(0, col + 1), letter);
        return guessedOccurrences <= correctOccurrences ? 'wrong' : 'empty';
    } else {
        return 'empty';
    }
};

const countOccurrences = (word, letter) => {
    return [...word].filter(char => char === letter).length;
};

const checkGameStatus = (guess, animationDuration) => {
    setTimeout(() => {
        if (secret === guess) {
            showEndMessage('Ти виграв! Вітаю!');
            gameEnded = true;
        } else if (currentRow === GRID_ROWS) {
            showEndMessage(`Пощастить наступного разу!😔 Загадане слово: ${secret}.`);
            gameEnded = true;
        }
    }, 3 * animationDuration);
};

const showMessage = (text, time) => {
    const messageElement = document.getElementById('message');
    messageElement.textContent = text;
    messageElement.style.display = 'block';

    setTimeout(() => {
        messageElement.style.display = 'none';
    }, time);
};

const showEndMessage = (text) => {
    const endMessageElement = document.getElementById('end-message');
    const endMessageText = document.getElementById('end-message-text');
    endMessageText.textContent = text;
    endMessageElement.style.display = 'block';

    const restartButton = document.getElementById('restart-button');
    restartButton.onclick = initGame;
};
