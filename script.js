// Game data with scoring metrics
const gamesList = [
    { id: 1, name: "Wordle", url: "https://www.nytimes.com/games/wordle", scoring: "guesses6"},
    { id: 2, name: "Worldle", url: "https://worldle.teuteuf.fr/", scoring: "guesses6" },
    { id: 3, name: "Flagle", url: "https://www.flagle.io/", scoring: "guesses6" },
    { id: 4, name: "Timeguessr", url: "https://timeguessr.com/roundonedaily", scoring: "points75000"},
    { id: 5, name: "Foodguessr", url: "https://www.foodguessr.com/game/daily", scoring: "mistakes6"},
    { id: 6, name: "Framed", url: "https://framed.wtf/", scoring: "guesses6"},
    { id: 7, name: "Connections", url: "https://www.nytimes.com/games/connections", scoring: "mistakes4"},
    { id: 8, name: "Semantle", url: "https://semantle.com/", scoring: "guesses50"},
    { id: 9, name: "Gamedle Classic", url: "https://www.gamedle.wtf/classic", scoring: "guesses6"},
    { id: 10, name: "Strands", url: "https://www.nytimes.com/games/strands", scoring: "hints3"},
    { id: 11, name: "Flagpath", url: "https://www.flagpath.xyz/", scoring: "mistakes3"},
    { id: 12, name: "Waffle", url: "https://wafflegame.net/", scoring: "guesses15"},
    { id: 13, name: "Hexaguessr", url: "https://samuelcardwell.shinyapps.io/hexaguessr_app/", scoring: "guesses6" },
    { id: 14, name: "Bandle", url: "https://bandle.app/daily", scoring: "guesses6" },
    { id: 15, name: "Globle", url: "https://globle-game.com/game", scoring: "guesses10"},
    { id: 16, name: "Mathle", url: "https://lemononmars.github.io/mathdle/", scoring: "guesses6" },
    { id: 17, name: "Gamedle Art", url: "https://www.gamedle.wtf/artwork", scoring: "guesses6"},
    { id: 18, name: "Colorfle", url: "https://colorfle.com/", scoring: "guesses6"},
    { id: 19, name: "Facedle", url: "https://facedle.app/", scoring: "guesses6"},
    { id: 20, name: "Shaple", url: "https://swag.github.io/shaple/", scoring: "mistakes5"},
    { id: 21, name: "Metazooa", url: "https://metazooa.com/play/game", scoring: "guesses20"},
    { id: 22, name: "Realbirdfakebird", url: "https://realbirdfakebird.com/", scoring: "mistakes7"},
    { id: 23, name: "Lyricle", url: "https://www.lyricle.app/", scoring: "guesses6"},
    { id: 24, name: "Flickle", url: "https://flickle.app/", scoring: "guesses6"},
    { id: 25, name: "Strands", url: "https://www.nytimes.com/games/strands", scoring: "hints5"}
];

// Game configuration
let gridSize = 3;
let currentGrid = [];
let gameStatuses = {};
let gameScores = {};
let difficultyAssignments = {};

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
    // Display current date
    const currentDate = new Date();
    dateDisplay.textContent = currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Load saved progress if exists
    loadProgress();
    
    // Generate grid based on today's date
    generateDailyGrid();
    
    // Event listeners
    // Remove the newGridButton listener since we're removing that button
    gridSizeSelector.addEventListener('change', handleGridSizeChange);
    resetProgressButton.addEventListener('click', resetProgress);
    
    // Update score display
    updateScoreDisplay();
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
function assignDifficulties() {
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
    
    // Shuffle difficulties
    for (let i = difficulties.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
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
    
    // Use date as seed for consistent daily generation
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate() + 1;
    
    // Pseudo-random number generator with seed
    const seededRandom = function() {
        let seed = dateSeed;
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }();
    
    // Shuffle games using seeded random
    const shuffledGames = [...gamesList];
    for (let i = shuffledGames.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [shuffledGames[i], shuffledGames[j]] = [shuffledGames[j], shuffledGames[i]];
    }
    
    // Select games for the grid
    currentGrid = shuffledGames.slice(0, gridSize * gridSize);
    
    // Assign difficulties to games
    assignDifficulties();
    
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

// Handle grid size change
function handleGridSizeChange() {
    gridSize = parseInt(gridSizeSelector.value);
    generateDailyGrid();
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
    
    // Calculate bonus points for completed lines
    const bonusLines = checkForCompletedLines();
    const bonusPoints = calculateBonusPoints();
    const totalScore = totalBaseScore + bonusPoints;
    
    // Update the bonus display
    if (dailyBonusDisplay) {
        if (bonusLines.length > 0) {
            let bonusHtml = '<h3>Bonus Points</h3><ul>';
            bonusLines.forEach(line => {
                bonusHtml += `<li>${line}</li>`;
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
}

// Save progress to localStorage
function saveProgress() {
    const saveData = {
        gridSize: gridSize,
        gameStatuses: gameStatuses,
        gameScores: gameScores,
        difficultyAssignments: difficultyAssignments,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('bingleGameData', JSON.stringify(saveData));
}

// Load progress from localStorage
function loadProgress() {
    const savedData = localStorage.getItem('bingleGameData');
    
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

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initializeGame);