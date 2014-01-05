function UserModel(name)
{
	this.name = name;
	this.successRating = 0;
	this.gameRatingHistory = [];
	this.numberOfGamesPlayed = 0;
}

UserModel.prototype.addGameRating = function(rating)
{
	this.gameRatingHistory.push(rating);
	this.numberOfGamesPlayed++;
	this.saveGameRatingToStorage(rating);
	this.updateSuccessRating();
	this.setStorageStatus();
}

UserModel.prototype.setStorageStatus = function()
{
	if (!UserModel.supportsHTML5Storage())
	{
		return;
	}
	localStorage["connectFour." + this.name + ".isInStorage"] = "true";
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

UserModel.prototype.loadFromStorage = function()
{
	if (!UserModel.supportsHTML5Storage() || localStorage["connectFour." + this.name + ".isInStorage"] != "true")
	{
		return;
	}
	this.successRating = parseFloat(localStorage["connectFour." + this.name + ".successRating"]);
	this.numberOfGamesPlayed = parseInt(localStorage["connectFour." + this.name + ".numberOfGamesPlayed"]);
	for (var i = 0; i < this.numberOfGamesPlayed; i++)
	{
		this.gameRatingHistory[i] = parseInt(localStorage["connectFour." + this.name + ".gameRating." + i]);
	}
}

UserModel.prototype.saveGameRatingToStorage = function(rating)
{
	if (!UserModel.supportsHTML5Storage())
	{
		return;
	}
	localStorage["connectFour." + this.name + ".gameRating." + (this.numberOfGamesPlayed - 1)] = rating;
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