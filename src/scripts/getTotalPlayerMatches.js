import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import { getPlayerId } from './getPlayerId.js'

export let playerMapData = {}

export async function getTotalPlayerMatches(game, nickname, limit = 10) {
    const playerId = await getPlayerId(nickname)

    try {
        const response = await axios.get(`https://open.faceit.com/data/v4/players/${playerId}/history`, {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`
            },
            params: {
                game: game,
                limit: limit
            }
        });

        const matches_data = response.data.items
        //console.log(matches_data)
        let match_Ids = []

        let i = 0
        for (let match of matches_data) {
            let player_team = "faction2"
            for (let player of match.teams.faction1.players) {
                if (player.player_id === playerId) {
                    player_team = "faction1"
                }
            }

            match_Ids.push(match.match_id)
            playerMapData[match_Ids[i]] = { player_team: player_team }
            i++;
        }

        return match_Ids
    } catch (error) {
        console.error('Error fetching matches:', error.response ? error.response.data : error.message)
        return []
    }
}