import cv2
import numpy as np
import os

# Paths to YOLOv4-Tiny model files
cfg_path = "yolov4_tiny.cfg"  # Update this if the file is in a different location
weights_path = "yolov4_tiny.weights"

# Load YOLOv4-Tiny Model
net = cv2.dnn.readNet(weights_path, cfg_path)

# Use CPU instead of CUDA
net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)

# Load class names (obj dataset classes)
classes_path = "obj.names"  # Update this path based on your directory structure
with open(classes_path, "r") as f:
    classes = f.read().strip().split("\n")

# Get layer names
layer_names = net.getLayerNames()
output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]

# Image Path
image_path = r"image.png"  # Update with your image path

# Check if the image file exists
if not os.path.exists(image_path):
    print(f"Error: Image file not found at {image_path}")
    exit()

# Load image
image = cv2.imread(image_path)
height, width = image.shape[:2]

# Prepare image for YOLOv4-Tiny
blob = cv2.dnn.blobFromImage(image, 1/255.0, (416, 416), swapRB=True, crop=False)
net.setInput(blob)
detections = net.forward(output_layers)

# Define color for detection
def get_color(class_id):
    np.random.seed(42)
    return tuple(np.random.randint(0, 255, 3).tolist())

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

# Display the image
cv2.imshow("YOLOv4-Tiny Detection", image)
cv2.waitKey(0)
cv2.destroyAllWindows()

# Save the output image
output_image_path = "output.jpg"
cv2.imwrite(output_image_path, image)
print(f"Processed image saved at {output_image_path}")
