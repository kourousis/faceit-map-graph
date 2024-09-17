import { getTotalPlayerMatches } from "./getTotalPlayerMatches.js"
import { fetchAllMatchMaps } from "./fetchAllMatchMaps.js"

import { playerMapData } from "./getTotalPlayerMatches.js"

const game = 'cs2';
let faceit_nickname = "Washamga";

(async () => {
    try {
        const match_Ids = await getTotalPlayerMatches(game, faceit_nickname);
        await fetchAllMatchMaps(match_Ids);
        console.log(JSON.stringify(playerMapData, null, 2));
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();