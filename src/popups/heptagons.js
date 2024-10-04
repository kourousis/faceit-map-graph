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
        line.setAttribute('stroke-width', '0.7'); // Set stroke width to a thinner value
        lines.push(line);
    }
    return lines;
}

function createImageElement(x, y, href) {
    const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
    image.setAttribute('x', x - 10); // Adjust x position to center the image
    image.setAttribute('y', y - 10); // Adjust y position to center the image
    image.setAttribute('width', 20); // Set image width
    image.setAttribute('height', 20); // Set image height
    image.setAttribute('href', href); // Set image source
    return image;
}

const svgElement = document.querySelector('svg');
const outermostRadius = 140;
const innermostRadius = 10;
const heptagonCount = 11;
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

// Add images to the outermost heptagon
const imageSources = [
    '../images/map_logos/de_ancient.png',
    '../images/map_logos/de_anubis.png',
    '../images/map_logos/de_dust2.png',
    '../images/map_logos/de_inferno.png',
    '../images/map_logos/de_mirage.png',
    '../images/map_logos/de_nuke.png',
    '../images/map_logos/de_vertigo.png'
];
const outermostPoints = createRegularPolygon(7, outermostRadius);
outermostPoints.forEach((point, index) => {
    const imageElement = createImageElement(point.x, point.y, imageSources[index]);
    svgElement.appendChild(imageElement);
});