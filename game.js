var svgdoc = null;                          // SVG root document node
var turn;
var boardSize = 9;
var board;

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
	board = new Array(10);
	for (var i = 0; i < boardSize; i++)
	{
		board[i] = new Array(boardSize);
		for(var j = 0; j < boardSize; j++)
		{
			board[i][j] = 0
		}
	}
	var boardRect = svgdoc.getElementById("board")
	boardRect.setAttribute("height", boardSize*20);
	boardRect.setAttribute("width", boardSize*20);
	var node = svgdoc.getElementById("main");
	for(var i = 0; i < boardSize; i++)
	{
		for(var j = 0; j < boardSize; j++)
		{
			var cell = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
			cell.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#cell");
			cell.setAttribute("x",20*i);
			cell.setAttribute("y",20*j);
			cell.setAttribute('onclick','click(this)');
			node.appendChild(cell);
		}
	}
}

function click(node)
{	
	var x = node.getAttribute("x");
	move(x/20);
	//compMove();

}

function move(row)
{
	var main = svgdoc.getElementById("main");
	var x = row;	
	var y = nextFree(x);	
	if(y != -1)
	{
		board[x][y] = turn;		
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
		counter.setAttribute("x",x*20);
		counter.setAttribute("y",y*20);
		main.appendChild(counter);
		var winner = isLine(x,y);
		if(winner != 0)
		{
			alert(winner);
		}
	}
}

function compMove()
{
	for(var x = 0; x < boardSize; x++)
	{
		if(isLine(x,nextFree(x)) == 2)
		{
			move(x);
			return;
		}
	}
	var rand = parseInt(Math.floor((Math.random()*boardSize)));
	move(rand);
	return;
} 


function nextFree(x)
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

function isLine(x,y){
	var winner = 0;
	var count = 0;
	//horizontal
	for(var i = 0; i < boardSize; i++)
	{
		var piece = board[i][y];
		if(piece == winner)
		{
			count++;
		}
		else
		{
			winner = piece;
			count = 1;
		}
		if(count >= 4 && winner != 0)
		{
			return winner
		}
	}
	winner = 0;
	count = 0;
	//vertical
	for(var j = 0; j < boardSize; j++)
	{
		var piece = board[x][j];
		if(piece == winner)
		{
			count++;
		}
		else
		{
			winner = piece;
			count = 1;
		}
		if(count >= 4 && winner != 0)
		{
			return winner
		}
	}
	winner = 0;
	count = 0;
	//diag right
	var i = x - Math.min(x,y);
	var j = y - Math.min(x,y);
	while(i < boardSize && j < boardSize)
	{
		var piece = board[i][j];
		if(piece == winner)
		{
			count++;
		}
		else
		{
			winner = piece;
			count = 1;
		}
		if(count >= 4 && winner != 0)
		{
			return winner
		}
		i++;
		j++;
	}
	winner = 0;
	count = 0;
	//diag left
	var i = x + (boardSize-(x+1));
	var j = y - (boardSize-(x+1));
	while(i < boardSize && j < boardSize)
	{
		var piece = board[i][j];
		if(piece == winner)
		{
			count++;
		}
		else
		{
			winner = piece;
			count = 1;
		}
		if(count >= 4 && winner != 0)
		{
			return winner
		}
		i--;
		j++;
	}
	return 0;

}