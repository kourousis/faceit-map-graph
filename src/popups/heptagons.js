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
    heptagon.setAttribute('stroke', 'rgb(107, 101, 93)'); // Set stroke color
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
        line.setAttribute('stroke', 'rgb(107, 101, 93)'); // Set stroke color
        lines.push(line);
    }
    return lines;
}

const svgElement = document.querySelector('svg');
const outermostRadius = 150;
const innermostRadius = 10;
const heptagonCount = 10;
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