import CONSTANTS from "./constants.js";

const findBlock = (lat, long, lat0 = CONSTANTS.ORIGIN_LAT, long0 = CONSTANTS.ORIGIN_LON) => {
  const METERS_PER_DEG_LONG =
    CONSTANTS.METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);

  const deltaLat = lat - lat0;
  const deltaLong = long - long0;

  const distLat = deltaLat * CONSTANTS.METERS_PER_DEG_LAT;
  const distLong = deltaLong * METERS_PER_DEG_LONG;

  const x = Math.floor(distLong / CONSTANTS.BLOCK_SIZE);
  const y = Math.floor(distLat / CONSTANTS.BLOCK_SIZE);
  
  return { x, y };
};

const depthLimitedBfs = (startX, startY, maxDepth) => {
  const levels = {};

  const queue = [[startX, startY, 0]];
  const visited = new Set();
  visited.add(`${startX},${startY}`);

  while (queue.length > 0) {
    const [x, y, depth] = queue.shift();

    if (depth > maxDepth) continue;

    if (!levels[depth]) levels[depth] = [];
    levels[depth].push([x, y]);

    for (const [dx, dy] of CONSTANTS.DIRECTIONS) {
      const newX = x + dx;
      const newY = y + dy;

      if (
        newX >= 0 &&
        newX <= CONSTANTS.MAX_X &&
        newY >= 0 &&
        newY <= CONSTANTS.MAX_Y &&
        !visited.has(`${newX},${newY}`)
      ) {
        queue.push([newX, newY, depth + 1]);
        visited.add(`${newX},${newY}`);
      }
    }
  }

  return levels;
};

// struc findBlock
// const { x, y } = findBlock(
//   lat,
//   long,
//   CONSTANTS.ORIGIN_LAT,
//   CONSTANTS.ORIGIN_LON
// );.

// struc depthLimitedBfs
// const levels = depthLimitedBfs(x, y, CONSTANTS.MAX_DEPTH);

export { findBlock, depthLimitedBfs };