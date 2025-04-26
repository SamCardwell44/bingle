// Game data with scoring metrics
const gamesList = [
    { id: 1, name: "Wordle", url: "https://www.nytimes.com/games/wordle", scoring: "guesses6", category: "words" },
    { id: 2, name: "Worldle", url: "https://worldle.teuteuf.fr/", scoring: "guesses6", category: "geography" },
    { id: 3, name: "Flagle", url: "https://www.flagle.io/", scoring: "guesses6", category: "geography" },
    { id: 4, name: "Timeguessr", url: "https://timeguessr.com/roundonedaily", scoring: "points75000", category: "geography" },
    { id: 5, name: "Foodguessr", url: "https://www.foodguessr.com/game/daily", scoring: "points15000", category: "misc" },
    { id: 6, name: "Framed", url: "https://framed.wtf/", scoring: "guesses6", category: "films" },
    { id: 7, name: "Connections", url: "https://www.nytimes.com/games/connections", scoring: "mistakes4", category: "words" },
    { id: 8, name: "Semantle Junior", url: "https://semantle.com/junior", scoring: "guesses75", category: "words" },
    { id: 9, name: "Gamedle Classic", url: "https://www.gamedle.wtf/classic", scoring: "guesses6", category: "games" },
    { id: 10, name: "Strands", url: "https://www.nytimes.com/games/strands", scoring: "hints3", category: "words" },
    { id: 11, name: "Flagpath", url: "https://www.flagpath.xyz/", scoring: "mistakes3", category: "geography" },
    { id: 12, name: "Waffle", url: "https://wafflegame.net/", scoring: "guesses15", category: "words" },
    { id: 13, name: "Hexaguessr Daily", url: "https://samuelcardwell.shinyapps.io/hexaguessr_app/", scoring: "guesses6", category: "geography" },
    { id: 14, name: "Bandle", url: "https://bandle.app/daily", scoring: "guesses6", category: "words" },
    { id: 15, name: "Globle", url: "https://globle-game.com/game", scoring: "guesses15", category: "geography" },
    { id: 16, name: "Mathdle Easy", url: "https://lemononmars.github.io/mathdle/", scoring: "guesses6", category: "maths" },
    { id: 17, name: "Gamedle Art", url: "https://www.gamedle.wtf/artwork", scoring: "guesses6", category: "games" },
    { id: 18, name: "Colorfle", url: "https://colorfle.com/", scoring: "guesses6", category: "misc" },
    { id: 19, name: "Facedle", url: "https://facedle.app/", scoring: "guesses6", category: "films" },
    { id: 20, name: "Shaple", url: "https://swag.github.io/shaple/", scoring: "mistakes5", category: "misc" },
    { id: 21, name: "Metazooa", url: "https://metazooa.com/play/game", scoring: "guesses20", category: "misc" },
    { id: 22, name: "Realbirdfakebird", url: "https://realbirdfakebird.com/", scoring: "mistakes7", category: "misc" },
    { id: 23, name: "Lyricle", url: "https://www.lyricle.app/", scoring: "guesses6", category: "music" },
    { id: 24, name: "Flickle", url: "https://flickle.app/", scoring: "guesses6", category: "films" },
    { id: 25, name: "Disorderly", url: "https://playdisorderly.com/", scoring: "guesses6", category: "words" },
    { id: 26, name: "Spellcheck", url: "https://spellcheck.xyz/solo_game", scoring: "mistakes5", category: "words" },
    { id: 27, name: "Redactle", url: "https://redactlegame.com/", scoring: "guesses75", category: "misc" },
    { id: 28, name: "Tradle", url: "https://games.oec.world/en/tradle/", scoring: "guesses6", category: "geography" },
    { id: 29, name: "Thrice", url: "https://thrice.geekswhodrink.com/", scoring: "points15", category: "trivia" }
];

// Game configuration
let gridSize = 3;
let currentGrid = [];
let gameStatuses = {};
let gameScores = {};
let difficultyAssignments = {};

let streakData = {};
let averageScoreData = {};
let rerollsRemaining = 0;
let lastRerollDate = null;
let customSeed = null;

// DOM elements
const dateDisplay = document.getElementById('date-display');
const gameGrid = document.getElementById('game-grid');
const newGridButton = document.getElementById('new-grid');
const gridSizeSelector = document.getElementById('grid-size-selector');
const completedCount = document.getElementById('completed-count');
const flawlessCount = document.getElementById('flawless-count');
const totalScore = document.getElementById('total-score');
const resetProgressButton = document.getElementById('reset-progress');
const dailyBonusDisplay = document.getElementById('daily-bonus');

// Initialize the game
function initializeGame() {

    //localStorage.clear(); // Uncomment this line to clear all local storage for testing

    // Display current date
    const currentDate = new Date();
    dateDisplay.textContent = currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });    

    // Check if customSeed is not set or is 'daily'
    if (!customSeed || customSeed === 'daily') {
        // Create a daily seed with format "daily" + YYYYMMDD + gridSize
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}${month}${day}`;
        customSeed = `daily${dateString}${gridSize}`;
    }
    
    // Load saved progress if exists
    loadProgress();

    initializeCustomSeedInput();
    
    // Generate grid based on today's date or custom seed
    generateDailyGrid();
    
    // Check and reset rerolls AFTER grid generation
    checkAndResetRerolls();
    
    // Load streak data
    loadStreakData();

    // Event listeners
    gridSizeSelector.addEventListener('change', handleGridSizeChange);
    resetProgressButton.addEventListener('click', resetProgress);
    
    const rerollButton = document.getElementById('reroll-button');
    if (rerollButton) {
        rerollButton.addEventListener('click', activateRerollMode);
    }
    
    // Update displays
    updateScoreDisplay();
    updateStreakDisplay();
    updateRerollButton();
    initializeTimer();
}

function handleGridSizeChange() {
    // Update gridSize first
    gridSize = parseInt(gridSizeSelector.value);
    
    // If using daily seed, update it to include grid size
    if (customSeed === 'daily' || isDailySeed(customSeed)) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}${month}${day}`;
        customSeed = `daily${dateString}${gridSize}`;
    }
    
    // Force regeneration by removing saved data
    const saveKey = `bingleGameData-${customSeed}-${gridSize}`;
    localStorage.removeItem(saveKey);
    
    // Generate the new grid
    generateDailyGrid();
    
    // Check reroll data
    checkAndResetRerolls();
    
    // Update scores
    updateScoreDisplay();
}

