var svgdoc = null;                          // SVG root document node
var turn;
var boardHeight = 6;
var boardWidth = 7;
var gameBoard;
var cellSize = 40;
var counters;
var fourInARowLine;
var minimaxDepth = 4;
var MAXIMISINGPLAYER = 1;
var MINIMISINGPLAYER = -1;
var human = MAXIMISINGPLAYER;
var computerOne = MINIMISINGPLAYER;
var computerTwo = MAXIMISINGPLAYER;
var gameOver = false;

//loaded by the SVG document
function load(evt)
{	
    //assign the SVG root node to the global variable
    svgdoc = evt.target.ownerDocument;
	//fill the guide with data
	setUp();
}

function setUp()
{	
	turn = human;
	gameBoard = new Array(boardWidth);
	counters = new Array(boardWidth);
	for (var i = 0; i < boardWidth; i++)
	{
		gameBoard[i] = new Array(boardHeight);
		counters[i] = new Array(boardHeight);
		for(var j = 0; j < boardHeight; j++)
		{
			gameBoard[i][j] = 0
			counters[i][j] = null;
		}
	}
	var boardRect = svgdoc.getElementById("board")
	boardRect.setAttribute("height", boardHeight*cellSize);
	boardRect.setAttribute("width", boardWidth*cellSize);
	var node = svgdoc.getElementById("main");
	for(var i = 0; i < boardWidth; i++)
	{
		for(var j = 0; j < boardHeight; j++)
		{
			var cell = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
			cell.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#cell");
			cell.setAttribute("x",cellSize*i);
			cell.setAttribute("y",cellSize*j);
			cell.setAttribute('onclick','click(this)');
			node.appendChild(cell);
		}
	}
}

function click(node)
{	
	if (gameOver) 
	{
		return;
	}
	//var computerMove = getComputerMove(turn);
	//move(computerMove);
	
	var x = node.getAttribute("x");
	// If human was able to move and their move didn't end the game, the computer can play their move
	if (move(x/cellSize) && !gameOver)
	{
		var computerMove = getComputerMove(turn);
		move(computerMove);
	}
}

function move(column)
{
	var main = svgdoc.getElementById("main");
	var x = column;	
	var y = nextFree(x, gameBoard);	
	if(y != -1)
	{
		gameBoard[x][y] = turn;		
		var counter = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
		if(turn == 1)
		{
			counter.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#counter1");
		}
		else
		{
			counter.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#counter2");
		}
		turn = -turn;
		counter.setAttribute("x",x*cellSize);
		counter.setAttribute("y",y*cellSize);
		main.appendChild(counter);
        counters[x][y] = counter;
        var line = isLine(x,y,gameBoard);
        if(line != 0 && fourInARowLine != null)
        {
                while (fourInARowLine.length>0)
                {
                        lineX = fourInARowLine[0].pop();
                        lineY = fourInARowLine[1].pop();
                        if(lineX == null || lineY == null)
                        {
                                break;
                        }
                        var lineCounter = counters[lineX][lineY];
                        lineCounter.setAttribute("fill", "#996699");
                }
                gameOver = true;
                var winnerString = (turn == 1) ? "computerOne" : "human";
                alert(winnerString + " WINS!");
        }
		return true;
	}
	return false;
}

function getComputerMove(currentComputer)
{
	var possibleWinningMoveForComputer = getWinningMove(currentComputer);
	var possibleWinningMoveForOtherPlayer = getWinningMove(-currentComputer);
	if (possibleWinningMoveForComputer != -1)
	{
		//return possibleWinningMoveForComputer;
	}
	if (possibleWinningMoveForOtherPlayer != -1)
	{
		//return possibleWinningMoveForOtherPlayer;
	}
	return alphabeta(currentComputer, gameBoard, minimaxDepth, -1000, 1000).move;
} 

