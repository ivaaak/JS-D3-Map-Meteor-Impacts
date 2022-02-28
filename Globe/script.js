// topojson describing the world atlas
const worldAtlas = 'https://unpkg.com/world-atlas@1.1.4/world/110m.json';
// json file with meteor impacts info
const meteoriteLandings = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';

// svg container size
const width = 1500;
const height = 1500;

const world = d3
  .select('.viz')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`);
// get geometries for countries
function mapData(countries, landings) {
  // set up projection
  const projection = d3
    .geoOrthographic()
    .fitSize([width-200, height-200], countries);

  // map the geometries to the svg
  const geoPath = d3
    .geoPath()
    .projection(projection);

  const group = world.append('g');

  // create sphere
  group
    .append('path')
    .attr('class', 'sphere')
    .datum({ type: 'Sphere' })
    .attr('d', geoPath)
    .attr('fill', 'hsl(215, 40%, 40%)');

  // map countries
  group
    .selectAll('path.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', geoPath)
    .attr('fill', 'hsl(215, 40%, 10%)');

  const geoGraticule = d3.geoGraticule();

  // meteor landing sites
  group
    .selectAll('path.landing')
    .data(landings.features)
    .enter()
    .append('path')
    .attr('class', 'landing')
    .attr('d', geoPath)
    .attr('fill', 'hsl(10, 40%, 50%)');

  // rotate the projection following mouse events (pre-made)
  const rotation = {
    x: 0,
    y: 0,
  };
  let isMouseDown = false;

  d3.select('body')
    .on('mouseup', () => { isMouseDown = false; })
    .on('mouseleave', () => { isMouseDown = false; });

  world
    .on('mousedown', () => { isMouseDown = true; })
    .on('mouseup', () => { isMouseDown = false; })
    .on('mousemove', () => {
      if (isMouseDown) {
        const { movementX, movementY } = d3.event;
        rotation.x += movementX;
        rotation.y -= movementY;

        // update the projection all elements
        projection.rotate([rotation.x, rotation.y]);

        d3.select('path.sphere').attr('d', geoPath);
        d3.selectAll('path.country').attr('d', geoPath);
        d3.selectAll('path.graticule').attr('d', geoPath(geoGraticule()));
        d3.selectAll('path.landing').attr('d', geoPath);
      }
    });
}

// get data from the source urls
Promise
  .all([d3.json(worldAtlas), d3.json(meteoriteLandings)])
  .then(([atlas, landings]) => {
    // convert from topojson
    const countries = topojson.feature(atlas, atlas.objects.countries);
    mapData(countries, landings);
  });