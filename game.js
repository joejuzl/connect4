var svgdoc = null;                          // SVG root document node
var turn;
var boardSize = 8;
var gameBoard;
var cellSize = 40;
var counters;
var fourInARowLine;
var minimaxDepth = 2;
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
	turn = 1;
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
		var computerMove = minimax(-1, gameBoard, minimaxDepth).move;
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
		if(turn == 1)
		{
			counter.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#counter1");
			turn = -1;
		}
		else
		{
			counter.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#counter2");
			turn = 1;
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

function compMove()
{
	for(var x = 0; x < boardSize; x++)
	{
		if(isLine(x,nextFree(x, gameBoard), gameBoard) == 2)
		{
			move(x);
			return;
		}
	}
	var rand = parseInt(Math.floor((Math.random()*boardSize)));
	move(rand);
	return;
} 


function nextFree(x, board)
{
	for(var y = boardSize -1; y >= 0; y--)
	{
		if (board[x] == undefined)
		{
			var temp = 5;
		}
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
        count = 0;
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
        count = 0;
        //diag right
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
        count = 0;
        //diag left
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

// A red three-in-a-row is defined as an empty position on the board that would win the game
// for red if a red counter were to be placed there. The more of these, the higher the heuristic 
// value. Yellow three-in-a-rows are subtracted. Return maximum or minimum utility if the 
// state is a victory state.
function threeInARowHeuristic(state)
{
	var threeInARows = 0;
	for (var i = 0; i < boardSize; i++)
	{
		for (var j = 0; j < boardSize; j++)
		{		
			// State is a human victory - minimum utility
			if (isLine(i, j, state) == 1) 
			{
				return -100;
			}

			// State is a machine victory - maximum utility
			if (isLine(i, j, state) == -1) // red/computer
			{
				return 100;
			}

			if (state[i][j] == 0)
			{
				state[i][j] = 1; // yellow/human
				if (isLine(i, j, state) == 1)
				{
					threeInARows--;
				}
				state[i][j] = -1; // red/computer
				if (isLine(i, j, state) == -1)
				{
					threeInARows++;
				}
				state[i][j] = 0;
			}
		}
	}
	return threeInARows;
}

function minimax(turn, boardInstance, depth)
{
	// Eventually need to consider case when board is full

	if (depth == 0)
	{
		return {heuristic: threeInARowHeuristic(boardInstance)};
	}

	var moveHeuristicPairs = new Array();
	for (var i = 0; i < boardSize; i++)
	{
		var y = nextFree(i, boardInstance);
		if (y == -1)
		{
			continue;
		}
		var boardInstanceClone = clone2DArray(boardInstance)
		boardInstanceClone[i][y] = turn;
		var moveHeuristicPair = minimax(-turn, boardInstanceClone, depth - 1);
		moveHeuristicPairs[i] = moveHeuristicPair;
	}

	// If computer's turn, maximise heuristic
	if (turn == -1)
	{
		var max = -1000;
		var bestMove = -1;
		for (var i = 0; i < moveHeuristicPairs.length; i++)
		{
			if (moveHeuristicPairs[i] != undefined && moveHeuristicPairs[i].heuristic > max)
			{
				max = moveHeuristicPairs[i].heuristic;
				bestMove = i;
			}
		}
		return {heuristic: max, move: bestMove};
	}
	// If humans's turn, minimise heuristic
	else
	{
		var min = 1000;
		var bestMove = -1;
		for (var i = 0; i < moveHeuristicPairs.length; i++)
		{
			if (moveHeuristicPairs[i] != undefined && moveHeuristicPairs[i].heuristic < min)
			{
				min = moveHeuristicPairs[i].heuristic;
				bestMove = i;
			}
		}
		return {heuristic: min, move: bestMove};
	}

	return {heuristic: -1000, move: -1};
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