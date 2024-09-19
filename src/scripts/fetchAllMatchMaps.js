import { getMatchMap } from './getMatchMap.js'

export async function fetchAllMatchMaps(match_Ids) {
    // Prevent Explosion
    // if (!Array.isArray(match_Ids)) {
    //     // console.error('match_Ids is not an array')
    //     return;
    // }

    try {
        for (let playerMatches of match_Ids) {
            await Promise.all(playerMatches.map(id => getMatchMap(id)))
        }
    } catch (error) {
        console.error('Error fetching all match maps:', error)
    }
}