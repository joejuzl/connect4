// SVG root document node
var svgdoc = null; 
var boardHeight = 6;
var boardWidth = 7;
var gameBoard;
var cellSize = 80;
var boardRect;
var positionCounter;
var fourInARowLine;
var HUMAN = 1;
var COMPUTER = -1;
var playerName1 = "Computer";
var playerName2 = "Human";
var gameOver = false;
var ready = true;
var turn = HUMAN;
var nextMove = -1;
var ai;
var counters = [];
var cells = [];

//loaded by the SVG document
function load(evt)
{
	// Assign the SVG root node to the global variable
	svgdoc = evt.target.ownerDocument;
	
	gameBoard = new Array(boardWidth);	
	ai = new AI(boardWidth, boardHeight, gameBoard, "James");
	
	// Fill the game with data
	setUp();	
}

function setUp()
{    
	initialiseBoard();	

	var main = svgdoc.getElementById("main");
	for(var i = 0; i < cells.length; i++)
	{
		main.removeChild(cells[i]);
	}
	cells = [];

	boardRect = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
	boardRect.setAttribute("id", "board");
	boardRect.setAttribute("stroke-width", "10");
	boardRect.setAttribute("fill", "black");
	boardRect.setAttribute("stroke", "black");	
	boardRect.setAttribute("height", (1+boardHeight)*cellSize);
	boardRect.setAttribute("width", boardWidth*cellSize);
	
	positionCounter = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
	positionCounter.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#counter1");	
	positionCounter.setAttribute("id", "column");
	
	main.appendChild(boardRect);
	
	for(var i = 0; i < boardWidth; i++)
	{
		for(var j = 0; j < boardHeight; j++)
		{
			var cell = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
			cell.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#cell");
			cell.setAttribute("x",cellSize*i);
			cell.setAttribute("y",cellSize*(j+1));
			cell.setAttribute('onclick','click(this)');
			cell.setAttribute('onmouseover','over(this)');
			main.appendChild(cell);
			cells.push(cell);
		}
	}

	var playAgainButton = svgdoc.getElementById("playAgainButton");
	main.appendChild(playAgainButton);
	playAgainButton.setAttribute("visibility", "visible");	
	main.appendChild(positionCounter);

	for(var i = 0; i < counters.length; i++)
	{
		main.removeChild(counters[i]);
	}
	counters = [];
}

function initialiseBoard()
{	
	for (var i = 0; i < boardWidth; i++)
	{
		gameBoard[i] = new Array(boardHeight);
		for(var j = 0; j < boardHeight; j++)
		{
			gameBoard[i][j] = 0
		}
	}
}

function click(cell)
{
	if(!ready)
	{
		return;
	}
	var x = cell.getAttribute("x");
	nextMove = x/cellSize;
	if(nextFree(nextMove,gameBoard) > -1)
	{
		nextTurn();
	}
	else
	{
		nextMove = -1;
	}
}

function nextTurn()
{
	if(gameOver || !ready)
	{
		return;
	}
	if(turn == COMPUTER)
	{
		ready = false
		var computerMove = ai.getComputerMove();
		move(computerMove);
		positionCounter.setAttribute("visibility","visible");
	}
	if(turn == HUMAN & nextMove != -1)
	{
		ready = false;
		setTimeout(function() { positionCounter.setAttribute("visibility", "hidden")},100);
		move(nextMove);
		nextMove = -1;
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
		counter.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#counter" + turn);
		turn = -turn;
		counter.setAttribute("x",x*cellSize);
		counter.setAttribute("y",(y+1)*cellSize);	
		counter.setAttribute('onclick','click(this)');	
		counter.setAttribute('onmouseover','over(this)');
		var endPos = (y+1)*cellSize*-1;
		var duration = (y+1)*0.1;
		var wait = (duration*1000)+30;
		var ani = document.createElementNS("http://www.w3.org/2000/svg","animateTransform");
		ani.setAttribute("attributeName", "transform");
		ani.setAttribute("type", "translate" );
		ani.setAttribute("from", "0,"+endPos);
		ani.setAttribute("to", "0,0");
		ani.setAttribute("dur", duration); 
		counter.appendChild(ani);
		counter.setAttribute("visibility", "hidden");
		main.appendChild(counter); 
		ani.beginElement();
		setTimeout(function() { counter.setAttribute("visibility", "visible")},100);
		counters.push(counter);
		setTimeout("checkWin("+x+","+y+")",wait);
	}
}

function checkWin(x,y)
{
    var line = isLine(x,y,gameBoard);
    if(line != 0 && fourInARowLine != null)
    {
            while (fourInARowLine.length > 0)
            {
                    var lineX = fourInARowLine[0].pop();
                    var lineY = fourInARowLine[1].pop();
                    if(lineX == null || lineY == null)
                    {
                            break;
                    }
                    var main = svgdoc.getElementById("main");
                    var winCounter = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
                    winCounter.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#counter3");
                    winCounter.setAttribute("x",lineX*cellSize);
				    winCounter.setAttribute("y",(lineY+1)*cellSize);
				    main.appendChild(winCounter);
				    counters.push(winCounter);
            }
            gameOver = true;
            var winnerString = (turn == HUMAN) ? playerName1 : playerName2;
            alert(winnerString + " wins.");
        	ai.updateUserModel(winnerString);
    }
    if (isBoardFull(gameBoard) && !gameOver)
    {
    	alert("Draw.");
    	ai.updateUserModel(0);
    }
    ready = true;
    if(turn == COMPUTER)
    {
	    nextTurn();
    }

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

function clone2DArray(array)
{
	var newArray = [];
	for (var i = 0; i < array.length; i++)
	{
	    newArray[i] = array[i].slice(0);
    }
    return newArray;
}

function over(cell)
{
	positionCounter.setAttribute("x",cell.getAttribute("x"));
}

function clickPlayAgain()
{
	ready = true;
	turn = HUMAN;
	nextMove = COMPUTER;
	gameOver = false;
	var main = svgdoc.getElementById("main");
	main.removeChild(boardRect);
	main.removeChild(positionCounter);
	setUp();
}