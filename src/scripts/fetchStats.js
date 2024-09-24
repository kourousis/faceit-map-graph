import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const api_key = process.env.API_KEY
const game = 'cs2';
const teamFriendlyMapData = {}
const teamEnemyMapData = {}

// Hardcoded team members
// Later version will extract team member names from Faceit matchroom HTML
let teamFriendly = ["Washamga", "Dreamas", "fr13ty", "Ciortas", "simuxer"]
//let teamEnemy = ["BooCull", "Simsas999", "abhKRak3N", "TheCaesar0", "retsol"]

export const fetchStats = async () => {
    try {
        await getFactionMatchIds(game, teamFriendly)
        console.log(teamFriendlyMapData, Object.keys(teamFriendlyMapData).length, "ENTRIES")
    } catch (error) {
        console.error('An error occurred:', error)
    }
}

const getFactionMatchIds = async (game, team, limit = 10) => {
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

            for (let match of matches_data) {
                await getMatchMapResults(match.match_id, player_Id)
            }
        } catch (error) {
            console.error('Error fetching matches:', error.response ? error.response.data : error.message)
            return
        }
    }
}

const getMatchMapResults = async (match_id, player_Id) => {
    try {
        const response = await axios.get(`https://open.faceit.com/data/v4/matches/${match_id}`, {
            headers: {
                'Authorization': `Bearer ${api_key}`
            }
        });

        const winning_faction = response.data.results.winner
        const map = response.data.voting.map.pick[0]

        if (teamFriendlyMapData[match_id]) {
            console.log(`Match ${match_id} is already processed.`)

            if (teamFriendlyMapData[match_id].player_team === winning_faction) {
                // win
                teamFriendlyMapData[match_id].result++
            }
            return
        }

        let player_team = "faction2";
        for (let teammate of response.data.teams.faction1.roster) {
            if (teammate.player_id === player_Id) {
                player_team = "faction1"
            }

            teamFriendlyMapData[match_id] = { player_team: player_team, result: 0, map: "" }
        }

        // Assign win / loss to current match
        if (teamFriendlyMapData[match_id] && teamFriendlyMapData[match_id].player_team) {
            if (teamFriendlyMapData[match_id].player_team === winning_faction) {
                // win
                teamFriendlyMapData[match_id].result++
            }
        } else {
            console.error(`teamFriendlyMapData for match ${match_id} is not properly initialized.`)
        }

        // Assign map
        teamFriendlyMapData[match_id].map = map
    } catch (error) {
        console.error('Error fetching matches:', error.response ? error.response.data : error.message)
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