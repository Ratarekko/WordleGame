import { wordForKey, dictionaries } from './dictionaries.js';

let secret;
let grid = [];
let currentRow;
let currentCol;
let gameEnded;

const drawGrid = (container) => {
    const gridElement = document.createElement('div');
    gridElement.className = 'grid';

    for (let row = 0; row < 6; row++) {
        const gridRow = [];
        for (let col = 0; col < 5; col++) {
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
    box.textContent = '';

    container.appendChild(box);
    return box;
};

const updateGrid = () => {
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            const box = grid[row][col];
            box.textContent = grid[row][col].textContent;
        }
    }
};

const registerKeyboardEvents = () => {
    document.body.onkeydown = (e) => {
        handleKeyPress(e.key);
    };
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

    updateGrid();
};

const handleEnterKey = () => {
    if (currentCol === 5) {
        const word = getCurrentWord();
        if (isWordValid(word)) {
            revealWord(word);
            currentRow++;
            currentCol = 0;
        } else {
            showMessage("Такого слова не існує", 1000);
        }
    }
};

const isLetter = (key) => /^[а-їґєії]$/i.test(key);

const addLetter = (letter) => {
    if (currentCol < 5) {
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

const getCurrentWord = () => grid[currentRow].map(box => box.textContent).join('');  // diff on cw

const isWordValid = (word) => dictionaries.includes(word);

const revealWord = (guess) => {
    const animationDuration = 500; // ms

    animateBoxes(guess, currentRow, animationDuration);
    checkGameStatus(guess, animationDuration);
};

const animateBoxes = (guess, row, animationDuration) => {          //Обов'язковий рефакторинг
    for (let col = 0; col < 5; col++) {
        const box = grid[row][col];
        const letter = box.textContent;

        setTimeout(() => {
            box.classList.add(getBoxClass(letter, guess, col));
        }, ((col + 1) * animationDuration) / 2);

        box.classList.add('animated');
        box.style.animationDelay = `${(col * animationDuration) / 2}ms`;
    }
};

const getBoxClass = (letter, guess, col) => {     // diff on cw
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

const countOccurrences = (word, letter) => {                            // diff on cw
    return [...word].filter(char => char === letter).length;
};

const checkGameStatus = (guess, animationDuration) => {
    setTimeout(() => {
        if (secret === guess) {
            showEndMessage('Вітаю! Перезапусти сторінку для нової гри');
            gameEnded = true;
        } else if (currentRow === 6) {
            showEndMessage(`Пощастить наступного разу!😔 Загадане слово: ${secret}.`);
            gameEnded = true;
        }
    }, 3 * animationDuration);
};

const initGame = () => {
    secret = wordForKey[Math.floor(Math.random() * wordForKey.length)];
    grid = [];
    currentRow = 0;
    currentCol = 0;
    gameEnded = false;

    console.log(secret);

    const gameElement = document.getElementById('game');
    gameElement.innerHTML = '';

    const endMessageElement = document.getElementById('end-message');
    endMessageElement.style.display = 'none';

    drawGrid(gameElement);
    registerKeyboardEvents();
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

initGame();
