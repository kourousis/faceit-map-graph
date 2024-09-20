import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import { getPlayerId } from './getPlayerId.js'

export let teamFriendlyMapData = {}
export let teamEnemyMapData = {}

export async function getFactionMatches(game, teamFriendly, teamEnemy = null, limit = 10) {
    const teamFriendlyPlayerId = await getPlayerId(teamFriendly)

    try {
        const response = await axios.get(`https://open.faceit.com/data/v4/players/${teamFriendlyPlayerId}/history`, {
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

        for (let match of matches_data) {
            let player_team = "faction2"
            for (let player of match.teams.faction1.players) {
                if (player.player_id === teamFriendlyPlayerId) {
                    player_team = "faction1"
                }
            }

            match_Ids.push(match.match_id)
            teamFriendlyMapData[match.match_id] = { player_team: player_team }
        }

        return match_Ids
    } catch (error) {
        console.error('Error fetching matches:', error.response ? error.response.data : error.message)
        return []
    }

}