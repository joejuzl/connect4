// SVG root document node
var svgdoc = null; 
var boardHeight = 6;
var boardWidth = 7;
var gameBoard;
var cellSize = 80;
var boardRect;
var columnRect;
var fourInARowLine;
var PLAYER1 = 1;
var PLAYER2 = -1;
var playerName1 = "Player 1";
var playerName2 = "Player 2";
var gameOver = false;
var ready = true;
var turn = PLAYER1;
var nextMove = -1;
var ai;
var winCounters = [];

//loaded by the SVG document
function load(evt)
{
	//assign the SVG root node to the global variable
	svgdoc = evt.target.ownerDocument;
	
	gameBoard = new Array(boardWidth);
	
	//fill the game with data
	setUp();	
}

function setUp()
{    
	initialiseBoard();	
	boardRect = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
	boardRect.setAttribute("id", "board");
	boardRect.setAttribute("stroke-width", "10");
	boardRect.setAttribute("fill", "black");
	boardRect.setAttribute("stroke", "black");	
	boardRect.setAttribute("height", boardHeight*cellSize);
	boardRect.setAttribute("width", boardWidth*cellSize);
	
	columnRect = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
	columnRect.setAttribute("id", "column");
	columnRect.setAttribute("stroke-width", "2");
	columnRect.setAttribute("fill", "none");
	columnRect.setAttribute("stroke", "red");	
	columnRect.setAttribute("height", boardHeight*cellSize);
	columnRect.setAttribute("width", cellSize);
	columnRect.setAttribute("visibility", "hidden");
	
	var main = svgdoc.getElementById("main");
	main.appendChild(boardRect);
	
	for(var i = 0; i < boardWidth; i++)
	{
		for(var j = 0; j < boardHeight; j++)
		{
			var cell = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
			cell.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#cell");
			cell.setAttribute("x",cellSize*i);
			cell.setAttribute("y",cellSize*j);
			cell.setAttribute('onclick','click(this)');
			cell.setAttribute('onmouseover','over(this)');
			main.appendChild(cell);
		}
	}

	ai = new AI(boardWidth, boardHeight, gameBoard, "James");
	
	var playAgainButton = svgdoc.getElementById("playAgainButton");
	main.appendChild(playAgainButton);
	playAgainButton.setAttribute("visibility", "visible");	
	main.appendChild(columnRect);

	for(var i = 0; i < winCounters.length; i++)
	{
		main.removeChild(winCounters[i]);
	}
	winCounters = [];
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
	nextTurn();
}

function nextTurn()
{
	if(gameOver || !ready)
	{
		return;
	}
	if(turn == PLAYER2)
	{
		ready = false
		var computerMove = ai.getComputerMove();
		move(computerMove);
	}
	if(turn == PLAYER1 & nextMove != -1)
	{
		ready = false;
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
		counter.setAttribute("y",y*cellSize);		
		var endPos = y*cellSize*-1
		var duration = y*0.1;
		var wait = (duration*1000)+10;
		var ani = document.createElementNS("http://www.w3.org/2000/svg","animateTransform");
		ani.setAttribute("attributeName", "transform");
		ani.setAttribute("type", "translate" );
		ani.setAttribute("from", "0,"+endPos);
		ani.setAttribute("to", "0,0");
		ani.setAttribute("begin", "DOMNodeInserted");
		ani.setAttribute("dur", duration); 
		counter.appendChild(ani);
		main.appendChild(counter); 
		setTimeout("checkWin("+x+","+y+")",wait);
		return true;
	}
	return false;
}

function checkWin(x,y)
{
    var line = isLine(x,y,gameBoard);
    if(line != 0 && fourInARowLine != null)
    {
            while (fourInARowLine.length>0)
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
				    winCounter.setAttribute("y",lineY*cellSize);
				    main.appendChild(winCounter);
				    winCounters.push(winCounter);
            }
            gameOver = true;
            var winnerString = (turn == PLAYER1) ? playerName1 : playerName2;
            alert(winnerString + " wins.");
        	ai.updateUserModel(winnerString);
    }
    if (isBoardFull(gameBoard) && !gameOver)
    {
    	alert("Draw.");
    	ai.updateUserModel(0);
    }
    ready = true;
    if(turn == PLAYER2)
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
	var columnRect = svgdoc.getElementById("column");
	columnRect.setAttribute("visibility","visible");
	columnRect.setAttribute("x",cell.getAttribute("x"));
}

function clickPlayAgain()
{
	ready = true;
	turn = PLAYER1;
	nextMove = PLAYER2;
	gameOver = false;
	var main = svgdoc.getElementById("main");
	main.removeChild(boardRect);
	main.removeChild(columnRect);
	setUp();
}