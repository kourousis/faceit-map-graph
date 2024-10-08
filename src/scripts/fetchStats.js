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
let teamEnemy = ["BooCull", "Simsas999", "abhKRak3N", "TheCaesar0", "retsol"]

export const fetchStats = async () => {
    const mapGraphObject = {
        "friendly": {
            "de_ancient": 0,
            "de_anubis": 0,
            "de_dust2": 0,
            "de_inferno": 0,
            "de_mirage": 0,
            "de_nuke": 0,
            "de_vertigo": 0
        },
        "enemy": {
            "de_ancient": 0,
            "de_anubis": 0,
            "de_dust2": 0,
            "de_inferno": 0,
            "de_mirage": 0,
            "de_nuke": 0,
            "de_vertigo": 0
        }
    }

    try {
        await getFactionMatchIds(game, teamFriendly, teamEnemy)
        console.log("teamFriendlyMapData", teamFriendlyMapData, Object.keys(teamFriendlyMapData).length, "ENTRIES")
        console.log("teamEnemyMapData", teamEnemyMapData, Object.keys(teamEnemyMapData).length, "ENTRIES")

        // Sum results of teamFriendlyMapData
        for (const key in teamFriendlyMapData) {
            if (teamFriendlyMapData.hasOwnProperty(key)) {
                const match = teamFriendlyMapData[key]
                const map = match.map
                if (mapGraphObject.friendly.hasOwnProperty(map)) {
                    mapGraphObject.friendly[map] += match.result
                }
            }
        }

        // Sum results of teamEnemyMapData
        for (const key in teamEnemyMapData) {
            if (teamEnemyMapData.hasOwnProperty(key)) {
                const match = teamEnemyMapData[key]
                const map = match.map
                if (mapGraphObject.enemy.hasOwnProperty(map)) {
                    mapGraphObject.enemy[map] += match.result
                }
            }
        }

        const mapGraphObjectPercent = JSON.parse(JSON.stringify(mapGraphObject));

        // Divide number of wins in friendly object of mapGraphObjectPercent by matchCounterFriendly
        for (const map in mapGraphObjectPercent.friendly) {
            if (mapGraphObjectPercent.friendly.hasOwnProperty(map)) {
                mapGraphObjectPercent.friendly[map] /= matchCounterFriendly
                mapGraphObjectPercent.friendly[map] *= 100
                mapGraphObjectPercent.friendly[map] = parseFloat(mapGraphObjectPercent.friendly[map].toFixed(2))
            }
        }

        // Divide number of wins in enemy object of mapGraphObjectPercent by matchCounterEnemy
        for (const map in mapGraphObjectPercent.enemy) {
            if (mapGraphObjectPercent.enemy.hasOwnProperty(map)) {
                mapGraphObjectPercent.enemy[map] /= matchCounterEnemy
                mapGraphObjectPercent.enemy[map] *= 100
                mapGraphObjectPercent.enemy[map] = parseFloat(mapGraphObjectPercent.enemy[map].toFixed(2))
            }
        }

        console.log("mapGraphObject", mapGraphObject)
        console.log("mapGraphObjectPercent", mapGraphObjectPercent)
        console.log("matchCounterFriendly", matchCounterFriendly)
        console.log("matchCounterEnemy", matchCounterEnemy)

        console.log("numOfRepeatsFriendly", numOfRepeatsFriendly)
        console.log("numOfRepeatsEnemy", numOfRepeatsEnemy)

        console.log("matchCounterFriendly - numOfRepeatsFriendly", matchCounterFriendly - numOfRepeatsFriendly)
        console.log("matchCounterEnemy - numOfRepeatsEnemy", matchCounterEnemy - numOfRepeatsEnemy)

        return mapGraphObject
    } catch (error) {
        console.error('An error occurred:', error)
    }
}

