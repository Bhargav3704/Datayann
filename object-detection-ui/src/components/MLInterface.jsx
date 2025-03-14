"use client";

import { useState, useRef, useEffect } from "react";
import Button from "./Button";
import Card from "./Card";
import Tabs from "./Tabs";
import Dialog from "./Dialog";
import { Upload, Camera, Play, Square, Zap, Video } from "./Icons";
import "./MLInterface.css";

function MLInterface() {
  // File upload state
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // "idle" | "uploading" | "uploaded" | "error"
  const [uploadProgress, setUploadProgress] = useState(0);
  const [outputFile, setOutputFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const fileInputRef = useRef(null);

  // Webcam and Live Stream states (Unchanged)
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamData, setWebcamData] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [processedStreamUrl, setProcessedStreamUrl] = useState("");
  const [streamError, setStreamError] = useState("");

  // Inference state (Unchanged)
  const [isModelReady, setIsModelReady] = useState(false);
  const [isInferenceDialogOpen, setIsInferenceDialogOpen] = useState(false);
  const [inferenceResult, setInferenceResult] = useState(null);

  // Simulate model loading when file is uploaded
  useEffect(() => {
    if (uploadStatus === "uploaded" && file) {
      const timer = setTimeout(() => {
        setIsModelReady(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [uploadStatus, file]);

  /** Handle file upload and send it to FastAPI */
  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploadStatus("uploading");
    setOutputFile(null); // Clear previous output

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) clearInterval(interval);
    }, 300);

    const formData = new FormData();
    formData.append("file", selectedFile);
    setFileType(selectedFile.type.startsWith("image") ? "image" : "video");

    try {
      const endpoint = selectedFile.type.startsWith("image")
        ? "http://127.0.0.1:8000/detect-image/"
        : "http://127.0.0.1:8000/detect-video/";

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setUploadStatus("uploaded");

      if (result.output_file) {
        setOutputFile(`http://127.0.0.1:8000${result.output_file}`);
      } else {
        alert("Processing failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("error");
      alert("An error occurred. Check console for details.");
    }
  };

  /** Reset input for next upload */
  const resetUpload = () => {
    setFile(null);
    setUploadStatus("idle");
    setUploadProgress(0);
    setOutputFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle webcam start
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsWebcamActive(true)
      }
    } catch (error) {
      console.error("Error accessing webcam:", error)
    }
  }

  // Handle webcam stop
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setIsWebcamActive(false)
    }
  }

  // Capture frame from webcam
  const captureFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL("image/jpeg")
        setWebcamData(dataUrl)
        setIsModelReady(true)
      }
    }
  }

  // Handle live stream start
  const startLiveStream = async () => {
    if (!streamUrl) {
      setStreamError("Please enter a valid stream URL")
      return
    }

    setStreamError("")
    setIsStreaming(true)

    try {
      const endpoint = "http://127.0.0.1:8000/detect-video/"
      // Connect to FastAPI backend to process the stream
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ streamUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to start stream processing")
      }

      const data = await response.json()

      // Set the processed stream URL from the backend
      setProcessedStreamUrl(data.processedStreamUrl)
      setIsModelReady(true)
    } catch (error) {
      console.error("Error starting live stream:", error)
      setStreamError("Failed to connect to the stream. Please check the URL and try again.")
      setIsStreaming(false)
    }
  }

  // Handle live stream stop
  const stopLiveStream = async () => {
    try {
      // Notify the FastAPI backend to stop processing
      await fetch("http://127.0.0.1:8000/stop-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      setIsStreaming(false)
      setProcessedStreamUrl("")
    } catch (error) {
      console.error("Error stopping live stream:", error)
    }
  }

  // Run inference
  const runInference = async () => {
    setIsInferenceDialogOpen(true)

    try {
      // Determine which endpoint to use based on file type
      const endpoint = file && file.type.startsWith("image")
        ? "http://127.0.0.1:8000/detect-image/"
        : "http://127.0.0.1:8000/detect-video/";

      // Simulate API call to ML model endpoint
      setTimeout(() => {
        setInferenceResult("Object detected: Cat (confidence: 0.92)")
      }, 1500)
    } catch (error) {
      console.error("Error running inference:", error)
      setInferenceResult("Error: Failed to process the input")
    }
  }

  return (
    <div className="ml-interface">
      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { id: "upload", label: "File Upload" },
          { id: "webcam", label: "Webcam" },
          { id: "livestream", label: "Live Stream" },
        ]}
      >
        {activeTab === "upload" && (
          <Card title="Upload File" description="Upload an image file to process with the ML model">
            <div className="upload-container">
              <div className="upload-area">
                {uploadStatus === "uploaded" ? (
                  <div className="upload-complete">
                    <div className="icon-container success">
                      <Upload />
                    </div>
                    <p className="upload-status">Upload Complete</p>
                    <p className="file-name">{file?.name}</p>
                  </div>
                ) : (
                  <>
                    <div className="icon-container">
                      <Upload />
                    </div>
                    <p className="upload-text">Drag and drop your file here</p>
                    <p className="upload-subtext">or click to browse</p>
                    <input type="file" className="file-input" onChange={handleFileUpload}/>
                  </>
                )}
              </div>

              {uploadStatus === "uploading" && (
                <div className="progress-container">
                  <div className="progress-info">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-indicator" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}
            </div>
            {outputFile && (
            <div className="output-container">
            <h3>Processed Output:</h3>
            {fileType === "image" ? (
            <img src={`${outputFile}`} alt="Processed Output" className="output-image" />
          ) : (
            <video controls autoPlay className="output-video">
              <source src={`${outputFile}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}


              {uploadStatus === "uploaded" && (
                <div className="reset-container">
                  <Button onClick={resetUpload} className="reset-button">
                    Upload Another File
                  </Button>
                </div>
              )}

            <div className="card-footer">
              {isModelReady && (
                <Button onClick={runInference} className="inference-button">
                  <Zap />
                  Run Inference
                </Button>
              )}
            </div>
          </Card>
        )}

        {activeTab === "webcam" && (
          <Card title="Webcam Input" description="Use your webcam to capture input for the ML model">
            <div className="webcam-container">
              <div className="webcam-view">
                {webcamData ? (
                  <img src={webcamData || "/placeholder.svg"} alt="Captured frame" className="webcam-image" />
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted className="webcam-video" />
                )}

                {!isWebcamActive && !webcamData && (
                  <div className="webcam-placeholder">
                    <Camera />
                  </div>
                )}
              </div>

              <div className="webcam-controls">
                {!isWebcamActive ? (
                  <Button onClick={startWebcam} disabled={isWebcamActive} className="webcam-button">
                    <Play />
                    Start Webcam
                  </Button>
                ) : (
                  <>
                    <Button onClick={stopWebcam} variant="outline" className="webcam-button">
                      <Square />
                      Stop Webcam
                    </Button>
                    <Button onClick={captureFrame} variant="secondary" className="webcam-button">
                      <Camera />
                      Capture Frame
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="card-footer">
              {webcamData && isModelReady && (
                <Button onClick={runInference} className="inference-button">
                  <Zap />
                  Run Inference
                </Button>
              )}
            </div>
          </Card>
        )}

        {activeTab === "livestream" && (
          <Card title="Live Stream" description="Process a live video stream through the ML model">
            <div className="livestream-container">
              <div className="stream-input">
                <label htmlFor="stream-url" className="stream-label">
                  Stream URL
                </label>
                <div className="stream-url-container">
                  <input
                    id="stream-url"
                    type="text"
                    className="stream-url-input"
                    placeholder="Enter stream URL (RTSP, HLS, etc.)"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    disabled={isStreaming}
                  />
                  {!isStreaming ? (
                    <Button onClick={startLiveStream} className="stream-button">
                      <Play />
                      Start Stream
                    </Button>
                  ) : (
                    <Button onClick={stopLiveStream} variant="outline" className="stream-button">
                      <Square />
                      Stop Stream
                    </Button>
                  )}
                </div>
                {streamError && <p className="stream-error">{streamError}</p>}
              </div>

              <div className="stream-view">
                {processedStreamUrl ? (
                  <video src={processedStreamUrl} autoPlay playsInline controls className="stream-video" />
                ) : (
                  <div className="stream-placeholder">
                    <Video />
                    <p className="stream-placeholder-text">
                      {isStreaming ? "Connecting to stream..." : "Enter a URL and start streaming"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="card-footer">
              {processedStreamUrl && isModelReady && (
                <Button onClick={runInference} className="inference-button">
                  <Zap />
                  Run Inference
                </Button>
              )}
            </div>
          </Card>
        )}
      </Tabs>

      {isInferenceDialogOpen && (
        <Dialog
          title="Inference Results"
          description="Results from the ML model analysis"
          onClose={() => setIsInferenceDialogOpen(false)}
        >
          <div className="inference-content">
            {inferenceResult ? (
              <div className="inference-result">
                <h3 className="result-title">Prediction</h3>
                <p className="result-text">{inferenceResult}</p>
              </div>
            ) : (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <span className="loading-text">Processing...</span>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  )
}

export default MLInterface;