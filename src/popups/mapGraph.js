import { fetchStats } from "./fetchStats.js";
import { drawGraph } from "./heptagons.js";

(async () => {
    const mapGraphObjectPercent = await fetchStats();
    drawGraph(mapGraphObjectPercent);
})();