const getFactionMatchIds = async (game, teamFriendly, teamEnemy, limit = 20, startDate = 0) => {
    const teamFriendlyMatchPromises = []
    const teamEnemyMatchPromises = []

    for (let player of teamFriendly) {
        const player_Id = await getPlayerId(player)

        try {
            const response = await axios.get(`https://open.faceit.com/data/v4/players/${player_Id}/history`, {
                headers: {
                    'Authorization': `Bearer ${api_key}`
                },
                params: {
                    game: game,
                    limit: limit
                    //from : startDate
                }
            });

            let matches_data = response.data.items

            if (matches_data[0].competition_type === "matchmaking") {
                for (let match of matches_data) {
                    teamFriendlyMatchPromises.push(getMatchMapResultsFriendly(match.match_id, player_Id))
                }
            }
            matches_data = ""
        } catch (error) {
            console.error('Error fetching matches:', error.response ? error.response.data : error.message)
            return
        }
    }

    for (let player of teamEnemy) {
        const player_Id = await getPlayerId(player)

        try {
            const response = await axios.get(`https://open.faceit.com/data/v4/players/${player_Id}/history`, {
                headers: {
                    'Authorization': `Bearer ${api_key}`
                },
                params: {
                    game: game,
                    limit: limit
                    //from : startDate
                }
            });

            let matches_data = response.data.items
            if (matches_data[0].competition_type === "matchmaking") {
                for (let match of matches_data) {
                    teamEnemyMatchPromises.push(getMatchMapResultsEnemy(match.match_id, player_Id))
                }
            }
            matches_data = ""
        } catch (error) {
            console.error('Error fetching matches:', error.response ? error.response.data : error.message)
            return
        }
    }

    await Promise.all(teamFriendlyMatchPromises)
    await Promise.all(teamEnemyMatchPromises)
}

let numOfRepeatsFriendly = 0
let matchCounterFriendly = 0
const getMatchMapResultsFriendly = async (match_id, player_Id) => {
    try {
        const response = await axios.get(`https://open.faceit.com/data/v4/matches/${match_id}`, {
            headers: {
                'Authorization': `Bearer ${api_key}`
            }
        });

        const winning_faction = response.data.results.winner
        const map = response.data?.voting?.map?.pick?.[0]

        if (map === undefined) {
            console.log(match_id, "map is left UNDEFINED")
            return
        }

        if (teamFriendlyMapData[match_id]) {
            numOfRepeatsFriendly++
            matchCounterFriendly++
            console.log(`teamFriendlyMapData Match ${match_id} is already processed.`)

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

            teamFriendlyMapData[match_id] = { player_Id: player_Id, player_team: player_team, result: 0, map: map }
        }

        matchCounterFriendly++

        // Assign win / loss to current match
        if (teamFriendlyMapData[match_id] && teamFriendlyMapData[match_id].player_team) {
            if (teamFriendlyMapData[match_id].player_team === winning_faction) {
                // win
                teamFriendlyMapData[match_id].result++
            }
        } else {
            console.error(`teamFriendlyMapData for match ${match_id} is not properly initialized.`)
        }

    } catch (error) {
        console.error('Error fetching matches:', error.response ? error.response.data : error.message)
    }
}

let numOfRepeatsEnemy = 0
let matchCounterEnemy = 0
const getMatchMapResultsEnemy = async (match_id, player_Id) => {
    try {
        const response = await axios.get(`https://open.faceit.com/data/v4/matches/${match_id}`, {
            headers: {
                'Authorization': `Bearer ${api_key}`
            }
        });

        const winning_faction = response.data.results.winner
        const map = response.data?.voting?.map?.pick?.[0]

        if (map === undefined) {
            console.log(match_id, "map is left UNDEFINED")
            return
        }

        if (teamEnemyMapData[match_id]) {
            numOfRepeatsEnemy++
            matchCounterEnemy++
            console.log(`teamEnemyMapData Match ${match_id} is already processed.`)

            if (teamEnemyMapData[match_id].player_team === winning_faction) {
                // win
                teamEnemyMapData[match_id].result++
            }
            return
        }

        let player_team = "faction2";
        for (let teammate of response.data.teams.faction1.roster) {
            if (teammate.player_id === player_Id) {
                player_team = "faction1"
            }

            teamEnemyMapData[match_id] = { player_Id: player_Id, player_team: player_team, result: 0, map: map }
        }

        matchCounterEnemy++

        // Assign win / loss to current match
        if (teamEnemyMapData[match_id] && teamEnemyMapData[match_id].player_team) {
            if (teamEnemyMapData[match_id].player_team === winning_faction) {
                // win
                teamEnemyMapData[match_id].result++
            }
        } else {
            console.error(`teamEnemyMapData for match ${match_id} is not properly initialized.`)
        }

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