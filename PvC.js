var MINUTILITY = -100;
var MAXUTILITY = 100;
var MAXIMISINGPLAYER = 1;
var MINIMISINGPLAYER = -1;

function AI(boardWidth, boardHeight, gameBoard, name)
{
	this.boardWidth = boardWidth;
	this.boardHeight = boardHeight;
	this.gameBoard = gameBoard;
	this.difficultyEquilibrium = 0;
	this.turn = MINIMISINGPLAYER;
	this.maximisingPlayerBestMovesGrid = [];
	this.minimisingPlayerBestMovesGrid = [];

	this.userModel = new UserModel(name);
	this.userModel.loadFromStorage();
	this.difficulty = this.userModel.difficulty;
	this.updateDifficultyParameters();
	this.initialiseBestMovesGrids();
}

AI.prototype.updateDifficultyParameters = function()
{        
	if (this.difficulty >= 0 && this.difficulty <= 10)
	{
		this.maxChanceOfRandomMove = 0.9 * Math.pow(0.75, this.difficulty);
		this.minimaxDepth = 1;
	}
	else
	{
		this.maxChanceOfRandomMove = 0;
		this.minimaxDepth = this.difficulty - 9;
	}
	this.chanceOfRandomMove = 0;
}

AI.prototype.initialiseBestMovesGrids = function()
{        
        for (var x = 0; x < this.boardWidth; x++)
        {
                this.maximisingPlayerBestMovesGrid[x] = [];
                this.minimisingPlayerBestMovesGrid[x] = [];
                for (var y = 0; y < this.boardHeight; y++)
                {
                        this.maximisingPlayerBestMovesGrid[x][y] = 0;
                        this.minimisingPlayerBestMovesGrid[x][y] = 0;
                }
        }
}

AI.prototype.updateUserModel = function(result)
{
	this.addGameRatingToUserModel(result);
	this.adaptMinimaxDepth();
}

AI.prototype.adaptMinimaxDepth = function()
{
	if (this.userModel.successRating > (this.difficultyEquilibrium + 5))
	{
		this.difficulty = Math.min(this.difficulty + 1, 17);
	}
	else if (this.userModel.successRating < (this.difficultyEquilibrium - 5))
	{
		this.difficulty = Math.max(this.difficulty - 1, 0);
	}
	this.userModel.updateDifficulty(this.difficulty);
	this.updateDifficultyParameters();
}

AI.prototype.addGameRatingToUserModel = function(result)
{
	if (result == 0)
	{
		this.userModel.addGameRating(0);
	}
	var spacesLeft = this.countRemainingSpaces();
	if (result == "Computer")
	{
		this.userModel.addGameRating(-spacesLeft);
	}
	else
	{
		this.userModel.addGameRating(spacesLeft);
	}
}

AI.prototype.countRemainingSpaces = function()
{
	var total = 0;
	for (var x = 0; x < this.boardWidth; x++)
	{
		for (var y = 0; y < this.boardHeight; y++)
		{
			if (this.gameBoard[x][y] == 0)
			{
				total++;
			}
		}
	}
	return total;
}

AI.prototype.getComputerMove = function()
{
	this.chanceOfRandomMove = Math.min(this.chanceOfRandomMove + (this.maxChanceOfRandomMove / 10), this.maxChanceOfRandomMove);
	var randomMove = this.attemptRandomMove();
	if (randomMove != -1)
	{		
		return randomMove;
	}

	var possibleWinningMoveForCurrentPlayer = this.getWinningMove(this.turn, this.gameBoard);
	var possibleWinningMoveForOtherPlayer = this.getWinningMove(-this.turn, this.gameBoard);
	if (possibleWinningMoveForCurrentPlayer != -1)
	{
		return possibleWinningMoveForCurrentPlayer;
	}
	if (possibleWinningMoveForOtherPlayer != -1)
	{
		return possibleWinningMoveForOtherPlayer;
	}
	var alphabetaMove = this.alphabeta(this.turn, this.gameBoard, this.minimaxDepth, -1000, 1000).move;

	var potentiallyBetterMove;
	if (this.isSurrenderingMove(alphabetaMove, this.turn))
	{
		potentiallyBetterMove = this.getNonSurrenderingMove(turn);
		return (potentiallyBetterMove == -1) ? alphabetaMove : potentiallyBetterMove;
	}
	return alphabetaMove;
} 

