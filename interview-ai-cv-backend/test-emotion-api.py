import cv2
import requests

# Capture one frame from the webcam
cap = cv2.VideoCapture(0)
ret, frame = cap.read()
cap.release()

if not ret:
    raise Exception("Failed to capture image from webcam.")

# Encode the frame as JPEG
_, img_encoded = cv2.imencode('.jpg', frame)

# Prepare multipart/form-data
files = {
    'video': ('frame.jpg', img_encoded.tobytes(), 'image/jpeg')
}

# Send POST request to FastAPI backend
response = requests.post('http://127.0.0.1:8000/analyze-emotion/', files=files)

# Output result
print("Status Code:", response.status_code)
print("Response:", response.text)
