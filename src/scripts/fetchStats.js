import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const api_key = process.env.API_KEY
const game = 'cs2';
const teamFriendlyMapData = {}
const teamEnemyMapData = {}

// Hardcoded team members
// Later version will extract team member names from Faceit matchroom HTML
let teamFriendly = ["Washamga", "Dreamas", "fr13ty", "Ciortas", "simuxer"];
//let teamEnemy = ["BooCull", "Simsas999", "abhKRak3N", "TheCaesar0", "retsol"];

export const fetchStats = async () => {
    try {
        let match_Ids = []
        match_Ids.push(await getFactionMatches(game, friendlyPlayer))

        await fetchAllMatchMaps(match_Ids)
        //console.log(match_Ids)
        console.log(teamFriendlyMapData, Object.keys(teamFriendlyMapData).length)
    } catch (error) {
        console.error('An error occurred:', error)
    }
}

const getFactionMatches = async (game, team, limit = 10) => {
    for (let player of team) {
        const player_Id = await getPlayerId(player)
        try {
            const response = await axios.get(`https://open.faceit.com/data/v4/players/${player_Id}/history`, {
                headers: {
                    'Authorization': `Bearer ${api_key}`
                },
                params: {
                    game: game,
                    limit: limit
                }
            });

            const matches_data = response.data.items
            let match_Ids_local = []

            for (let match of matches_data) {
                // let player_team = "faction2"
                // for (let player of match.teams.faction1.players) {
                //     if (player.player_id === player) {
                //         player_team = "faction1"
                //     }
                // }

                match_Ids_local.push(match.match_id)
                // teamFriendlyMapData[match.match_id] = { player_team: player_team }
            }

            return match_Ids_local
        } catch (error) {
            console.error('Error fetching matches:', error.response ? error.response.data : error.message)
            return []
        }
    }

}

const getPlayerId = async (nickname) => {
    try {
        const response = await axios.get(`https://open.faceit.com/data/v4/players`, {
            headers: {
                'Authorization': `Bearer ${api_key}`
            },
            params: {
                nickname: nickname
            }
        })

        return response.data.player_id
    } catch (error) {
        console.error('Error fetching matches:', error.response ? error.response.data : error.message)
    }
}

const fetchAllMatchMaps = async (match_Ids) => {
    try {
        const allMatchIds = match_Ids.flat();
        await Promise.all(allMatchIds.map(single_match_id => getMatchMap(single_match_id)));
    } catch (error) {
        console.error('Error fetching all match maps:', error)
    }
}

const getMatchMap = async (match_id) => {
    try {
        const response = await axios.get(`https://open.faceit.com/data/v4/matches/${match_id}`, {
            headers: {
                'Authorization': `Bearer ${api_key}`
            },
        });

        const winning_faction = response.data.results.winner;
        const map = response.data.voting.map.pick[0]

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

        // Assign map
        teamFriendlyMapData[match_id].map = map

    } catch (error) {
        console.error('Error fetching matches:', error.response ? error.response.data : error.message)
    }
}