function getWinningMove(player)
{
	for(var x = 0; x < boardWidth; x++)
	{
		var y = nextFree(x, gameBoard);
		if (y == -1)
		{
			continue;
		}
		var possibleWinningState = clone2DArray(gameBoard);
		possibleWinningState[x][y] = player;
		if(isLine(x, y, possibleWinningState) == player)
		{			
			return x;
		}
	}
	return -1;
}

function nextFree(x, board)
{
	for(var y = boardHeight -1; y >= 0; y--)
	{
		if(board[x][y] == 0)
		{
			return y;
		}
	}
	return -1;
}

function isLine(x,y,board)
{
        var winner = 0;
        var pos = new Array(new Array(),new Array());
        //horizontal
        for(var i = 0; i < boardWidth; i++)
        {
                var piece = board[i][y];
                if(piece != winner)
                {
                        winner = piece;
                        pos[0] = new Array();
                        pos[1] = new Array();
                }
                pos[0].push(i);
                pos[1].push(y);
                if(pos[0].length >= 4 && winner != 0)
                {
                		fourInARowLine = pos;
                    	return board[pos[0][0]][pos[1][0]];
                }
        }
        winner = 0;
        //vertical
        for(var j = 0; j < boardWidth; j++)
        {
                var piece = board[x][j];
                if(piece != winner)
                {
                        winner = piece;
                        pos[0] = new Array();
                        pos[1] = new Array();
                }
                pos[0].push(x);
                pos[1].push(j);
                if(pos[0].length >= 4 && winner != 0)
                {
                		fourInARowLine = pos;
                        return board[pos[0][0]][pos[1][0]];
                }
        }
        winner = 0;
        //diag right and down
        var val = Math.min(x,y);
        var i = x - val;
        var j = y - val;
        while(i < boardWidth && j < boardHeight)
        {
                var piece = board[i][j];
                if(piece != winner)
                {
                        winner = piece;
                        pos[0] = new Array();
                        pos[1] = new Array();
                }
                pos[0].push(i);
                pos[1].push(j);
                if(pos[0].length >= 4 && winner != 0)
                {
                		fourInARowLine = pos;
                        return board[pos[0][0]][pos[1][0]];
                }
                i++;
                j++;
        }
        winner = 0;
        //diag left and down
        val = Math.min((boardWidth-(x+1)),y)
        i = x + val;
        j = y - val;
        while(i >= 0 && j < boardHeight)
        {
                var piece = board[i][j];
                if(piece != winner)
                {
                        winner = piece;
                        pos[0] = new Array();
                        pos[1] = new Array();
                }
                pos[0].push(i);
                pos[1].push(j);
                if(pos[0].length >= 4 && winner != 0)
                {
                		fourInARowLine = pos;
                        return board[pos[0][0]][pos[1][0]];
                }
                i--;
                j++;
        }
        return 0;
}

function isBoardFull(board)
{
	for (var i = 0; i < boardWidth; i++)
	{
		if (nextFree(i, board) != -1)
		{
			return false;
		}
	}
	return true;
}

