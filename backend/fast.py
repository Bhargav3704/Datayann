from fastapi import FastAPI, HTTPException, UploadFile, File
import cv2
import numpy as np
import os
import shutil

app = FastAPI()

# Paths to YOLOv4-Tiny model files
CFG_PATH = "yolov4_tiny.cfg"
WEIGHTS_PATH = "yolov4_tiny.weights"
CLASSES_PATH = "obj.names"

# Load YOLOv4-Tiny Model
net = cv2.dnn.readNet(WEIGHTS_PATH, CFG_PATH)
net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)

# Load class names
with open(CLASSES_PATH, "r") as f:
    classes = f.read().strip().split("\n")

# Get layer names
layer_names = net.getLayerNames()
output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]


def get_color(class_id):
    """Returns a random color for each class ID"""
    np.random.seed(42)
    return tuple(np.random.randint(0, 255, 3).tolist())


@app.post("/detect-image/")
async def detect_image(file: UploadFile = File(...)):
    """Detects objects in an uploaded image file."""
    try:
        # Save uploaded file temporarily
        temp_image_path = f"temp_{file.filename}"
        with open(temp_image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Load image
        image = cv2.imread(temp_image_path)
        if image is None:
            os.remove(temp_image_path)
            raise HTTPException(status_code=400, detail="Invalid image file.")

        height, width = image.shape[:2]

        # Prepare image for YOLOv4-Tiny
        blob = cv2.dnn.blobFromImage(image, 1/255.0, (416, 416), swapRB=True, crop=False)
        net.setInput(blob)
        detections = net.forward(output_layers)

        # Process detections
        for output in detections:
            for detection in output:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]

                if confidence > 0.4:  # Confidence threshold
                    center_x, center_y, w, h = (detection[:4] * np.array([width, height, width, height])).astype("int")
                    x1, y1 = int(center_x - w / 2), int(center_y - h / 2)
                    x2, y2 = int(center_x + w / 2), int(center_y + h / 2)

                    # Get class name and color
                    class_name = classes[class_id] if class_id < len(classes) else "Unknown"
                    color = get_color(class_id)

                    # Draw bounding box
                    cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(image, f"{class_name} {confidence:.2f}", (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        # Save processed image
        output_path = "output_image.jpg"
        cv2.imwrite(output_path, image)

        # Clean up temp file
        os.remove(temp_image_path)

        return {"message": "Image processed successfully", "output_file": output_path}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from fastapi.responses import FileResponse

@app.post("/detect-video/")
async def detect_video(file: UploadFile = File(...)):
    """Detects objects in an uploaded video file and returns the processed video."""
    try:
        temp_video_path = f"temp_{file.filename}"
        with open(temp_video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        videoCap = cv2.VideoCapture(temp_video_path)
        if not videoCap.isOpened():
            os.remove(temp_video_path)
            raise HTTPException(status_code=400, detail="Invalid video file.")

        frame_width = int(videoCap.get(3))
        frame_height = int(videoCap.get(4))
        fps = int(videoCap.get(cv2.CAP_PROP_FPS))

        output_video_path = "output_video.avi"
        output_video = cv2.VideoWriter(output_video_path, cv2.VideoWriter_fourcc(*'XVID'), fps, (frame_width, frame_height))

        while videoCap.isOpened():
            ret, frame = videoCap.read()
            if not ret:
                break

            blob = cv2.dnn.blobFromImage(frame, 1/255.0, (416, 416), swapRB=True, crop=False)
            net.setInput(blob)
            detections = net.forward(output_layers)

            for output in detections:
                for detection in output:
                    scores = detection[5:]
                    class_id = np.argmax(scores)
                    confidence = scores[class_id]

                    if confidence > 0.4:
                        center_x, center_y, w, h = (detection[:4] * np.array([frame_width, frame_height, frame_width, frame_height])).astype("int")
                        x1, y1 = int(center_x - w / 2), int(center_y - h / 2)
                        x2, y2 = int(center_x + w / 2), int(center_y + h / 2)

                        class_name = classes[class_id] if class_id < len(classes) else "Unknown"
                        color = get_color(class_id)

                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                        cv2.putText(frame, f"{class_name} {confidence:.2f}", (x1, y1 - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            output_video.write(frame)

        videoCap.release()
        output_video.release()
        os.remove(temp_video_path)

        return FileResponse(output_video_path, media_type="video/x-msvideo", filename="processed_video.avi")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