AI.prototype.attemptRandomMove = function()
{
	if (Math.random() < this.chanceOfRandomMove)
	{
		var possibleMoves = [];
		for(var x = 0; x < this.boardWidth; x++)
		{
			var y = nextFree(x, this.gameBoard);
			if (y != -1)
			{
				possibleMoves.push(x);
			}			
		}
		if (possibleMoves.length == 0)
		{
			return -1;
		}
		var randomIndex = this.getRandomInt(0, possibleMoves.length - 1);
		return possibleMoves[randomIndex];
	}
	return -1;
}

AI.prototype.getRandomInt = function(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

AI.prototype.isSurrenderingMove = function(move, turn)
{
	var tempBoard = clone2DArray(gameBoard);
	var y = nextFree(move, tempBoard);
	if (y == -1)
	{
		return false;
	}
	tempBoard[move][y] = turn;
	return (this.getWinningMove(-turn, tempBoard) != -1);
}

AI.prototype.getNonSurrenderingMove = function(player)
{
	for(var x = 0; x < this.boardWidth; x++)
	{
		var y = nextFree(x, this.gameBoard);
		if (y == -1)
		{
			continue;
		}
		var possibleNonSurrenderingState = clone2DArray(this.gameBoard);
		possibleNonSurrenderingState[x][y] = player;
		if(this.getWinningMove(-this.turn, possibleNonSurrenderingState) == -1)
		{			
			return x;
		}
	}
	return -1;	
}

AI.prototype.getWinningMove = function(player, board)
{
	for(var x = 0; x < this.boardWidth; x++)
	{
		var y = nextFree(x, board);
		if (y == -1)
		{
			continue;
		}
		var possibleWinningState = clone2DArray(board);
		possibleWinningState[x][y] = player;
		if(isLine(x, y, possibleWinningState) == player)
		{			
			return x;
		}
	}
	return -1;
}

AI.prototype.isGameOver = function(board)
{
	if (isBoardFull(board))
	{
		return true;
	}

	for(var x = 0; x < this.boardWidth; x++)
	{
		var y = nextFree(x, board);
		if (y < this.boardHeight - 1)
		{
			y++;
		}

		if(isLine(x, y, board) != 0)
		{			
			return true;
		}
	}
	return false;
}

// A red three-in-a-row is defined as an empty position on the board that would win the game
// for red if a red counter were to be placed there. The more of these, the higher the heuristic 
// value. Yellow three-in-a-rows are subtracted. Return maximum or minimum utility if the 
// state is a victory state.
AI.prototype.threeInARowHeuristic = function(state, turn)
{
    var minThreeInARows = 0;
    var maxThreeInARows = 0;
    for (var i = 0; i < this.boardWidth; i++)
    {        
        var y = nextFree(i, state);
        if (y == -1)
        {
            continue;
        }

        var topCounterIndex = y;
        if (y < boardHeight - 1)
        {
            topCounterIndex++;
        }

        if (isLine(i, topCounterIndex, state) == MINIMISINGPLAYER) 
        {
            return MINUTILITY;
        }

        if (isLine(i, topCounterIndex, state) == MAXIMISINGPLAYER) 
        {
            return MAXUTILITY;
        }

        if (state[i][y] == 0)
        {
            state[i][y] = MINIMISINGPLAYER; 
            if (isLine(i, y, state) == MINIMISINGPLAYER)
            {
                minThreeInARows++;
            }
            state[i][y] = MAXIMISINGPLAYER; 
            if (isLine(i, y, state) == MAXIMISINGPLAYER)
            {
                maxThreeInARows++;
            }
            state[i][y] = 0;
        }
    }

    if (turn == MAXIMISINGPLAYER)
    {
        if (maxThreeInARows >= 1)
        {
            return MAXUTILITY;
        }
        if (minThreeInARows >= 2)
        {
            return MINUTILITY;
        }
    }
    else
    {
        if (minThreeInARows >= 1)
        {
            return MINUTILITY;
        }
        if (maxThreeInARows >= 2)
        {
            return MAXUTILITY;
        }
    }
    return maxThreeInARows - minThreeInARows;
}

AI.prototype.alphabeta = function(turn, boardInstance, depth, alpha, beta)
{
	if (depth == 0 || this.isGameOver(boardInstance))
	{
		return {heuristic: this.threeInARowHeuristic(boardInstance, turn)};
	}

	var bestMove = -1;
	var moveOrder = this.sortBestMoves(boardInstance, turn);
	for (var i = 0; i < this.boardWidth; i++)
	{
		var x = moveOrder[i];
		var y = nextFree(x, boardInstance);
		if (y == -1)
		{
			continue;
		}
		var boardInstanceClone = clone2DArray(boardInstance)
		boardInstanceClone[x][y] = turn;
		var moveHeuristicPair = this.alphabeta(-turn, boardInstanceClone, depth - 1, alpha, beta);
		if (turn == MAXIMISINGPLAYER) 
		{
			if (moveHeuristicPair.heuristic > alpha)
			{
				bestMove = x;
				alpha = moveHeuristicPair.heuristic;
			}		
		}
		else
		{
			if (moveHeuristicPair.heuristic < beta)
			{
				bestMove = x;
				beta = moveHeuristicPair.heuristic;
			}
		}
		if (beta <= alpha)
		{
			break;
		}
	}

	if (bestMove != -1)
	{
		this.updateBestMoves(boardInstance, depth, turn, bestMove);
	}

	var heuristicValue = (turn == MAXIMISINGPLAYER) ? alpha : beta;
	return {heuristic: heuristicValue, move: bestMove};
}

// BORROWED FROM THE INTERNET
AI.prototype.shuffle = function(array) 
{
  var currentIndex = array.length;
  var temporaryValue;
  var randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) 
  {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

AI.prototype.updateBestMoves = function(board, depth, turn, x) 
{
    var y = nextFree(x, board);
    if (turn == MAXIMISINGPLAYER) 
    {
        this.maximisingPlayerBestMovesGrid[x][y] = this.maximisingPlayerBestMovesGrid[x][y] + Math.pow(2, depth);
    } 
    else 
    {
        this.minimisingPlayerBestMovesGrid[x][y] = this.minimisingPlayerBestMovesGrid[x][y] + Math.pow(2, depth);
    }
}

AI.prototype.sortBestMoves = function(board, turn) 
{
    var sortedArray = [];
    var bestMovesGrid = (turn == MAXIMISINGPLAYER) ? clone2DArray(this.maximisingPlayerBestMovesGrid)
    											   : clone2DArray(this.minimisingPlayerBestMovesGrid);
    for (var i = 0; i < this.boardWidth; i++) 
    {
        bestMovesGrid[i] = bestMovesGrid[i][nextFree(i, board)];
        bestMovesGrid[i] = (bestMovesGrid == undefined) ? 0 : bestMovesGrid[i];
    }

    var noBestMove = true;
    for (var i = 0; i < bestMovesGrid.length; i++)
    {
    	if (bestMovesGrid[i] != 0)
    	{
    		noBestMove = false;
    		break;
    	}
    }

    if (noBestMove) 
    {
    	var randomPermutation = [];
	    for (var i = 0; i < this.boardWidth; i++) 
	    {
	        randomPermutation[i] = i;
	    }
        return this.shuffle(randomPermutation);
    }
    
    for (var i = 0; i < this.boardWidth; i++) 
    {
        var maxValue = -1;
        var maxIndex = 0;
        for (var x = 0; x < this.boardWidth; x++) 
        {
            if (bestMovesGrid[x] > maxValue) 
            {
                maxValue = bestMovesGrid[x];
                maxIndex = x;
            }
        }
        sortedArray[i] = maxIndex;
        bestMovesGrid[maxIndex] = -1000;    
    }
    return sortedArray;
}