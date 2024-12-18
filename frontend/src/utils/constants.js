const CONSTANTS = {
  METERS_PER_DEG_LAT: 111320, // Approximate meters per degree of latitude
  BLOCK_SIZE: 150, // Block size in meters
  MAX_X: 9, // Maximum x-coordinate value in the grid
  MAX_Y: 6, // Maximum y-coordinate value in the grid
  DIRECTIONS: [
    // Directions for all 8 neighbors in a grid
    [0, 1], // Right
    [1, 0], // Down
    [0, -1], // Left
    [-1, 0], // Up
    [1, 1], // Bottom-right diagonal
    [1, -1], // Bottom-left diagonal
    [-1, 1], // Top-right diagonal
    [-1, -1], // Top-left diagonal
  ],
  ORIGIN_LAT: 30.3504186, // Origin latitude for grid calculations
  ORIGIN_LON: 76.3585708, // Origin longitude for grid calculations
  MAX_DEPTH: 2, // Maximum search depth for BFS
};

export default CONSTANTS;