function createSeededRandom(seed) {
    // Convert seed to a 32-bit integer
    let initialSeed = typeof seed === 'string' ? hashString(seed) : Math.floor(seed);
    
    // Use a simple but more consistent algorithm (mulberry32)
    return function() {
        initialSeed = (initialSeed + 0x6D2B79F5) | 0;
        let t = Math.imul(initialSeed ^ initialSeed >>> 15, 1 | initialSeed);
        t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

//Load streak data
function loadStreakData() {
    const savedData = localStorage.getItem('bingleStreakData');
    
    if (savedData) {
        streakData = JSON.parse(savedData);
    } else {
        streakData = {
            currentStreak: 0,
            bestStreak: 0,
            lastPlayedDate: null
        };
    }
    
    // Load average scores data
    const savedScoresData = localStorage.getItem('bingleAverageScoreData');
    if (savedScoresData) {
        averageScoreData = JSON.parse(savedScoresData);
    } else {
        averageScoreData = {
            totalGames: 0,
            totalScore: 0,
            highestScore: 0,
            lastScore: 0
        };
    }
    
    updateStreakDisplay();
}

// Parse scoring string to get type and value
function parseScoringString(scoringString) {
    // Extract scoring type and maximum value
    const type = scoringString.replace(/[0-9]/g, '');
    const maxValue = parseInt(scoringString.replace(/[^0-9]/g, '')) || 0;
    
    return { type, maxValue };
}

// Get par value based on difficulty and scoring type
function getParValue(game, difficulty) {
    const { type, maxValue } = parseScoringString(game.scoring);
    
    let par;
    
    // Set par value based on scoring type
    switch(type) {
        case 'guesses':
            // For guesses, lower is better
            par = Math.ceil(maxValue * (difficulty === 'hard' ? 0.5 : difficulty === 'medium' ? 0.75 : 0.9));
            break;
        case 'points':
            // For points, higher is better
            par = Math.floor(maxValue * (difficulty === 'hard' ? 0.75 : difficulty === 'medium' ? 0.5 : 0.25));
            break;
        case 'mistakes':
            // For mistakes, lower is better
            par = Math.ceil(maxValue * (difficulty === 'hard' ? 0.25 : difficulty === 'medium' ? 0.5 : 0.75));
            break;
        case 'hints':
            // For hints, lower is better
            par = Math.ceil(maxValue * (difficulty === 'hard' ? 0.3 : difficulty === 'medium' ? 0.6 : 0.9));
            break;
        default:
            par = Math.ceil(maxValue / 2);
    }
    
    return par;
}

// Evaluate the score compared to par and maximum
function evaluateScore(game, score) {
    if (score === null || score === undefined) return 'unattempted';
    if (score === -1) return 'incomplete';
    
    const { type, maxValue } = parseScoringString(game.scoring);
    const par = getParValue(game, difficultyAssignments[game.id]);
    
    // For different scoring types, evaluation is different
    switch(type) {
        case 'guesses':
            // Lower is better for guesses
            if (score <= 1) return 'flawless';  // First guess is flawless
            if (score <= par) return 'belowPar';
            if (score <= maxValue) return 'abovePar';
            return 'incomplete';
        case 'points':
            // Higher is better for points
            if (score >= maxValue) return 'flawless';
            if (score >= par) return 'belowPar';
            if (score > 0) return 'abovePar';
            return 'incomplete';
        case 'mistakes':
            // Lower is better for mistakes
            if (score === 0) return 'flawless';  // No mistakes is flawless
            if (score <= par) return 'belowPar';
            if (score < maxValue) return 'abovePar';
            return 'incomplete';
        case 'hints':
            // Lower is better for hints
            if (score === 0) return 'flawless';  // No hints is flawless
            if (score <= par) return 'belowPar';
            if (score < maxValue) return 'abovePar';
            return 'incomplete';
        default:
            return 'incomplete';
    }
}

// Get score value based on performance
function getScoreValue(performance) {
    switch(performance) {
        case 'flawless': return 3;
        case 'belowPar': return 2;
        case 'abovePar': return 1;
        case 'incomplete': return -1;
        default: return 0; // unattempted
    }
}

// Assign difficulty levels to games in the grid
function assignDifficulties(seededRandomFunc) {
    const totalCells = gridSize * gridSize;
    const hardCount = Math.max(1, Math.floor(totalCells / 9));  // 1/9 of cells should be hard
    const mediumCount = Math.max(3, Math.floor(totalCells / 3)); // 3/9 of cells should be medium
    
    // Create difficulty assignments array with placeholders
    const difficulties = Array(totalCells).fill('easy');
    
    // Assign hard cells
    for (let i = 0; i < hardCount; i++) {
        difficulties[i] = 'hard';
    }
    
    // Assign medium cells
    for (let i = hardCount; i < hardCount + mediumCount; i++) {
        difficulties[i] = 'medium';
    }
    
    // Shuffle difficulties using the provided seeded random generator
    for (let i = difficulties.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandomFunc() * (i + 1));
        [difficulties[i], difficulties[j]] = [difficulties[j], difficulties[i]];
    }
    
    // Assign to games
    currentGrid.forEach((game, index) => {
        difficultyAssignments[game.id] = difficulties[index];
    });
}

// Generate a grid based on the current date as a seed
function generateDailyGrid() {
    // Clear the current grid
    gameGrid.innerHTML = '';

    if (customSeed === 'daily') {
        // Create a daily seed with format "daily" + YYYYMMDD + gridSize
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}${month}${day}`;
        customSeed = `daily${dateString}${gridSize}`;
    }
    
    // Check if we have a saved grid for today and this seed+gridSize
    const saveKey = `bingleGameData-${customSeed}-${gridSize}`;
    const savedData = localStorage.getItem(saveKey);
    let useExistingGrid = false;
    
    if (savedData) {
        const data = JSON.parse(savedData);
        const savedDate = new Date(data.lastUpdated);
        const today = new Date();
        
        // Only use saved grid if it's from today AND has the exact same seed AND grid size
        if (savedDate.toDateString() === today.toDateString() && 
            data.customSeed === customSeed && 
            data.gridSize === gridSize) {
            
            // Use the saved grid
            currentGrid = data.currentGrid;
            difficultyAssignments = data.difficultyAssignments || {};
            useExistingGrid = true;
        }
    }
    
    // Only generate a new grid if we don't have a saved one
    if (!useExistingGrid) {
        // Generate unique seed value that's different for different grid sizes
        let numericSeed = hashString(customSeed) + (gridSize * 13245);
        console.log("Using seed:", numericSeed); // Debug output
        
        // Create consistent seeded random function
        const seededRandom = createSeededRandom(numericSeed);
        
        // Test the random generator
        console.log("Random values:", [seededRandom(), seededRandom(), seededRandom()]); // Debug
        
        // Shuffle games using seeded random
        const shuffledGames = [...gamesList];
        console.log("Before shuffle:", shuffledGames.map(g => g.name).slice(0, 5)); // Debug
        
        for (let i = shuffledGames.length - 1; i > 0; i--) {
            const j = Math.floor(seededRandom() * (i + 1));
            [shuffledGames[i], shuffledGames[j]] = [shuffledGames[j], shuffledGames[i]];
        }
        
        console.log("After shuffle:", shuffledGames.map(g => g.name).slice(0, 5)); // Debug
        
        // Select games for the grid
        currentGrid = shuffledGames.slice(0, gridSize * gridSize);
        console.log("Selected games:", currentGrid.map(g => g.name)); // Debug
        
        // Assign difficulties using the SAME seeded random generator
        assignDifficulties(seededRandom);
    }

    // Initialize game statuses and scores for new games
    currentGrid.forEach(game => {
        if (!gameStatuses[game.id]) {
            gameStatuses[game.id] = 'unattempted';
        }
        if (!gameScores[game.id] && gameScores[game.id] !== 0) {
            gameScores[game.id] = null;
        }
    });

    // Create grid layout CSS
    gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    // Create grid cells
    currentGrid.forEach(game => {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.gameId = game.id;
        
        // Add difficulty class for styling
        cell.classList.add(`difficulty-${difficultyAssignments[game.id]}`);
        
        const title = document.createElement('h3');
        title.className = 'game-title';
        title.textContent = game.name;
        
        const difficultyBadge = document.createElement('div');
        difficultyBadge.className = `difficulty-badge ${difficultyAssignments[game.id]}`;
        difficultyBadge.textContent = difficultyAssignments[game.id].charAt(0).toUpperCase() + difficultyAssignments[game.id].slice(1);
        
        const link = document.createElement('a');
        link.className = 'game-link';
        link.href = game.url;
        link.target = '_blank';
        link.textContent = 'Play Game';
        
        // Parse scoring info
        const { type, maxValue } = parseScoringString(game.scoring);
        const par = getParValue(game, difficultyAssignments[game.id]);
        
        // Create scoring info display
        const scoringInfo = document.createElement('div');
        scoringInfo.className = 'scoring-info';
        
        let scoringTypeText = '';
        switch(type) {
            case 'guesses': scoringTypeText = `Guesses (Par: ${par}, Max: ${maxValue})`; break;
            case 'points': scoringTypeText = `Points (Par: ${par}, Max: ${maxValue})`; break;
            case 'mistakes': scoringTypeText = `Mistakes (Par: ${par}, Max: ${maxValue})`; break;
            case 'hints': scoringTypeText = `Hints (Par: ${par}, Max: ${maxValue})`; break;
            default: scoringTypeText = 'Score'; break;
        }
        
        scoringInfo.textContent = scoringTypeText;
        
        // Create input container
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';
        
        // Create score input
        const scoreInput = document.createElement('input');
        scoreInput.type = 'number';
        scoreInput.min = type === 'points' ? '0' : '0';
        scoreInput.max = maxValue.toString();
        scoreInput.className = 'score-input';
        scoreInput.placeholder = type === 'points' ? 'Points' : type === 'guesses' ? 'Guesses' : type === 'mistakes' ? 'Mistakes' : 'Hints';
        scoreInput.value = gameScores[game.id] !== null && gameScores[game.id] !== undefined && gameScores[game.id] !== -1 ? gameScores[game.id] : '';
        
        // Add input event listener
        scoreInput.addEventListener('input', () => {
            let value = scoreInput.value.trim();
            
            if (value === '') {
                gameScores[game.id] = null;
                gameStatuses[game.id] = 'unattempted';
            } else {
                value = parseInt(value, 10);
                
                if (isNaN(value)) {
                    scoreInput.value = '';
                    gameScores[game.id] = null;
                    gameStatuses[game.id] = 'unattempted';
                } else {
                    gameScores[game.id] = value;
                    gameStatuses[game.id] = evaluateScore(game, value);
                }
            }
            
            // Update cell styling based on score
            updateCellStyle(cell, game);
            
            // Update overall score
            saveProgress();
            updateScoreDisplay();
        });
        
        // Create incomplete button
        const incompleteBtn = document.createElement('button');
        incompleteBtn.className = 'incomplete-btn';
        incompleteBtn.textContent = 'Mark Failed';
        incompleteBtn.addEventListener('click', () => {
            gameScores[game.id] = -1;
            gameStatuses[game.id] = 'incomplete';
            scoreInput.value = '';
            scoreInput.disabled = true;
            
            // Update cell styling
            updateCellStyle(cell, game);
            
            // Update overall score
            saveProgress();
            updateScoreDisplay();
        });
        
        // Create reset button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'reset-btn';
        resetBtn.textContent = 'Reset';
        resetBtn.addEventListener('click', () => {
            gameScores[game.id] = null;
            gameStatuses[game.id] = 'unattempted';
            scoreInput.value = '';
            scoreInput.disabled = false;
            
            // Update cell styling
            updateCellStyle(cell, game);
            
            // Update overall score
            saveProgress();
            updateScoreDisplay();
        });
        
        // Add elements to input container
        inputContainer.appendChild(scoreInput);
        inputContainer.appendChild(incompleteBtn);
        inputContainer.appendChild(resetBtn);
        
        // Assemble cell
        cell.appendChild(title);
        cell.appendChild(difficultyBadge);
        cell.appendChild(link);
        cell.appendChild(scoringInfo);
        cell.appendChild(inputContainer);
        
        gameGrid.appendChild(cell);
        
        // Set initial cell styling
        updateCellStyle(cell, game);
    });
    
    // Save the current grid to localStorage
    saveProgress();
}


// Update cell styling based on game status
function updateCellStyle(cell, game) {
    // Remove all status classes
    cell.classList.remove('status-flawless', 'status-belowPar', 'status-abovePar', 'status-incomplete', 'status-unattempted');
    
    // Add class based on current status
    const status = gameStatuses[game.id];
    cell.classList.add(`status-${status}`);
    
    // Handle disabled state for score input
    const scoreInput = cell.querySelector('.score-input');
    if (status === 'incomplete') {
        scoreInput.disabled = true;
    } else {
        scoreInput.disabled = false;
    }
}

// Check for completed rows, columns, and diagonals
function checkForCompletedLines() {
    const totalRows = gridSize;
    const bonusPoints = [];
    
    // Check rows
    for (let row = 0; row < totalRows; row++) {
        let allComplete = true;
        for (let col = 0; col < gridSize; col++) {
            const index = row * gridSize + col;
            if (index >= currentGrid.length) continue;
            
            const gameId = currentGrid[index].id;
            const status = gameStatuses[gameId];
            
            if (status === 'unattempted' || status === 'incomplete') {
                allComplete = false;
                break;
            }
        }
        
        if (allComplete) {
            bonusPoints.push(`Row ${row + 1}: +${gridSize} points`);
        }
    }
    
    // Check columns
    for (let col = 0; col < gridSize; col++) {
        let allComplete = true;
        for (let row = 0; row < totalRows; row++) {
            const index = row * gridSize + col;
            if (index >= currentGrid.length) continue;
            
            const gameId = currentGrid[index].id;
            const status = gameStatuses[gameId];
            
            if (status === 'unattempted' || status === 'incomplete') {
                allComplete = false;
                break;
            }
        }
        
        if (allComplete) {
            bonusPoints.push(`Column ${col + 1}: +${gridSize} points`);
        }
    }
    
    // Check diagonals (only if grid is square)
    if (gridSize === totalRows) {
        // Main diagonal (top-left to bottom-right)
        let mainDiagonalComplete = true;
        for (let i = 0; i < gridSize; i++) {
            const index = i * gridSize + i;
            if (index >= currentGrid.length) continue;
            
            const gameId = currentGrid[index].id;
            const status = gameStatuses[gameId];
            
            if (status === 'unattempted' || status === 'incomplete') {
                mainDiagonalComplete = false;
                break;
            }
        }
        
        if (mainDiagonalComplete) {
            bonusPoints.push(`Main Diagonal: +${gridSize} points`);
        }
        
        // Other diagonal (top-right to bottom-left)
        let otherDiagonalComplete = true;
        for (let i = 0; i < gridSize; i++) {
            const index = i * gridSize + (gridSize - 1 - i);
            if (index >= currentGrid.length) continue;
            
            const gameId = currentGrid[index].id;
            const status = gameStatuses[gameId];
            
            if (status === 'unattempted' || status === 'incomplete') {
                otherDiagonalComplete = false;
                break;
            }
        }
        
        if (otherDiagonalComplete) {
            bonusPoints.push(`Anti-Diagonal: +${gridSize} points`);
        }
    }
    
    return bonusPoints;
}

// Calculate total bonus points
function calculateBonusPoints() {
    const bonusLines = checkForCompletedLines();
    return bonusLines.length * gridSize;
}

// Update score display based on current statuses
// Update score display based on current statuses
function updateScoreDisplay() {
    let flawlessCount = 0;
    let belowParCount = 0;
    let aboveParCount = 0;
    let incompleteCount = 0;
    let totalBaseScore = 0;
    
    // Count statuses and calculate base score
    currentGrid.forEach(game => {
        const status = gameStatuses[game.id];
        
        switch(status) {
            case 'flawless':
                flawlessCount++;
                totalBaseScore += 3;
                break;
            case 'belowPar':
                belowParCount++;
                totalBaseScore += 2;
                break;
            case 'abovePar':
                aboveParCount++;
                totalBaseScore += 1;
                break;
            case 'incomplete':
                incompleteCount++;
                totalBaseScore -= 1;
                break;
            default: // unattempted
                // No points for unattempted
        }
    });
    
    // Check for and animate completed lines
    const completedLines = checkAndAnimateCompletedLines();
    
    // Calculate bonus points for completed lines
    const bonusPoints = completedLines.length * gridSize;
    const totalScore = totalBaseScore + bonusPoints;
    
    // Update the bonus display
    if (dailyBonusDisplay) {
        if (completedLines.length > 0) {
            let bonusHtml = '<h3>Bonus Points</h3><ul>';
            completedLines.forEach(line => {
                const lineType = line.type === 'row' ? `Row ${line.index + 1}` : 
                                line.type === 'column' ? `Column ${line.index + 1}` : 
                                line.index === 'main' ? 'Main Diagonal' : 'Anti-Diagonal';
                                
                bonusHtml += `<li>${lineType}: +${gridSize} points</li>`;
            });
            bonusHtml += '</ul>';
            bonusHtml += `<p><strong>Total Bonus: +${bonusPoints} points</strong></p>`;
            dailyBonusDisplay.innerHTML = bonusHtml;
            dailyBonusDisplay.style.display = 'block';
        } else {
            dailyBonusDisplay.style.display = 'none';
        }
    }
    
    // Update score elements
    document.getElementById('flawless-count').textContent = flawlessCount;
    document.getElementById('below-par-count').textContent = belowParCount;
    document.getElementById('above-par-count').textContent = aboveParCount;
    document.getElementById('incomplete-count').textContent = incompleteCount;
    document.getElementById('base-score').textContent = totalBaseScore;
    document.getElementById('bonus-points').textContent = bonusPoints;
    document.getElementById('total-score').textContent = totalScore;
    
    // Update streak data when score changes
    updateStreakData();
}

// Save progress to localStorage
function saveProgress() {
    const saveKey = `bingleGameData-${customSeed}-${gridSize}`;
    const data = {
        lastUpdated: new Date(),
        customSeed,
        gridSize,
        currentGrid,
        gameStatuses,
        gameScores,
        difficultyAssignments
    };

    localStorage.setItem(saveKey, JSON.stringify(data));
    
    // Also update streak data
    updateStreakData();
}

function updateStreakData() {
    const today = new Date().toDateString();
    const totalGrid = gridSize * gridSize;
    const completedGames = Object.values(gameStatuses).filter(status => 
        status === 'flawless' || status === 'belowPar' || status === 'abovePar'
    ).length;
    
    // Calculate score
    let baseScore = 0;
    Object.values(gameStatuses).forEach((status, i) => {
        baseScore += getScoreValue(status);
    });
    
    const bonusPoints = calculateBonusPoints();
    const totalScore = baseScore + bonusPoints;
    
    // Update streak only if some progress is made
    if (completedGames > 0) {
        if (!streakData.lastPlayedDate || streakData.lastPlayedDate !== today) {
            // It's a new day
            if (streakData.lastPlayedDate) {
                // Check if yesterday was played
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayString = yesterday.toDateString();
                
                if (streakData.lastPlayedDate === yesterdayString) {
                    // Played yesterday, continue streak
                    streakData.currentStreak++;
                } else {
                    // Didn't play yesterday, reset streak
                    streakData.currentStreak = 1;
                }
            } else {
                // First time playing
                streakData.currentStreak = 1;
            }
            
            // Update best streak if needed
            if (streakData.currentStreak > streakData.bestStreak) {
                streakData.bestStreak = streakData.currentStreak;
            }
            
            // Update last played date
            streakData.lastPlayedDate = today;
            
            // Update average score data
            averageScoreData.totalGames++;
            averageScoreData.totalScore += totalScore;
            
            if (totalScore > averageScoreData.highestScore) {
                averageScoreData.highestScore = totalScore;
            }
            
            averageScoreData.lastScore = totalScore;
            
            // Save data
            localStorage.setItem('bingleStreakData', JSON.stringify(streakData));
            localStorage.setItem('bingleAverageScoreData', JSON.stringify(averageScoreData));
            
            // Update display
            updateStreakDisplay();
        }
    }
}

function updateStreakDisplay() {
    const streakDisplay = document.getElementById('streak-display');
    if (streakDisplay) {
        let html = '';
        
        // Display current streak
        html += `<div class="streak-card">
                    <span class="streak-label">Current Streak:</span>
                    <span class="streak-value">${streakData.currentStreak || 0}</span>
                </div>`;
        
        // Display best streak
        html += `<div class="streak-card">
                    <span class="streak-label">Best Streak:</span>
                    <span class="streak-value">${streakData.bestStreak || 0}</span>
                </div>`;
        
        // Average score
        const averageScore = averageScoreData.totalGames > 0 ? 
            (averageScoreData.totalScore / averageScoreData.totalGames).toFixed(1) : 0;
        
        html += `<div class="streak-card">
                    <span class="streak-label">Average Score:</span>
                    <span class="streak-value">${averageScore}</span>
                </div>`;
        
        // Highest score
        html += `<div class="streak-card">
                    <span class="streak-label">Highest Score:</span>
                    <span class="streak-value">${averageScoreData.highestScore || 0}</span>
                </div>`;
        
        streakDisplay.innerHTML = html;
    }
}

// Load progress from localStorage
function loadProgress() {
    const saveKey = `bingleGameData-${customSeed}-${gridSize}`;
    const savedData = localStorage.getItem(saveKey);
    
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Check if data is from today
        const savedDate = new Date(data.lastUpdated);
        const today = new Date();
        
        // Only restore if it's the same day
        if (savedDate.toDateString() === today.toDateString()) {
            gridSize = data.gridSize || 3;
            gameStatuses = data.gameStatuses || {};
            gameScores = data.gameScores || {};
            difficultyAssignments = data.difficultyAssignments || {};
            gridSizeSelector.value = gridSize;
            
            // Restore the current grid if available
            if (data.currentGrid && data.currentGrid.length > 0) {
                currentGrid = data.currentGrid;
            }
            
            // Also restore custom seed if available
            if (data.customSeed) {
                customSeed = data.customSeed;
                const seedInput = document.getElementById('custom-seed-input');
                if (seedInput) {
                    seedInput.value = customSeed;
                }
            }
        } else {
            // If it's a new day, keep the grid size but reset statuses and scores
            gridSize = data.gridSize || 3;
            gameStatuses = {};
            gameScores = {};
            difficultyAssignments = {};
            gridSizeSelector.value = gridSize;
        }
    }
}

// Reset progress
function resetProgress() {
    if (confirm('Are you sure you want to reset your progress?')) {
        gameStatuses = {};
        gameScores = {};
        saveProgress();
        generateDailyGrid();
        updateScoreDisplay();
    }
}



//Custom Seed functions
// Add a hash function to convert a string seed to a number
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// Keep track of recently completed lines to avoid re-animating them
let recentlyCompletedLines = [];

// Handle custom seed submission
function handleCustomSeedSubmit() {
    const seedInput = document.getElementById('custom-seed-input');
    const seedValue = seedInput.value.trim();
    
    if (seedValue !== '') {
        const oldSeed = customSeed; // Store old seed for comparison
        customSeed = seedValue;
        
        console.log("Seed changed from", oldSeed, "to", customSeed); // Debug
        
        // Force regeneration of the grid with new seed by clearing localStorage
        if (oldSeed !== customSeed) {
            console.log("Clearing old data due to seed change"); // Debug
            gameStatuses = {};
            gameScores = {};
            
            // Delete any saved grid data for this seed/size combination
            const saveKey = `bingleGameData-${customSeed}-${gridSize}`;
            localStorage.removeItem(saveKey);
        }
        
        // Generate new grid with custom seed
        generateDailyGrid();
        updateScoreDisplay();
        
        // Reset rerolls based on the new seed and grid size
        resetRerollsForSeed(customSeed);
        
        // Hide the custom seed panel after submission
        document.getElementById('custom-seed-panel').classList.remove('expanded');
    }
}

// Initialize the custom seed input with 'daily' by default
function initializeCustomSeedInput() {
    const seedInput = document.getElementById('custom-seed-input');
    if (seedInput) {
        seedInput.value = 'daily';
    }
}

// Toggle the custom seed panel visibility
function toggleCustomSeedPanel() {
    const panel = document.getElementById('custom-seed-panel');
    panel.classList.toggle('expanded');
}

// Determine if the current seed is the daily seed
function isDailySeed(seed) {
    return !seed || seed.toLowerCase() === 'daily';
}


//Rerolls

function resetRerollsForSeed(seed) {
    // Generate a unique key for this seed and grid size combination
    const storageKey = `${seed || 'daily'}-${gridSize}`;
    
    console.log("Resetting rerolls for grid size:", gridSize);
    
    // Set rerolls based on grid size
    switch(parseInt(gridSize)) {
        case 3: rerollsRemaining = 1; break;
        case 4: rerollsRemaining = 2; break;
        case 5: rerollsRemaining = 3; break;
        default: rerollsRemaining = 1;
    }
    
    console.log("Rerolls set to:", rerollsRemaining);
    
    // Save reroll data with the current seed and grid size
    const today = new Date().toDateString();
    const saveKey = `bingleRerollData-${customSeed}-${gridSize}`;
    localStorage.setItem(saveKey, JSON.stringify({
        rerollsRemaining,
        lastRerollDate: today,
        seed: seed,
        gridSize: gridSize
    }));
    
    // Update reroll button state
    updateRerollButton();
}

// Check and reset rerolls
function checkAndResetRerolls() {
    const today = new Date().toDateString();
    
    // Generate a unique key for this seed and grid size combination
    const storageKey = `${customSeed || 'daily'}-${gridSize}`;
    
    // Load reroll data from localStorage
    const saveKey = `bingleRerollData-${customSeed}-${gridSize}`;
    const savedRerollData = localStorage.getItem(saveKey);
    if (savedRerollData) {
        const rerollData = JSON.parse(savedRerollData);
        lastRerollDate = rerollData.lastRerollDate;
        
        // Check if the saved data matches the current seed AND grid size
        if (rerollData.seed === customSeed && rerollData.gridSize === gridSize) {
            rerollsRemaining = rerollData.rerollsRemaining || 0;
            console.log("Using existing rerolls for this seed and grid size:", rerollsRemaining);
            
            // Reset if it's a new day
            if (lastRerollDate !== today) {
                console.log("New day, resetting rerolls");
                resetRerollsForSeed(customSeed);
            }
        } else {
            // Different seed or grid size, reset rerolls
            console.log("Different seed or grid size, resetting rerolls");
            resetRerollsForSeed(customSeed);
        }
    } else {
        // Initialize reroll data based on grid size
        console.log("No saved reroll data, initializing");
        resetRerollsForSeed(customSeed);
    }
    
    // Update reroll button state
    updateRerollButton();
}

// Update reroll button state
function updateRerollButton() {
    const rerollButton = document.getElementById('reroll-button');
    if (rerollButton) {
        rerollButton.disabled = rerollsRemaining <= 0;
        rerollButton.textContent = `Reroll Square (${rerollsRemaining} remaining)`;
    }
}

// Activate reroll mode
function activateRerollMode() {
    if (rerollsRemaining <= 0) {
        // Exit immediately if no rerolls are available
        return;
    }
    
    // First cancel any existing reroll mode to clear event listeners
    cancelRerollMode();
    
    // Add reroll-mode class to body to change cursor
    document.body.classList.add('reroll-mode');
    
    // Add event listeners to grid cells for reroll selection
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.addEventListener('click', handleRerollSelection);
        cell.classList.add('reroll-selectable');
    });
    
    // Update instructions
    const rerollButton = document.getElementById('reroll-button');
    rerollButton.textContent = 'Click a game to reroll or Cancel';
    
    // Important: Remove old event listener before adding new one
    rerollButton.removeEventListener('click', activateRerollMode);
    rerollButton.addEventListener('click', cancelRerollMode);
}

// Cancel reroll mode
function cancelRerollMode() {
    document.body.classList.remove('reroll-mode');
    
    // Remove event listeners
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.removeEventListener('click', handleRerollSelection);
        cell.classList.remove('reroll-selectable');
    });
    
    // Reset reroll button
    const rerollButton = document.getElementById('reroll-button');
    rerollButton.textContent = `Reroll Square (${rerollsRemaining} remaining)`;
    
    // Important: Remove old event listener before adding new one
    rerollButton.removeEventListener('click', cancelRerollMode);
    rerollButton.addEventListener('click', activateRerollMode);
}


// Handle reroll selection
// Fix for the reroll functionality
function handleRerollSelection(event) {
    // Stop click event from opening the game URL
    event.preventDefault();
    event.stopPropagation();
    
    // Get the selected game
    const cell = event.currentTarget;
    const gameId = parseInt(cell.dataset.gameId);
    const gameIndex = currentGrid.findIndex(game => game.id === gameId);
    
    if (gameIndex !== -1) {
        // Get games not currently in the grid
        const availableGames = gamesList.filter(game => 
            !currentGrid.some(currentGame => currentGame.id === game.id)
        );
        
        if (availableGames.length > 0) {
            // Create seeded random generator
            const today = new Date();
            const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate() + gameId * 7919;
            const seededRandom = function() {
                let currentSeed = seed;
                return function() {
                    currentSeed = (currentSeed * 9301 + 49297) % 233280;
                    return currentSeed / 233280;
                };
            }();
            
            // Select a random game
            const randomIndex = Math.floor(seededRandom() * availableGames.length);
            const newGame = availableGames[randomIndex];
            
            // Store the difficulty of the old game
            const oldDifficulty = difficultyAssignments[gameId];
            
            // Replace the game in the grid
            currentGrid[gameIndex] = newGame;
            
            // Reset status for old game
            delete gameStatuses[gameId];
            delete gameScores[gameId];
            
            // Copy the difficulty assignment to the new game
            difficultyAssignments[newGame.id] = oldDifficulty;
            
            // Add status for new game
            if (!gameStatuses[newGame.id]) {
                gameStatuses[newGame.id] = 'unattempted';
            }
            if (!gameScores[newGame.id] && gameScores[newGame.id] !== 0) {
                gameScores[newGame.id] = null;
            }
            
            // Update reroll count and date
            rerollsRemaining--;
            lastRerollDate = new Date().toDateString();
            
            // Save reroll data with the current seed and grid size
            const saveKey = `bingleRerollData-${customSeed}-${gridSize}`;
            localStorage.setItem(saveKey , JSON.stringify({
                rerollsRemaining,
                lastRerollDate,
                seed: customSeed,
                gridSize: gridSize
            }));
            
            // Exit reroll mode before regenerating grid
            cancelRerollMode();
            
            // Regenerate grid display
            renderGrid();
            
            // Add animation to the rerolled cell
            setTimeout(() => {
                const newCell = document.querySelector(`.grid-cell[data-game-id="${newGame.id}"]`);
                if (newCell) {
                    newCell.classList.add('rerolled');
                    setTimeout(() => newCell.classList.remove('rerolled'), 1000);
                }
            }, 100);
        }
    }
}

function renderGrid() {
    // Clear the current grid
    gameGrid.innerHTML = '';
    
    // Create grid layout CSS
    gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    // Create grid cells using existing currentGrid data
    currentGrid.forEach(game => {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.gameId = game.id;
        
        // Add difficulty class for styling
        cell.classList.add(`difficulty-${difficultyAssignments[game.id]}`);
        
        const title = document.createElement('h3');
        title.className = 'game-title';
        title.textContent = game.name;
        
        const difficultyBadge = document.createElement('div');
        difficultyBadge.className = `difficulty-badge ${difficultyAssignments[game.id]}`;
        difficultyBadge.textContent = difficultyAssignments[game.id].charAt(0).toUpperCase() + difficultyAssignments[game.id].slice(1);
        
        const link = document.createElement('a');
        link.className = 'game-link';
        link.href = game.url;
        link.target = '_blank';
        link.textContent = 'Play Game';
        
        // Parse scoring info
        const { type, maxValue } = parseScoringString(game.scoring);
        const par = getParValue(game, difficultyAssignments[game.id]);
        
        // Create scoring info display
        const scoringInfo = document.createElement('div');
        scoringInfo.className = 'scoring-info';
        
        let scoringTypeText = '';
        switch(type) {
            case 'guesses': scoringTypeText = `Guesses (Par: ${par}, Max: ${maxValue})`; break;
            case 'points': scoringTypeText = `Points (Par: ${par}, Max: ${maxValue})`; break;
            case 'mistakes': scoringTypeText = `Mistakes (Par: ${par}, Max: ${maxValue})`; break;
            case 'hints': scoringTypeText = `Hints (Par: ${par}, Max: ${maxValue})`; break;
            default: scoringTypeText = 'Score'; break;
        }
        
        scoringInfo.textContent = scoringTypeText;
        
        // Create input container
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';
        
        // Create score input
        const scoreInput = document.createElement('input');
        scoreInput.type = 'number';
        scoreInput.min = type === 'points' ? '0' : '0';
        scoreInput.max = maxValue.toString();
        scoreInput.className = 'score-input';
        scoreInput.placeholder = type === 'points' ? 'Points' : type === 'guesses' ? 'Guesses' : type === 'mistakes' ? 'Mistakes' : 'Hints';
        scoreInput.value = gameScores[game.id] !== null && gameScores[game.id] !== undefined && gameScores[game.id] !== -1 ? gameScores[game.id] : '';
        
        // Add input event listener
        scoreInput.addEventListener('input', () => {
            let value = scoreInput.value.trim();
            const oldStatus = gameStatuses[game.id];
            
            if (value === '') {
                gameScores[game.id] = null;
                gameStatuses[game.id] = 'unattempted';
            } else {
                value = parseInt(value, 10);
                
                if (isNaN(value)) {
                    scoreInput.value = '';
                    gameScores[game.id] = null;
                    gameStatuses[game.id] = 'unattempted';
                } else {
                    gameScores[game.id] = value;
                    gameStatuses[game.id] = evaluateScore(game, value);
                }
            }
            
            // Update cell styling based on score
            updateCellStyle(cell, game);
            
            // Update overall score
            saveProgress();
            updateScoreDisplay();
            
            // Check for newly completed lines (only if status improved)
            const newStatus = gameStatuses[game.id];
            if (isStatusImprovement(oldStatus, newStatus)) {
                // Clear previously recorded recently completed lines
                recentlyCompletedLines = [];
                
                // Check for newly completed lines
                const completedLines = checkForCompletedLines();
                
                // Animate only newly completed lines
                if (completedLines.length > 0) {
                    animateCompletedLines(completedLines);
                    
                    // Record these lines as recently completed
                    recentlyCompletedLines = completedLines;
                }
            }
        });
        
        // Create incomplete button
        const incompleteBtn = document.createElement('button');
        incompleteBtn.className = 'incomplete-btn';
        incompleteBtn.textContent = 'Mark Failed';
        incompleteBtn.addEventListener('click', () => {
            const oldStatus = gameStatuses[game.id];
            
            gameScores[game.id] = -1;
            gameStatuses[game.id] = 'incomplete';
            scoreInput.value = '';
            scoreInput.disabled = true;
            
            // Update cell styling
            updateCellStyle(cell, game);
            
            // Update overall score
            saveProgress();
            updateScoreDisplay();
            
            // No need to check for completed lines when marking as incomplete
        });
        
        // Create reset button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'reset-btn';
        resetBtn.textContent = 'Reset';
        resetBtn.addEventListener('click', () => {
            gameScores[game.id] = null;
            gameStatuses[game.id] = 'unattempted';
            scoreInput.value = '';
            scoreInput.disabled = false;
            
            // Update cell styling
            updateCellStyle(cell, game);
            
            // Update overall score
            saveProgress();
            updateScoreDisplay();
            
            // No need to check for completed lines when resetting
        });
        
        // Add elements to input container
        inputContainer.appendChild(scoreInput);
        inputContainer.appendChild(incompleteBtn);
        inputContainer.appendChild(resetBtn);
        
        // Assemble cell
        cell.appendChild(title);
        cell.appendChild(difficultyBadge);
        cell.appendChild(link);
        cell.appendChild(scoringInfo);
        cell.appendChild(inputContainer);
        
        gameGrid.appendChild(cell);
        
        // Set initial cell styling
        updateCellStyle(cell, game);
    });
    
    // Save the current grid to localStorage
    saveProgress();
    updateScoreDisplay();
}


//Animate completion
function checkAndAnimateCompletedLines() {
    // Get the completed lines
    const completedLines = checkForCompletedLines();
    
    // Animate them if they haven't been animated recently
    if (completedLines.length > 0) {
        animateCompletedLines(completedLines);
    }
    
    return completedLines;
}

// Function to determine if a status change is an improvement
function isStatusImprovement(oldStatus, newStatus) {
    const statusRank = {
        'unattempted': 0,
        'incomplete': 1,
        'abovePar': 2,
        'belowPar': 3,
        'flawless': 4
    };
    
    return statusRank[newStatus] > statusRank[oldStatus];
}

// Check for completed lines without animating
function checkForCompletedLines() {
    const totalRows = gridSize;
    const completedLines = [];
    
    // Check rows
    for (let row = 0; row < totalRows; row++) {
        let allComplete = true;
        const cellsInRow = [];
        
        for (let col = 0; col < gridSize; col++) {
            const index = row * gridSize + col;
            if (index >= currentGrid.length) continue;
            
            const gameId = currentGrid[index].id;
            const status = gameStatuses[gameId];
            
            if (status === 'unattempted' || status === 'incomplete') {
                allComplete = false;
                break;
            }
            
            const cell = document.querySelector(`.grid-cell[data-game-id="${gameId}"]`);
            if (cell) cellsInRow.push(cell);
        }
        
        if (allComplete && cellsInRow.length > 0) {
            // Check if this line was already completed and recorded
            const lineKey = `row-${row}`;
            if (!isLineAlreadyCompleted(lineKey)) {
                completedLines.push({
                    type: 'row',
                    index: row,
                    key: lineKey,
                    cells: cellsInRow
                });
            }
        }
    }
    
    // Check columns
    for (let col = 0; col < gridSize; col++) {
        let allComplete = true;
        const cellsInCol = [];
        
        for (let row = 0; row < totalRows; row++) {
            const index = row * gridSize + col;
            if (index >= currentGrid.length) continue;
            
            const gameId = currentGrid[index].id;
            const status = gameStatuses[gameId];
            
            if (status === 'unattempted' || status === 'incomplete') {
                allComplete = false;
                break;
            }
            
            const cell = document.querySelector(`.grid-cell[data-game-id="${gameId}"]`);
            if (cell) cellsInCol.push(cell);
        }
        
        if (allComplete && cellsInCol.length > 0) {
            // Check if this line was already completed and recorded
            const lineKey = `col-${col}`;
            if (!isLineAlreadyCompleted(lineKey)) {
                completedLines.push({
                    type: 'column',
                    index: col,
                    key: lineKey,
                    cells: cellsInCol.sort((a, b) => {
                        // Sort cells from top to bottom for column animation
                        const indexA = Array.from(gameGrid.children).indexOf(a);
                        const indexB = Array.from(gameGrid.children).indexOf(b);
                        return indexA - indexB;
                    })
                });
            }
        }
    }
    
    // Check diagonals (only if grid is square)
    if (gridSize === totalRows) {
        // Main diagonal (top-left to bottom-right)
        let mainDiagonalComplete = true;
        const cellsInMainDiag = [];
        
        for (let i = 0; i < gridSize; i++) {
            const index = i * gridSize + i;
            if (index >= currentGrid.length) continue;
            
            const gameId = currentGrid[index].id;
            const status = gameStatuses[gameId];
            
            if (status === 'unattempted' || status === 'incomplete') {
                mainDiagonalComplete = false;
                break;
            }
            
            const cell = document.querySelector(`.grid-cell[data-game-id="${gameId}"]`);
            if (cell) cellsInMainDiag.push(cell);
        }
        
        if (mainDiagonalComplete && cellsInMainDiag.length > 0) {
            // Check if this line was already completed and recorded
            const lineKey = 'diag-main';
            if (!isLineAlreadyCompleted(lineKey)) {
                completedLines.push({
                    type: 'diagonal',
                    index: 'main',
                    key: lineKey,
                    cells: cellsInMainDiag
                });
            }
        }
        
        // Other diagonal (top-right to bottom-left)
        let otherDiagonalComplete = true;
        const cellsInOtherDiag = [];
        
        for (let i = 0; i < gridSize; i++) {
            const index = i * gridSize + (gridSize - 1 - i);
            if (index >= currentGrid.length) continue;
            
            const gameId = currentGrid[index].id;
            const status = gameStatuses[gameId];
            
            if (status === 'unattempted' || status === 'incomplete') {
                otherDiagonalComplete = false;
                break;
            }
            
            const cell = document.querySelector(`.grid-cell[data-game-id="${gameId}"]`);
            if (cell) cellsInOtherDiag.push(cell);
        }
        
        if (otherDiagonalComplete && cellsInOtherDiag.length > 0) {
            // Check if this line was already completed and recorded
            const lineKey = 'diag-other';
            if (!isLineAlreadyCompleted(lineKey)) {
                completedLines.push({
                    type: 'diagonal',
                    index: 'other',
                    key: lineKey,
                    cells: cellsInOtherDiag
                });
            }
        }
    }
    
    return completedLines;
}

// Check if a line is already recorded as completed
function isLineAlreadyCompleted(lineKey) {
    return recentlyCompletedLines.some(line => line.key === lineKey);
}

// Animate completed lines
function animateCompletedLines(completedLines) {
    completedLines.forEach(line => {
        const cells = line.cells;
        
        // Add line-completed class for CSS animation
        cells.forEach((cell, i) => {
            // Delay each cell's animation slightly for wave effect
            setTimeout(() => {
                cell.classList.add('line-completed');
                
                // Remove class after animation completes
                setTimeout(() => {
                    cell.classList.remove('line-completed');
                }, 600);
            }, i * 100);
        });
    });
}


// Timer variables
let timerInterval = null;
let startTime = 0;
let elapsedTime = 0;
let timerRunning = false;

// Initialize timer functionality
function initializeTimer() {
    // Get timer elements
    const timerDisplay = document.getElementById('timer-display');
    const startTimerButton = document.getElementById('start-timer');
    const pauseTimerButton = document.getElementById('pause-timer');
    const resetTimerButton = document.getElementById('reset-timer');
    
    // Add event listeners
    startTimerButton.addEventListener('click', startTimer);
    pauseTimerButton.addEventListener('click', pauseTimer);
    resetTimerButton.addEventListener('click', resetTimer);
    
    // Initialize timer display
    updateTimerDisplay();
    
    // Check if we have a saved timer state
    loadTimerState();
}

// Format time as MM:SS or HH:MM:SS
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10); // Get hundredths of seconds
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
}

// Update timer display
function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(elapsedTime);
    }
}

// Start the timer
function startTimer() {
    if (!timerRunning) {
        timerRunning = true;
        startTime = Date.now() - elapsedTime;
        
        // Update timer interval to be faster for ms display
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            updateTimerDisplay();
        }, 10); // Update every 10ms for smoother ms display
        
        // Update UI
        const startButton = document.getElementById('start-timer');
        const pauseButton = document.getElementById('pause-timer');
        if (startButton) startButton.style.display = 'none';
        if (pauseButton) pauseButton.style.display = 'inline-block';
        
        // Save timer state
        saveTimerState();
    }
}

// Pause the timer
function pauseTimer() {
    if (timerRunning) {
        timerRunning = false;
        clearInterval(timerInterval);
        
        // Update UI
        document.getElementById('start-timer').style.display = 'inline-block';
        document.getElementById('pause-timer').style.display = 'none';
        
        // Save timer state
        saveTimerState();
    }
}

// Reset the timer
function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    elapsedTime = 0;
    updateTimerDisplay();
    
    // Update UI
    document.getElementById('start-timer').style.display = 'inline-block';
    document.getElementById('pause-timer').style.display = 'none';
    
    // Save timer state
    saveTimerState();
}

// Save timer state to localStorage
function saveTimerState() {
    const saveKey = `bingleTimerState-${customSeed}-${gridSize}`;
    const timerState = {
        elapsedTime,
        timerRunning,
        lastSaved: Date.now()
    };
    
    localStorage.setItem(saveKey, JSON.stringify(timerState));
}

// Load timer state from localStorage
function loadTimerState() {
    const saveKey = `bingleTimerState-${customSeed}-${gridSize}`;
    const savedState = localStorage.getItem(saveKey);
    
    if (savedState) {
        const state = JSON.parse(savedState);
        
        // Check if timer state is from today
        const savedDate = new Date(state.lastSaved);
        const today = new Date();
        
        if (savedDate.toDateString() === today.toDateString() &&
            state.elapsedTime !== undefined) {
            
            elapsedTime = state.elapsedTime;
            
            // If timer was running when saved, restart it
            if (state.timerRunning) {
                startTimer();
            } else {
                updateTimerDisplay();
            }
        } else {
            // It's a new day, reset timer
            resetTimer();
        }
    }
}


// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initializeGame);