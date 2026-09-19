import { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import "./Login.css";

const MODEL_URL =
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

function Login() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [faceLoading, setFaceLoading] = useState(false);
  const [faceStatus, setFaceStatus] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Demo credentials for now
  const VALID_USERNAME = "admin";
  const VALID_PASSWORD = "admin123";

  useEffect(() => {
    loadFaceModels();

    return () => {
      stopCamera();
    };
  }, []);

  const loadFaceModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      setModelsLoaded(true);
      console.log("Face recognition models loaded");
    } catch (error) {
      console.error("Model loading error:", error);
      setFaceStatus("Face recognition could not be loaded.");
    }
  };

  const startCamera = async () => {
    try {
      setFaceLoading(true);
      setFaceStatus("Starting camera...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setFaceStatus("Look directly at the camera.");

      setTimeout(() => {
        recognizeFace();
      }, 1500);
    } catch (error) {
      console.error("Camera error:", error);
      setFaceStatus("Camera permission was denied or unavailable.");
      setFaceLoading(false);
    }
  };

  const recognizeFace = async () => {
    try {
      if (!modelsLoaded) {
        setFaceStatus("Face recognition is still loading...");
        return;
      }

      setFaceStatus("Checking your face...");

      // Get registered owner's reference image
      const registeredImage = await faceapi.fetchImage("/owner.jpg");

      const registeredFace = await faceapi
        .detectSingleFace(
          registeredImage,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!registeredFace) {
        setFaceStatus("Registered face could not be detected.");
        setFaceLoading(false);
        return;
      }

      // Detect face from live camera
      const liveFace = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!liveFace) {
        setFaceStatus("No face detected. Please look at the camera.");
        setFaceLoading(false);
        return;
      }

      const distance = faceapi.euclideanDistance(
        registeredFace.descriptor,
        liveFace.descriptor
      );

      console.log("Face distance:", distance);

      // Lower distance = more similar
      const MATCH_THRESHOLD = 0.5;

      if (distance < MATCH_THRESHOLD) {
        setFaceStatus("Face verified successfully.");

        stopCamera();

        setTimeout(() => {
          alert("Face login successful!");
        }, 300);
      } else {
        setFaceStatus("Face not recognized.");
        setFaceLoading(false);
      }
    } catch (error) {
      console.error("Face recognition error:", error);
      setFaceStatus("Face recognition failed.");
      setFaceLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }
  };

  const handleFaceLogin = () => {
    startCamera();
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (
      username === VALID_USERNAME &&
      password === VALID_PASSWORD
    ) {
      alert("Username and password login successful!");
    } else {
      alert("Invalid username or password.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* LEFT */}
        <div className="login-brand">
          <div className="brand-content">
            <p className="brand-small">WELCOME TO</p>

            <h1>
              FISAT
              <br />
              STORES
            </h1>

            <p className="brand-description">
              Store Management System
            </p>
          </div>

          <div className="brand-footer">
            <span>Secure</span>
            <span>•</span>
            <span>Simple</span>
            <span>•</span>
            <span>Efficient</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-form-section">

          <div className="login-header">
            <h2>Welcome back</h2>

            <p>
              Sign in to access the store dashboard
            </p>
          </div>

          {/* FACE LOGIN */}
          <div className="face-login">

            <div className="camera-box">

              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="camera-video"
              />

              {!streamRef.current && (
                <>
                  <div className="camera-icon">
                    <span>⌾</span>
                  </div>

                  <p>Face Recognition</p>

                  <small>
                    Use your registered face to sign in
                  </small>
                </>
              )}

            </div>

            <button
              type="button"
              className="face-button"
              onClick={handleFaceLogin}
              disabled={faceLoading}
            >
              {faceLoading
                ? "Checking..."
                : "Login with Face"}
            </button>

            {faceStatus && (
              <small className="face-status">
                {faceStatus}
              </small>
            )}

          </div>

          {/* DIVIDER */}
          <div className="divider">
            <span></span>
            <p>OR</p>
            <span></span>
          </div>

          {/* USERNAME/PASSWORD */}
          <form onSubmit={handleLogin}>

            <div className="input-group-custom">
              <label>Username</label>

              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                required
              />
            </div>

            <div className="input-group-custom">

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>

            <button
              type="submit"
              className="login-button"
            >
              Sign in
            </button>

          </form>

          <div className="security-note">
            🔒 Authorized personnel only
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;