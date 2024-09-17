import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import { playerMapData } from './getTotalPlayerMatches.js'

export async function getMatchMap(match_id) {
    try {
        const response = await axios.get(`https://open.faceit.com/data/v4/matches/${match_id}`, {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`
            },
        });

        const winner = response.data.results.winner;
        if (playerMapData[match_id] && playerMapData[match_id].player_team) {
            if (playerMapData[match_id].player_team == winner) {
                // win
                playerMapData[match_id].result = 1
            } else {
                // loss
                playerMapData[match_id].result = 0
            }
        } else {
            console.error(`playerMapData for match_id ${match_id} is not properly initialized.`)
        }

        const map = response.data.voting.map.pick[0]
        // Assign map
        playerMapData[match_id].map = map

    } catch (error) {
        console.error('Error fetching matches:', error.response ? error.response.data : error.message)
    }
}

