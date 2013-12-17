var svgdoc = null;                          // SVG root document node
var turn;
var boardSize = 8;
var gameBoard;
var cellSize = 40;
var counters;
var fourInARowLine;
var minimaxDepth = 5;
var HUMAN = 1;
var COMPUTER = -1;
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
	turn = HUMAN;
	gameBoard = new Array(boardSize);
	counters = new Array(boardSize);
	for (var i = 0; i < boardSize; i++)
	{
		gameBoard[i] = new Array(boardSize);
		counters[i] = new Array(boardSize);
		for(var j = 0; j < boardSize; j++)
		{
			gameBoard[i][j] = 0
			counters[i][j] = null;
		}
	}
	var boardRect = svgdoc.getElementById("board")
	boardRect.setAttribute("height", boardSize*cellSize);
	boardRect.setAttribute("width", boardSize*cellSize);
	var node = svgdoc.getElementById("main");
	for(var i = 0; i < boardSize; i++)
	{
		for(var j = 0; j < boardSize; j++)
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
	var x = node.getAttribute("x");
	// If human was able to move and their move didn't end the game, the computer can play their move
	if (move(x/cellSize) && !gameOver)
	{
		var computerMove = getComputerMove();
		move(computerMove);
	}
}

function move(row)
{
	var main = svgdoc.getElementById("main");
	var x = row;	
	var y = nextFree(x, gameBoard);	
	if(y != -1)
	{
		gameBoard[x][y] = turn;		
		var counter = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
		if(turn == HUMAN)
		{
			counter.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#counter1");
			turn = COMPUTER;
		}
		else
		{
			counter.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#counter2");
			turn = HUMAN;
		}
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
                var winnerString = (turn == 1) ? "COMPUTER" : "HUMAN";
                alert(winnerString + " WINS!");
        }
		return true;
	}
	return false;
}

function getComputerMove()
{
	var possibleWinningMoveForComputer = getWinningMove(COMPUTER);
	var possibleWinningMoveForHuman = getWinningMove(HUMAN);
	if (possibleWinningMoveForComputer != -1)
	{
		return possibleWinningMoveForComputer;
	}
	if (possibleWinningMoveForHuman != -1)
	{
		return possibleWinningMoveForHuman;
	}
	return alphabeta(COMPUTER, gameBoard, minimaxDepth, -1000, 1000).move;
} 

function getWinningMove(player)
{
	for(var x = 0; x < boardSize; x++)
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
	for(var y = boardSize -1; y >= 0; y--)
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
        for(var i = 0; i < boardSize; i++)
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
        for(var j = 0; j < boardSize; j++)
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
        while(i < boardSize && j < boardSize)
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
        val = Math.min((boardSize-(x+1)),y)
        i = x + val;
        j = y - val;
        while(i >= 0 && j < boardSize)
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
	for (var i = 0; i < boardSize; i++)
	{
		if (nextFree(i, board) != -1)
		{
			return false;
		}
	}
	return true;
}

// A red three-in-a-row is defined as an empty position on the board that would win the game
// for red if a red counter were to be placed there. The more of these, the higher the heuristic 
// value. Yellow three-in-a-rows are subtracted. Return maximum or minimum utility if the 
// state is a victory state.
function threeInARowHeuristic(state, turn)
{
	var humanThreeInARows = 0;
	var machineThreeInARows = 0;
	for (var i = 0; i < boardSize; i++)
	{	
		var y = nextFree(i, state);
		if (y == -1)
		{
			continue;
		}
		if (y < 7)
		{
			y++;
		}

		// State is a guaranteed human victory - minimum utility
		if (isLine(i, y, state) == HUMAN) 
		{
			return -100;
		}

		// State is a guaranteed machine victory - maximum utility
		if (isLine(i, y, state) == COMPUTER) 
		{
			return 100;
		}

		if (state[i][y] == 0)
		{
			state[i][y] = HUMAN; // yellow/human
			if (isLine(i, y, state) == HUMAN)
			{
				humanThreeInARows++;
			}
			state[i][y] = COMPUTER; // red/computer
			if (isLine(i, y, state) == COMPUTER)
			{
				machineThreeInARows++;
			}
			state[i][y] = 0;
		}
	}

	if (turn == COMPUTER)
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
	// Eventually need to consider case when board is full

	if (depth == 0 || isBoardFull(boardInstance))
	{
		return {heuristic: threeInARowHeuristic(boardInstance, turn)};
	}

	var bestMove = -1;
	var randomDecisionMade = false;
	for (var i = 0; i < boardSize; i++)
	{
		var y = nextFree(i, boardInstance);
		if (y == -1)
		{
			continue;
		}
		var boardInstanceClone = clone2DArray(boardInstance)
		boardInstanceClone[i][y] = turn;
		var moveHeuristicPair = alphabeta(-turn, boardInstanceClone, depth - 1, alpha, beta);
		if (turn == COMPUTER)
		{
			if (moveHeuristicPair.heuristic > alpha)
			{
				bestMove = i;
				alpha = moveHeuristicPair.heuristic;
			}
			// Makes bot more unpredictable when heuristics are equal
			else if (moveHeuristicPair.heuristic == alpha && !randomDecisionMade && (Math.random() > 0.875 || i == 7)) 
			{
				bestMove = i; 
				randomDecisionMade = true;
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
		if (beta <= alpha)
		{
			break;
		}
	}	

	if (turn == COMPUTER)
	{
		return {heuristic: alpha, move: bestMove};
	}
	return {heuristic: beta, move: bestMove};
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

