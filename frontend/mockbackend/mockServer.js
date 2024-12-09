import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Only allow requests from this origin
  })
);


// Mock data

const mockRides = {
  user1: {
    status: 200, // Request accepted
    autoID: "auto_12345", // Allocated auto ID
  },
  user2: {
    status: 404, // No auto allocated
  },
  user3: {
    status: 202,
  },
};

const autoLocations = {
  auto_12345: {
    1: { latitude: 30.3498, longitude: 76.3649 },
    2: { latitude: 30.3525, longitude: 76.3615 },
    3: { latitude: 30.3541, longitude: 76.3627 },
    4: { latitude: 30.3556, longitude: 76.3652 },
    5: { latitude: 30.357, longitude: 76.368 },
    6: { latitude: 30.358, longitude: 76.3705 },
    7: { latitude: 30.347415, longitude: 76.3543109 },
    8: { latitude: 30.354673, longitude: 76.36779 },
  },
};

// POST /api/rides
app.post("/api/rides", (req, res) => {
    
  const { requestID, level , pickup} = req.body;
  console.log(`Received ride request: ${requestID} for level: ${level}`);
  res.status(202).send({ message: "Request received" });
});

// GET /api/ride/:requestID
app.get("/api/rides", (req, res) => {
    const { requestID } = req.query; 

  // Simulate ride assignment
  if (mockRides[requestID]) {
    console.log(`Ride request ${requestID} status: ${mockRides[requestID].status}`);
    res.status(200).send(
    //   status: mockRides[requestID].status,
      mockRides[requestID].autoID,
    );

  } else {
    res.status(404);
    // .send({status: mockRides[requestID].status});
  }
});

let index = 1;

// GET /api/location/:autoID
app.get("/api/location", (req, res) => {
const { autoID } = req.query;
console.log(autoID);
  // Check if the autoID exists in the mock data
  console.log(autoLocations[autoID]);
  if (autoLocations[autoID]) {
    // console.log(autoLocations[autoID]);
    const locations = autoLocations[autoID];
    console.log(locations);


      const location = locations[index]; // Get the next location
      if (location && index <= Object.keys(locations).length) {
        res.status(200).send([location.latitude, location.longitude]);
        index++;
      }  // Stop sending locations once all have been sent
// Wait 5 seconds between each location update
  } else {
    res.status(404).send({ error: "Auto not found" });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Mock server running on http://localhost:${PORT}`)
);
