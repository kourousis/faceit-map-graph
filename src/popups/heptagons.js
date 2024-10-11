function createRegularPolygon(sides, radius) {
    const angle = (Math.PI * 2) / sides;
    let points = [];

    for (let i = 0; i < sides; i++) {
        const x = radius * Math.sin(i * angle);
        const y = -radius * Math.cos(i * angle);
        points.push({ x: x.toFixed(2), y: y.toFixed(2) });
    }

    return points;
}

function createHeptagonElement(id, radius) {
    const heptagon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    heptagon.setAttribute('class', 'heptagon');
    heptagon.setAttribute('id', id);
    const points = createRegularPolygon(7, radius).map(point => `${point.x},${point.y}`).join(' ');
    heptagon.setAttribute('points', points);
    heptagon.setAttribute('stroke', 'rgb(107, 101, 93)');
    return heptagon;
}

function createConnectingLines(points1, points2) {
    const lines = [];
    for (let i = 0; i < points1.length; i++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('x1', points1[i].x);
        line.setAttribute('y1', points1[i].y);
        line.setAttribute('x2', points2[i].x);
        line.setAttribute('y2', points2[i].y);
        line.setAttribute('stroke', 'rgb(107, 101, 93)');
        line.setAttribute('stroke-width', '0.7');
        lines.push(line);
    }
    return lines;
}

function createImageElement(x, y, href) {
    const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
    image.setAttribute('x', x - 10);
    image.setAttribute('y', y - 10);
    image.setAttribute('width', 20);
    image.setAttribute('height', 20);
    image.setAttribute('href', href);
    return image;
}

function createGraph(points, color) {
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const pointsString = points.map(point => `${point.x},${point.y}`).join(' ');
    polygon.setAttribute('points', pointsString);
    polygon.setAttribute('stroke', color);
    polygon.setAttribute('fill', color);
    polygon.setAttribute('fill-opacity', '0.5');
    return polygon;
}

const svgElement = document.querySelector('svg');
const outermostRadius = 120; // Keep this value as is
const innermostRadius = 10;
const heptagonCount = 6;
const radiusStep = (outermostRadius - innermostRadius) / (heptagonCount - 1);

let previousPoints = null;

for (let i = 0; i < heptagonCount; i++) {
    const radius = outermostRadius - (i * radiusStep);
    const heptagonElement = createHeptagonElement(`heptagon-${i}`, radius);
    svgElement.appendChild(heptagonElement);

    const currentPoints = createRegularPolygon(7, radius);
    if (previousPoints) {
        const lines = createConnectingLines(previousPoints, currentPoints);
        lines.forEach(line => svgElement.appendChild(line));
    }
    previousPoints = currentPoints;
}

const imageSources = [
    '../images/map_logos/de_ancient.jpg',
    '../images/map_logos/de_anubis.jpg',
    '../images/map_logos/de_dust2.jpg',
    '../images/map_logos/de_inferno.jpg',
    '../images/map_logos/de_mirage.jpg',
    '../images/map_logos/de_nuke.jpg',
    '../images/map_logos/de_vertigo.jpg'
];
const outermostPoints = createRegularPolygon(7, outermostRadius);
outermostPoints.forEach((point, index) => {
    const imageElement = createImageElement(point.x, point.y, imageSources[index]);
    svgElement.appendChild(imageElement);
});

export function drawGraph(mapGraphObjectPercent) {
    const friendlyPoints = createGraphPoints(mapGraphObjectPercent.friendly, innermostRadius, outermostRadius);
    const enemyPoints = createGraphPoints(mapGraphObjectPercent.enemy, innermostRadius, outermostRadius);

    const friendlyGraph = createGraph(friendlyPoints, 'blue');
    const enemyGraph = createGraph(enemyPoints, 'red');

    svgElement.appendChild(friendlyGraph);
    svgElement.appendChild(enemyGraph);
}

function createGraphPoints(data, innermostRadius, outermostRadius) {
    const maps = ['de_ancient', 'de_anubis', 'de_dust2', 'de_inferno', 'de_mirage', 'de_nuke', 'de_vertigo'];
    return maps.map((map, index) => {
        const percentage = data[map];
        const radius = innermostRadius + (percentage / 100) * (outermostRadius - innermostRadius);
        const angle = (Math.PI * 2) / maps.length;
        const x = radius * Math.sin(index * angle);
        const y = -radius * Math.cos(index * angle);
        return { x: x.toFixed(2), y: y.toFixed(2) };
    });
}