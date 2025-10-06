🚦 Smart Traffic Light Controller

📘 1. Project Overview

The Smart Traffic Light Controller is a web-based system designed to manage traffic signals dynamically using real-time data and modern cloud technologies.
It simulates a four-way intersection (North-South and East-West lanes) and supports Automatic, Manual, and Emergency modes.

The system integrates:

Firebase Firestore for real-time synchronization,

Firebase Authentication for secure access,

HTML5 Audio for mode change alerts, and

A realistic, animated web interface for visualization.

🚧 2. Problem Statement

Traditional traffic lights operate on fixed timers, causing:

⏱️ Unnecessary waiting on empty roads

🚗 Congestion on busy lanes

⛽ Higher fuel consumption and emissions

🚨 Difficulty managing emergencies

Modern cities need real-time adaptive traffic control to optimize flow, minimize delays, and respond to emergencies effectively.

🎯 3. Objectives

✅ Develop an interactive and realistic web interface

🔄 Implement real-time state synchronization with Firebase Firestore

🕹️ Provide Auto, Manual, and Emergency control modes

🔐 Add secure authentication using Firebase Auth

🚶 Simulate vehicle and pedestrian activity visually

🧠 4. Technology Stack
Layer	Technology / Tool	Purpose
Frontend	HTML, CSS, JavaScript	UI development & animations
Backend	Firebase Firestore	Real-time database for signal states
Authentication	Firebase Auth	Secure admin login
Hosting	Firebase Hosting (optional)	Deployment of web app
Audio	HTML5 Audio	Mode change alerts
⚙️ 5. Algorithm & System Logic
Auto Mode

Cycles between NS ↔ EW based on set durations.

Updates lights and pedestrian signals dynamically.

Manual Mode

Admin can manually select which direction stays green.

Changes reflect instantly for all connected clients.

Emergency Mode

All signals turn red immediately for safe emergency passage.

Real-Time Synchronization

Each client has a unique ID.

Changes are stored with timestamps in Firestore.

Other clients update their UI automatically via onSnapshot() listeners.

🔥 6. Firebase Firestore Implementation

Collection: traffic
Document: signalState

Fields:

mode, activePhase, lights, duration, clientId, timestamp


Real-Time Updates

Clients subscribe using Firestore’s real-time listeners.

UI updates automatically when signal states change.

Conflict Management

Updates tagged with clientId prevent feedback loops.

Server Timestamps

Ensures precise state transition logging using serverTimestamp().

🔐 7. Firebase Authentication

Only authenticated admins can operate Manual or Emergency modes.

Implemented using onAuthStateChanged for session tracking.

Unauthorized users are redirected to the login page.

Logout functionality for security.

💡 8. Features

🟢 Mode Selection: Auto, Manual, Emergency

📊 Real-Time Dashboard: Active phase, timer, next direction, pedestrian status

🧾 Activity Log: Last 50 signal transitions

🔈 Audio Alerts: Mode change notifications

💻 Responsive UI: Realistic intersection with vehicles & pedestrians

☁️ Multi-Client Sync: Real-time updates via Firebase

💼 9. Business Perspective

🌆 Smart City Application: Reduces congestion & improves safety

📈 Scalable Design: Expandable to multiple intersections

📊 Data Insights: Enable traffic analytics and predictive models

🧭 User Engagement: Interactive dashboards for city authorities

🔌 IoT Ready: Can integrate with sensors for automated detection

🚀 10. Advantages

❌ No dependency on fixed timers

🚗 Reduces congestion and fuel usage

💡 Foundation for smart city automation

🔒 Secure and authenticated control

🎨 Realistic UI for better understanding and engagement

🧾 11. Expected Output

Dynamic, interactive four-way traffic simulation

Real-time traffic light updates across clients

Live activity log of mode and signal transitions

Animated pedestrian and vehicle movements

🔮 12. Future Enhancements

🚘 IoT sensor integration for automatic vehicle detection

🤖 Machine learning for predictive traffic optimization

📈 Graphical analytics dashboards

⏳ Countdown timers for pedestrian signals

📱 Mobile-friendly responsive control panel

🧠 13. Key Learnings

🔄 Building real-time web apps with Firebase Firestore

🧩 Using JavaScript DOM for dynamic UI updates

🔐 Implementing Firebase Authentication

🌐 Managing multi-client synchronization

🚀 Deploying full-stack web apps to the cloud

🧑‍💻 Contributors

Developed by: Atharva Gahine
📅 2025
📍 Smart City Traffic Optimization Initiative
