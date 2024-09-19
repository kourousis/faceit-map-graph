import { getFactionMatches } from "./getFactionMatches.js"
import { fetchAllMatchMaps } from "./fetchAllMatchMaps.js"
import { teamFriendlyMapData } from "./getFactionMatches.js"

const game = 'cs2';
let teamFriendly = ["Washamga", "Dreamas", "fr13ty", "Ciortas", "simuxer"];
//let teamEnemy = ["BooCull", "Simsas999", "abhKRak3N", "TheCaesar0", "retsol"];

(async () => {
    try {
        const match_Ids = []
        for (let friendlyPlayer of teamFriendly) {
            match_Ids.push(await getFactionMatches(game, friendlyPlayer))
        }

        await fetchAllMatchMaps(match_Ids)
        console.log(JSON.stringify(teamFriendlyMapData, null, 2))
        console.log("NUMBER OF MATCHES", Object.keys(teamFriendlyMapData).length);
    } catch (error) {
        console.error('An error occurred:', error)
    }
})();