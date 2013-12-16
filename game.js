var svgdoc = null;                          // SVG root document node
var turn;
var boardSize = 9;
var gameBoard;
var cellSize = 40;
var counters;
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
	counters = new Array(boardSize)
	for (var i = 0; i < boardSize; i++)
	{
		gameBoard[i] = new Array(boardSize);
		counters[i] = new Array(boardSize)
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
	var x = node.getAttribute("x");
	move(x/cellSize);
	//compMove();

}

function move(row)
{
	var main = svgdoc.getElementById("main");
	var x = row;	
	var y = nextFree(x,gameBoard);	
	if(y != -1)
	{
		gameBoard[x][y] = turn;		
		var counter = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
		if(turn == 1)
		{
			counter.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#counter1");
			turn = 2;
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
		if(line != null)
		{
			while (line.length>0)
			{
				lineX = line[0].pop();
				lineY = line[1].pop();
				//alert("x: "+lineX+" y: "+lineY);
				if(lineX == null || lineY == null)
				{
					break;
				}
				var lineCounter = counters[lineX][lineY];
				lineCounter.setAttribute("fill", "#996699");
			}
			alert(turn);
		}
	}
}

function compMove()
{
	for(var x = 0; x < boardSize; x++)
	{
		y = nextFree(x,gameBoard);
		if(y == -1)
		{
			continue;
		}
		var newBoard = gameBoard.slice(0);
		newBoard[x][y] = 2;
		if(isLine(x,y,newBoard) == 2)
		{
			move(x);
			return;
		}
		newBoard[x][y] = 1;
		if(isLine(x,y,newBoard) == 1)
		{
			move(x);
			return;
		}
	}
	var rand = parseInt(Math.floor((Math.random()*boardSize)));
	while(nextFree(rand,gameBoard)==-1)
	{
		rand = parseInt(Math.floor((Math.random()*boardSize)));
	}
	move(rand);
	return;
} 


function nextFree(x,board)
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
			return pos
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
			return pos
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
			return pos
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
			return pos
		}
		i--;
		j++;
	}
	return null;
}