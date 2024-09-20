import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import { teamFriendlyMapData } from './getFactionMatches.js'

export async function getMatchMap(match_id) {
    try {
        const response = await axios.get(`https://open.faceit.com/data/v4/matches/${match_id}`, {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`
            },
        });

        const winning_faction = response.data.results.winning_faction;
        console.log(winning_faction)
        if (teamFriendlyMapData[match_id] && teamFriendlyMapData[match_id].player_team) {
            if (teamFriendlyMapData[match_id].player_team == winning_faction) {
                // win
                teamFriendlyMapData[match_id].result = 1
            } else {
                // loss
                teamFriendlyMapData[match_id].result = 0
            }
        } else {
            console.error(`teamFriendlyMapData for match_id ${match_id} is not properly initialized.`)
        }

        const map = response.data.voting.map.pick[0]
        // Assign map
        teamFriendlyMapData[match_id].map = map

    } catch (error) {
        console.error('Error fetching matches:', error.response ? error.response.data : error.message)
    }
}

