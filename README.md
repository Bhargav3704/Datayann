 🚗 Pothole Detection System using FastAPI, React, and YOLOv4-Tiny 🛣️  

 📌 Project Overview 🏗️  
This project is an AI-powered Pothole Detection System 🧠 that processes images and videos 📸🎥 to identify potholes using YOLOv4-Tiny.  

✅ **FastAPI backend** for real-time processing  
✅ **React frontend** for user-friendly interaction  
✅ **OpenCV & YOLOv4-Tiny** for deep learning-based detection  

🎯 Goal: Provide an automated pothole detection system that helps improve road safety. 🚦🏢

---

## 📌 Key Features ✨  

✅ Automated Image & Video Processing** 🎞️  
- Upload images/videos and detect potholes in real time.  
- Uses YOLOv4-Tiny for AI-powered object detection.  
- Bounding boxes 🔲 highlight detected potholes.  

✅ FastAPI Backend** 🚀  
- Handles file uploads for images & videos.  
- Processes video frames 🎞️ using OpenCV and returns results.  
- Serves processed videos correctly for seamless playback.  

✅ React Frontend 🖥️  
- Interactive UI for file upload 📤 & viewing results.  
- Displays processed images/videos dynamically.  
- Supports real-time webcam streaming 🎥 for pothole detection.  

✅ Live Stream & Webcam Integration 📡  
- Detect potholes in real-time from a live camera feed.  
- Uses WebRTC & FastAPI to process video streams.  

✅ Optimized Video Streaming 🎞️  
- Smooth playback with FastAPI range requests.  
- Videos stored & streamed efficiently for minimal lag.  

---

🚀 Installation & Setup 🛠️
1️⃣ Clone the Repository 🔽

git clone https://github.com/your-repo/Pothole-Detection.git
cd Pothole-Detection
----------------------------------------------------------------------
2️⃣ Backend Setup (FastAPI) ⚙️
🔹 Create a Virtual Environment & Install Dependencies
cd backend
python -m venv venv
source venv/bin/activate  # For Mac/Linux
venv\Scripts\activate     # For Windows
pip install -r requirements.txt

🔹 Run FastAPI Backend 🚀
uvicorn fast:app --reload
🎯 Backend runs at http://127.0.0.1:8000
--------------------------------------------------------------------------
3️⃣ Frontend Setup (React) 🎨
🔹 Install Node.js dependencies
cd frontend
npm install
---------------------------------------------------------------------------
🔹 Run React Frontend 🌍
npm start
🎯 Frontend runs at http://localhost:3000

📜 API Endpoints 🔗
1️⃣ Image Detection API 🖼️
Upload an image and detect potholes.

POST /detect-image/
--------------------------------------------------------------------------
2️⃣ Video Detection API 🎞️
Upload a video and detect potholes.

POST /detect-video/
--------------------------------------------------------------------------
3️⃣ Serve Processed Videos 🎥

GET /uploads/{filename}
----------------------------------------------------------------------------
🏗️ Tech Stack 🛠️
Backend (FastAPI) ⚙️
🚀 FastAPI – High-performance backend
🎞️ OpenCV – Image and video processing
🧠 YOLOv4-Tiny – Deep learning model
🔥 Python 3.8+
Frontend (React.js) 🎨
⚛️ React.js – Dynamic frontend
🎨 Tailwind CSS – Modern UI styling
📡 WebRTC API – Live streaming support
🌍 Fetch API – Backend communication