function isGameOver(board)
{
	if (isBoardFull(board))
	{
		return true;
	}

	for(var x = 0; x < boardWidth; x++)
	{
		var y = nextFree(x, gameBoard);
		if (y < boardHeight - 1)
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
function threeInARowHeuristic(state, turn)
{
    var humanThreeInARows = 0;
    var machineThreeInARows = 0;
    for (var i = 0; i < boardWidth; i++)
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

        // State is a guaranteed human victory - minimum utility
        if (isLine(i, topCounterIndex, state) == MINIMISINGPLAYER) 
        {
            return -100;
        }

        // State is a guaranteed machine victory - maximum utility
        if (isLine(i, topCounterIndex, state) == MAXIMISINGPLAYER) 
        {
            return 100;
        }

        if (state[i][y] == 0)
        {
            state[i][y] = MINIMISINGPLAYER; // yellow/human
            if (isLine(i, y, state) == MINIMISINGPLAYER)
            {
                humanThreeInARows++;
            }
            state[i][y] = MAXIMISINGPLAYER; // red/computerOne
            if (isLine(i, y, state) == MAXIMISINGPLAYER)
            {
                machineThreeInARows++;
            }
            state[i][y] = 0;
        }
    }

    if (turn == MAXIMISINGPLAYER)
    {
        if (machineThreeInARows >= 1)
        {
            return 100;
        }
        if (humanThreeInARows >= 2)
        {
            return -100;
        }
    }
    else
    {
        if (humanThreeInARows >= 1)
        {
            return -100;
        }
        if (machineThreeInARows >= 2)
        {
            return 100;
        }
    }
    return machineThreeInARows - humanThreeInARows;
}

function alphabeta(turn, boardInstance, depth, alpha, beta)
{
	if (depth == 0 || isGameOver(boardInstance))
	{
		return {heuristic: threeInARowHeuristic(boardInstance, turn)};
	}

	var bestMove = -1;
	var moveHeuristicPairs = new Array();
	var heuristics = new Array();

	for (var i = 0; i < boardWidth; i++)
	{
		var y = nextFree(i, boardInstance);
		if (y == -1)
		{
			continue;
		}
		var boardInstanceClone = clone2DArray(boardInstance)
		boardInstanceClone[i][y] = turn;
		var moveHeuristicPair = alphabeta(-turn, boardInstanceClone, depth - 1, alpha, beta);
		if (turn == MAXIMISINGPLAYER) 
		{
			if (moveHeuristicPair.heuristic > alpha)
			{
				bestMove = i;
				alpha = moveHeuristicPair.heuristic;
			}		
		}
		else
		{
			if (moveHeuristicPair.heuristic < beta)
			{
				bestMove = i;
				beta = moveHeuristicPair.heuristic;
			}
		}
		moveHeuristicPairs.push({heuristic: moveHeuristicPair.heuristic, move: i});
		heuristics.push(moveHeuristicPair.heuristic);
		if (beta <= alpha)
		{
			break;
		}
	}	

	var bestMoves = getBestMoves(moveHeuristicPairs, turn);
	if (bestMoves.length > 1)
	{
		var randomIndex = Math.round(Math.random() * (bestMoves.length - 1));
		//bestMove = bestMoves[randomIndex]; 
	}

	if (depth == minimaxDepth)
	{
		var temp = 5;
	}

	var heuristicValue = (turn == MAXIMISINGPLAYER) ? alpha : beta;
	return {heuristic: heuristicValue, move: bestMove};
}

function getBestMoves(moveHeuristicPairs, turn)
{
	var bestMoves = new Array();
	if (turn == MAXIMISINGPLAYER)
	{
		var largestHeuristic = -1000;
		for (var i = 0; i < moveHeuristicPairs.length; i++)
		{
			if (moveHeuristicPairs[i].heuristic > largestHeuristic)
			{
				bestMoves = new Array();
				largestHeuristic = moveHeuristicPairs[i].heuristic;
			}
			if (moveHeuristicPairs[i].heuristic == largestHeuristic)
			{
				bestMoves.push(moveHeuristicPairs[i].move);
			}
		}
	}
	else
	{
		var smallestHeuristic = 1000;
		for (var i = 0; i < moveHeuristicPairs.length; i++)
		{
			if (moveHeuristicPairs[i].heuristic < smallestHeuristic)
			{
				bestMoves = new Array();
				smallestHeuristic = moveHeuristicPairs[i].heuristic;
			}
			if (moveHeuristicPairs[i].heuristic == smallestHeuristic)
			{
				bestMoves.push(moveHeuristicPairs[i].move);
			}
		}
	}
	return bestMoves;
}

function clone2DArray(array)
{
	var newArray = [];

	for (var i = 0; i < array.length; i++)
	{
	    newArray[i] = array[i].slice(0);
    }
    return newArray;
}

