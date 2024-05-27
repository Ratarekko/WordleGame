import { dictionary, wordForKey } from './assets/dictionaries.js';

const GRID_ROWS = 6;
const GRID_COLS = 5;
const POINTS = [1000, 750, 600, 500, 400, 300];
const HINT_COST_ONE = 100;
const HINT_COST_TWO = 200;

let secret, grid, currentRow, currentCol, gameEnded, balance;

document.addEventListener('DOMContentLoaded', () => {
    balance = 500;
    initGame();
    initUI();
    updateBalance();
});

const initGame = () => {
    secret = getRandomWord();
    grid = [];
    currentRow = 0;
    currentCol = 0;
    gameEnded = false;

    console.log(secret);

    const gameElement = document.getElementById('game');
    gameElement.innerHTML = '';
    hideElementById('end-message');
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

    if (key === 'Enter') enterKeyPress();
    else if (key === 'Backspace') removeLetter();
    else if (isLetter(key)) addLetter(key);
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

const enterKeyPress = () => {
    if (currentCol === GRID_COLS) {
        const word = getCurrentWord();
        if (dictionary.includes(word)) {
            revealWord(word);
            currentRow++;
            currentCol = 0;
            playSound('correctWord');
        } else {
            message("Такого слова не існує", 1000);
        }
    }
};

const getCurrentWord = () => grid[currentRow].map(box => box.textContent).join('');

const revealWord = (guess) => {
    const animationDuration = 500;
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
    let count = 0;
    for (let char of word) {
        if (char === letter) count++;
    }
    return count;
};

const checkGameStatus = (guess, animationDuration) => {
    setTimeout(() => {
        if (secret === guess) {
            handleWin();
        } else if (currentRow === GRID_ROWS) {
            handleLoss();
        }
    }, 3 * animationDuration);
};

const handleWin = () => {
    const points = POINTS[currentRow - 1];
    balance += points;
    updateBalance();
    endMessage(`Ти виграв! Вітаю!|Відгадано з ${currentRow} спроби: +${points}<img src="assets/coin.png" class="coin-icon" alt="">`,
        balance);
    playSound('win');
    gameEnded = true;
};

const handleLoss = () => {
    endMessage(`Пощастить наступного разу!😔|Загадане слово: ${secret}.`, balance);
    playSound('lose');
    gameEnded = true;
};

const message = (text, time) => {
    const message = document.getElementById('message');
    message.textContent = text;
    message.style.display = 'block';

    setTimeout(() => {
        message.style.display = 'none';
    }, time);
};

const endMessage = (text, balance) => {
    const endMessageElement = document.getElementById('end-message');
    const endMessageHeader = document.getElementById('end-message-header');
    const endMessageBody = document.getElementById('end-message-body');
    const totalScoreElement = document.getElementById('total-score-value');

    const [headerText, bodyText] = text.split('|');

    endMessageHeader.textContent = headerText;
    endMessageBody.innerHTML = bodyText;
    totalScoreElement.textContent = balance;
    endMessageElement.style.display = 'block';
    document.getElementById('restart-button').onclick = initGame;
};

const updateBalance = () => {
    const balanceValueElement = document.getElementById('balance-value');
    balanceValueElement.textContent = balance;
};

const initUI = () => {
    setupButtons();
    setupCloseModalOnClickOutside();
};

const setupButtons = () => {
    document.getElementById('rules-button').onclick = () => toggleModal('rules-modal');
    document.getElementById('hints-button').onclick = handleHintsButtonClick;

    document.getElementById('reveal-one-letter').onclick = () => revealHint(HINT_COST_ONE, 1);
    document.getElementById('reveal-two-letters').onclick = () => revealHint(HINT_COST_TWO, 2);
};

const setupCloseModalOnClickOutside = () => {
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) hideElement(event.target);
    };

    const closeButtons = document.querySelectorAll('.close');
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].onclick = (e) => hideElement(e.target.closest('.modal'));
    }
};

const handleHintsButtonClick = () => {
    if (currentCol > 0) {
        message('Очистіть рядок перед використанням підказки', 2000);
        return;
    }
    toggleModal('hints-modal');
};

const revealHint = (cost, lettersCount) => {
    if (balance >= cost) {
        balance -= cost;
        for (let i = 0; i < lettersCount; i++) revealOneLetter();
        updateBalance();
    } else {
        message('Недостатньо монет для цієї підказки', 2000);
    }
    hideElementById('hints-modal');
};

const revealOneLetter = () => {
    const unrevealedIndexes = getUnrevealedIndexes();
    const randomIndex = unrevealedIndexes[Math.floor(Math.random() * unrevealedIndexes.length)];
    grid[currentRow][randomIndex].textContent = secret[randomIndex];
};

const getUnrevealedIndexes = () => {
    const unrevealedIndexes = [];
    for (let index = 0; index < grid[currentRow].length; index++) {
        if (grid[currentRow][index].textContent === '') {
            unrevealedIndexes.push(index);
        }
    }
    return unrevealedIndexes;
};

const hideElementById = (id) => {
    document.getElementById(id).style.display = 'none';
};

const hideElement = (element) => {
    element.style.display = 'none';
};

const toggleModal = (id) => {
    const modal = document.getElementById(id);
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
};

const playSound = (soundId) => {
    const sound = document.getElementById(`${soundId}-sound`);
    sound.currentTime = 0;
    sound.play();
};
