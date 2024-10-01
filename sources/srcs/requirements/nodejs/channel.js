// import { Game } from "./Game.js";

const Game = require('./Game.js');

class Channel
{
    constructor(channelId, creator)
    {
        this.channelId = channelId;
        this.game = new Game();
        this.creator = creator;
    }

    getGame()
    {
        return (this.game);
    }

    sendBroadcastGameInfo(event, data)
    {
        this.game.teams.forEach((team) => {
            team.players.forEach((player) => {
                player.socket.emit(event, data);
            });
        });
    }

    sendPrivateTeamGameInfo(event, data, Team)
    {
        Team.players.forEach((player) => {
            player.socket.emit(event, data);
        });
    }
}

module.exports = Channel;