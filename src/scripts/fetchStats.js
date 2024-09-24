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
        // Friendly matches
        let match_Ids = []
        match_Ids.push(await getFactionMatches(game, teamFriendly))
        await getMatchMap(match_Ids)

        // Enemy matches
        // ...
        console.log(teamFriendlyMapData, Object.keys(teamFriendlyMapData).length, "ENTRIES")
        //console.log(match_Ids)
        // console.log(teamFriendlyMapData, Object.keys(teamFriendlyMapData).length)
    } catch (error) {
        console.error('An error occurred:', error)
    }
}

const getFactionMatches = async (game, team, limit = 10) => {
    let match_Ids_local = []

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
                match_Ids_local.push(match.match_id)
            }
        } catch (error) {
            console.error('Error fetching matches:', error.response ? error.response.data : error.message)
            return []
        }
    }

    return match_Ids_local
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

const getMatchMap = async (match_Ids) => {
    const flat_match_Ids = match_Ids.flat();

    try {
        const promises = flat_match_Ids.map(match =>
            axios.get(`https://open.faceit.com/data/v4/matches/${match}`, {
                headers: {
                    'Authorization': `Bearer ${api_key}`
                }
            }).then(response => {
                let player_team = "faction2";
                for (let player of response.data.teams.faction1.roster) {
                    if (player.player_id === player) {
                        player_team = "faction1";
                    }

                    teamFriendlyMapData[match] = { player_team: player_team };
                }

                const winning_faction = response.data.results.winner;
                const map = response.data.voting.map.pick[0];

                if (teamFriendlyMapData[match] && teamFriendlyMapData[match].player_team) {
                    if (teamFriendlyMapData[match].player_team == winning_faction) {
                        // win
                        teamFriendlyMapData[match].result = 1;
                    } else {
                        // loss
                        teamFriendlyMapData[match].result = 0;
                    }
                } else {
                    console.error(`teamFriendlyMapData for match ${match} is not properly initialized.`);
                }

                // Assign map
                teamFriendlyMapData[match].map = map;
            }).catch(error => {
                console.error('Error fetching matches:', error.response ? error.response.data : error.message);
            })
        );

        await Promise.all(promises);

    } catch (error) {
        console.error('Error fetching matches:', error);
    }
};