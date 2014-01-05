function UserModel(name)
{
	this.name = name;
	this.successRating = 0;
	this.gameRatingHistory = [];
	this.numberOfGamesPlayed = 0;
	this.difficulty = 2;
}

UserModel.prototype.initialiseLocalStorage = function()
{
	localStorage["connectFour." + this.name + ".isInStorage"] = "true";
	localStorage["connectFour." + this.name + ".successRating"] = this.successRating;
	localStorage["connectFour." + this.name + ".difficulty"] = this.difficulty;
	localStorage["connectFour." + this.name + ".numberOfGamesPlayed"] = this.numberOfGamesPlayed;
}

UserModel.prototype.addGameRating = function(rating)
{
	this.gameRatingHistory.push(rating);
	this.numberOfGamesPlayed++;
	if (this.numberOfGamesPlayed > 10)
	{
		this.gameRatingHistory = this.gameRatingHistory.slice(1);
		this.numberOfGamesPlayed--;
	}
	this.saveGameRatingsToStorage();
	this.updateSuccessRating();
}

UserModel.prototype.updateSuccessRating = function()
{
	var sum = 0;
	for (var i = 0; i < this.gameRatingHistory.length; i++)
	{
		sum += this.gameRatingHistory[i];
	}
	this.successRating = sum / this.gameRatingHistory.length;
	this.saveSuccessRatingToStorage();
}

UserModel.prototype.updateDifficulty = function(difficulty)
{
	if (!UserModel.supportsHTML5Storage())
	{
		return;
	}
	localStorage["connectFour." + this.name + ".difficulty"] = difficulty;
	this.difficulty = difficulty;
}

UserModel.prototype.loadFromStorage = function()
{
	if (!UserModel.supportsHTML5Storage())
	{
		return;
	}

	if (localStorage["connectFour." + this.name + ".isInStorage"] != "true")
	{
		this.initialiseLocalStorage();
		return;
	}
	this.successRating = parseFloat(localStorage["connectFour." + this.name + ".successRating"]);
	this.numberOfGamesPlayed = parseInt(localStorage["connectFour." + this.name + ".numberOfGamesPlayed"]);
	this.difficulty = parseInt(localStorage["connectFour." + this.name + ".difficulty"]);
	for (var i = 0; i < this.numberOfGamesPlayed; i++)
	{
		this.gameRatingHistory[i] = parseInt(localStorage["connectFour." + this.name + ".gameRating." + i]);
	}
}

UserModel.prototype.saveGameRatingsToStorage = function()
{
	if (!UserModel.supportsHTML5Storage())
	{
		return;
	}
	for (var i = 0; i < this.numberOfGamesPlayed; i++)
	{
		localStorage["connectFour." + this.name + ".gameRating." + i] = this.gameRatingHistory[i];
	}
	localStorage["connectFour." + this.name + ".numberOfGamesPlayed"] = this.numberOfGamesPlayed;
}

UserModel.prototype.saveSuccessRatingToStorage = function()
{
	if (!UserModel.supportsHTML5Storage())
	{
		return;
	}
	localStorage["connectFour." + this.name + ".successRating"] = this.successRating;
}

UserModel.supportsHTML5Storage = function() 
{
  try 
  {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) 
  {
    return false;
  }
}