from fer import FER
import numpy as np
import cv2
import tempfile

def get_emotion_data(video_bytes):
    detector = FER()
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        temp_video.write(video_bytes)
        temp_video_path = temp_video.name

    cap = cv2.VideoCapture(temp_video_path)
    emotions_summary = {}

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        result = detector.top_emotion(frame)
        if result:
            emotion, _ = result
            emotions_summary[emotion] = emotions_summary.get(emotion, 0) + 1

    cap.release()
    return emotions_summary
