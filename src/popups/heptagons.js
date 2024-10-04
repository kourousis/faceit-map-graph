function createRegularPolygon(sides, radius) {
    const angle = (Math.PI * 2) / sides;
    let points = [];

    for (let i = 0; i < sides; i++) {
        const x = radius * Math.sin(i * angle);
        const y = -radius * Math.cos(i * angle);
        points.push(`${x.toFixed(2)}`, `${y.toFixed(2)}`);
    }

    return points.join(' ');
}

function createHeptagonElement(id, radius) {
    const heptagon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    heptagon.setAttribute('class', 'heptagon');
    heptagon.setAttribute('id', id);
    heptagon.setAttribute('points', createRegularPolygon(7, radius));
    return heptagon;
}

const svgElement = document.querySelector('svg');
const outermostRadius = 150;
const innermostRadius = 10;
const heptagonCount = 10;
const radiusStep = (outermostRadius - innermostRadius) / (heptagonCount - 1);

for (let i = 0; i < heptagonCount; i++) {
    const radius = outermostRadius - (i * radiusStep);
    const heptagonElement = createHeptagonElement(`heptagon-${i}`, radius);
    svgElement.appendChild(heptagonElement);
}