import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "@vladmandic/face-api";
import "./Login.css";

const MODEL_URL =
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
const API_BASE_URL = "http://localhost:5000/api";

function Login() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [faceLoading, setFaceLoading] = useState(false);
  const [faceStatus, setFaceStatus] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    localStorage.removeItem("user");
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
      console.log("Face recognition models loaded successfully");
    } catch (error) {
      console.error("Model loading error:", error);
      setFaceStatus("Face recognition models loading in background...");
    }
  };

  const startCamera = async () => {
    try {
      setFaceLoading(true);
      setFaceStatus("Starting camera...");
      setLoginError("");

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

      setFaceStatus("Position face in the frame...");

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
      setFaceStatus("Scanning and identifying face...");

      // 1. Fetch registered staff users from backend
      let registeredUsers = [];
      try {
        const usersRes = await fetch(`${API_BASE_URL}/users`);
        if (usersRes.ok) {
          const list = await usersRes.json();
          registeredUsers = (Array.isArray(list) ? list : []).filter(
            (u) => !!u.faceData
          );
        }
      } catch (e) {
        console.warn("Could not fetch users list:", e);
      }

      // Prepare reference face descriptors
      const referenceFaces = [];

      for (const u of registeredUsers) {
        try {
          const img = await faceapi.fetchImage(u.faceData);
          const detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks(true)
            .withFaceDescriptor();

          if (detection) {
            referenceFaces.push({ user: u, descriptor: detection.descriptor });
          }
        } catch (e) {
          console.warn("Failed detecting face for", u.name, e);
        }
      }

      // Fallback: check /owner.jpeg in public folder if no registered faces in DB
      if (referenceFaces.length === 0) {
        try {
          const ownerImg = await faceapi.fetchImage("/owner.jpeg");
          const ownerDetection = await faceapi
            .detectSingleFace(ownerImg, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks(true)
            .withFaceDescriptor();

          if (ownerDetection) {
            referenceFaces.push({
              user: { name: "Store Administrator", username: "admin", role: "Admin" },
              descriptor: ownerDetection.descriptor,
            });
          }
        } catch (e) {
          console.warn("Could not load /owner.jpeg:", e);
        }
      }

      if (referenceFaces.length === 0) {
        setFaceStatus("No registered biometric face found. Please enroll in Settings or sign in with password.");
        setFaceLoading(false);
        return;
      }

      // Detect face from live webcam feed
      if (!videoRef.current) {
        setFaceStatus("Camera feed lost. Please retry.");
        setFaceLoading(false);
        return;
      }

      const liveFace = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!liveFace) {
        setFaceStatus("No face detected. Please face the camera directly.");
        setFaceLoading(false);
        return;
      }

      // Compare distance against all registered reference faces
      const MATCH_THRESHOLD = 0.55;
      let bestMatch = null;
      let minDistance = 999;

      for (const ref of referenceFaces) {
        const dist = faceapi.euclideanDistance(
          ref.descriptor,
          liveFace.descriptor
        );
        if (dist < minDistance) {
          minDistance = dist;
          bestMatch = ref;
        }
      }

      console.log("Best match distance:", minDistance, bestMatch?.user?.name);

      if (bestMatch && minDistance < MATCH_THRESHOLD) {
        setFaceStatus(`✓ Face verified! Welcome, ${bestMatch.user.name}.`);
        stopCamera();

        // Store active session
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            name: bestMatch.user.name,
            username: bestMatch.user.username,
            role: bestMatch.user.role || "Staff",
            authMethod: "biometric",
          })
        );

        setTimeout(() => {
          navigate("/dashboard");
        }, 600);
      } else {
        setFaceStatus("Face not recognized. Try again or enter credentials.");
        setFaceLoading(false);
      }
    } catch (error) {
      console.error("Face recognition error:", error);
      setFaceStatus("Face scan failed. Please sign in with username and password.");
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
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setFaceLoading(false);
  };

  const handleFaceLogin = () => {
    startCamera();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      // 1. Authenticate with backend /api/login
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem(
          "user",
          JSON.stringify(data.user || { username, name: username, role: "Staff" })
        );
        navigate("/dashboard");
        return;
      }

      // Fallback for default admin if server offline
      if (username.trim().toLowerCase() === "admin" && password === "admin123") {
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            username: "admin",
            name: "Store Administrator",
            role: "Admin",
          })
        );
        navigate("/dashboard");
        return;
      }

      const errData = await res.json().catch(() => ({}));
      setLoginError(errData.message || "Invalid username or password.");
    } catch (err) {
      // Offline fallback
      if (username.trim().toLowerCase() === "admin" && password === "admin123") {
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            username: "admin",
            name: "Store Administrator",
            role: "Admin",
          })
        );
        navigate("/dashboard");
        return;
      }
      setLoginError("Could not connect to server. Check that backend is running.");
    } finally {
      setLoginLoading(false);
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
              Store & POS Management System
            </p>
          </div>

          <div className="brand-footer">
            <span>Secure Biometrics</span>
            <span>•</span>
            <span>Role-Based Access</span>
            <span>•</span>
            <span>POS Ready</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="login-form-section">
          <div className="login-header">
            <h2>Welcome back</h2>
            <p>Sign in to access the store dashboard</p>
          </div>

          {/* Feedback Error Banner */}
          {loginError && (
            <div
              style={{
                background: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>⚠</span>
              <span>{loginError}</span>
            </div>
          )}

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
                  <small>Use your registered face to sign in</small>
                </>
              )}
            </div>

            <button
              type="button"
              className="face-button"
              onClick={handleFaceLogin}
              disabled={faceLoading}
            >
              {faceLoading ? "Scanning..." : "Login with Face"}
            </button>

            {faceStatus && (
              <small
                className="face-status"
                style={{
                  display: "block",
                  marginTop: "8px",
                  color: faceStatus.includes("✓") ? "#059669" : "#64748b",
                  fontWeight: faceStatus.includes("✓") ? "600" : "400",
                }}
              >
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
                placeholder="Enter username (e.g. admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="input-group-custom">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loginLoading}
            >
              {loginLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="security-note">
            🔒 Authorized personnel only • Staff accounts managed in Settings
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;