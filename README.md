# MapMitra: Navigate Effortlessly

## Overview
MapMitra is an intuitive campus navigation and transportation management system designed specifically for the Thapar Institute of Engineering and Technology (TIET). The project aims to address the challenges faced by new students, visitors, and e-rickshaw-dependent travelers by providing landmark-based navigation and real-time tracking of e-rickshaws.

## Features
- **Landmark-Based Navigation**: Provides clear and user-friendly directions using well-known campus landmarks.
- **Real-Time E-Rickshaw Tracking**: Displays live locations and estimated arrival times for e-rickshaws to minimize waiting times.
- **Personalized Recommendations**: Suggests popular campus amenities based on user preferences.
- **Interactive User Interface**: A visually appealing and intuitive interface for navigation and transportation.
- **Admin Management Tools**: Allows administrators to manage routes, register drivers, and handle road closures.

## Contributors
- [Ansh Midha](https://github.com/AM0312)
- [Leena Gupta](https://github.com/leena153)
- [Madhur Gaba](https://github.com/Gaba2603)
- [Shourya De](https://github.com/shouryade)
- [Yash Dogra](https://github.com/yxshee)

## OpenStreetMap Contributions

As part of our project, we made several updates to OpenStreetMap to improve the accuracy of the map data. Below are the details:

### Changes Made
- **Area:** [Map View](https://www.openstreetmap.org/#map=16/30.35418/76.36777&layers=N)
- **Type of Edits:** Added new roads, updated building footprints, and corrected location details for existing points of interest.
- **Purpose:** These changes enhance navigability and provide up-to-date information for the communit

## Technologies Used
- **Frontend**: React.js (for a responsive and interactive user interface)
- **Backend**: Golang, FastAPI (Python)
- **Database**: MongoDB (for scalable and flexible data storage), Redis(for in-memory storage of rides)
- **Mapping Services**: OpenStreetMap,GraphHopper and GIS data

## Installation
### Prerequisites
- Golang, Python and pip installed
- MongoDB server setup
- Redis server installed

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/shouryade/MapMitra.git
   ```
2. Navigate to the project directory:
   ```bash
   cd MapMitra
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     MONGO_URI=your_mongodb_connection_string
     REDIS_URL=your_redis_connection_url
     SOCKET_PORT=your_socket_port
     ```
5. Start the server:
   ```bash
   npm start
   ```
6. Access the application:
   Open your browser and navigate to `http://localhost:3000`.

## Deployment
### Prerequisites
- A cloud hosting platform (e.g., AWS, Heroku, or DigitalOcean).
- Docker (optional, for containerized deployment).
- Domain name and SSL certificates (optional, for production).

### Steps
1. **Configure Environment Variables:**
   Ensure all necessary environment variables (e.g., `MONGO_URI`, `REDIS_URL`, etc.) are configured in the cloud environment or container service.

2. **Containerize the Application (Optional):**
   - Create a `Dockerfile`:
     ```dockerfile
     FROM node:14
     WORKDIR /app
     COPY package.json .
     RUN npm install
     COPY . .
     EXPOSE 3000
     CMD ["npm", "start"]
     ```
   - Build and push the Docker image:
     ```bash
     docker build -t mapmitra:latest .
     docker tag mapmitra:latest your_dockerhub_username/mapmitra:latest
     docker push your_dockerhub_username/mapmitra:latest
     ```

3. **Deploy to Cloud Provider:**
   - **Heroku:**
     - Install Heroku CLI and log in.
     - Create a Heroku app:
       ```bash
       heroku create mapmitra
       ```
     - Deploy the code:
       ```bash
       git push heroku main
       ```
     - Set environment variables:
       ```bash
       heroku config:set MONGO_URI=your_mongodb_connection_string
       heroku config:set REDIS_URL=your_redis_connection_url
       heroku config:set SOCKET_PORT=3000
       ```

   - **AWS EC2 or DigitalOcean:**
     - SSH into your instance and clone the repository.
     - Install Node.js and MongoDB on the instance.
     - Configure environment variables in a `.env` file.
     - Start the application using `pm2` for production:
       ```bash
       pm2 start npm --name "MapMitra" -- start
       ```

4. **Set Up Reverse Proxy (Optional):**
   - Use Nginx or Apache to set up a reverse proxy for handling incoming traffic to the Node.js application.
   - Configure SSL certificates for HTTPS.

5. **Monitor the Application:**
   - Use monitoring tools like New Relic, Datadog, or AWS CloudWatch to track application performance and uptime.

## Usage
1. **Navigate through the campus:** Use the interactive map to get directions based on landmarks.
2. **Track e-rickshaws in real-time:** View live locations and availability of campus e-rickshaws.
3. **Plan your routes efficiently:** Minimize waiting times and navigate stress-free.

## License
This project is licensed under the MIT License.

## Acknowledgments
We would like to express our gratitude to our mentors:
- Dr. Deep Mann
- Dr. Aditi Sharma

Their guidance and expertise were invaluable in the successful completion of this project.
