import { useEffect, useRef, useState } from "react";
import "./Settings.css";

const API_BASE_URL = "http://localhost:5000/api";

export default function Settings() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("staff"); // "staff" | "face"

  // Staff Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "Staff",
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState({ type: "", message: "" });
  const [searchQuery, setSearchQuery] = useState("");

  // Face Registration State
  const [selectedUserId, setSelectedUserId] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [faceFeedback, setFaceFeedback] = useState({ type: "", message: "" });

  // Camera Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ======================================================
  // 1. FETCH USERS
  // ======================================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/users`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.users || [];
      setUsers(list);

      // Default select the first user for face registration if none selected
      if (!selectedUserId && list.length > 0) {
        setSelectedUserId(list[0]._id || list[0].id);
      }
    } catch (err) {
      console.error("Failed to load staff users:", err);
      setFormFeedback({
        type: "error",
        message: "Cannot connect to server. Ensure backend is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Stop camera tracks when unmounting or switching to staff tab
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (activeTab === "face" && !cameraActive) {
      startCamera();
    } else if (activeTab === "staff" && cameraActive) {
      stopCamera();
    }
  }, [activeTab]);

  // ======================================================
  // 2. CAMERA CONTROLS
  // ======================================================

  const startCamera = async () => {
    setCameraError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam access is not supported by this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.log("Video play err:", e));
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission denied. Please allow camera access in your browser."
          : `Camera error: ${err.message || "Could not start camera."}`
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // ======================================================
  // 3. CAPTURE & REGISTER FACE
  // ======================================================

  const handleCaptureFace = async () => {
    if (!selectedUserId) {
      setFaceFeedback({
        type: "error",
        message: "Please select a staff member first.",
      });
      return;
    }

    if (!videoRef.current || !canvasRef.current) {
      setFaceFeedback({
        type: "error",
        message: "Camera stream is not ready for capture.",
      });
      return;
    }

    try {
      setCapturing(true);
      setFaceFeedback({ type: "", message: "" });

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, width, height);

      // Convert to base64 JPEG
      const base64Image = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedPreview(base64Image);

      // Post to backend
      const res = await fetch(`${API_BASE_URL}/users/${selectedUserId}/face`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faceData: base64Image }),
      });

      const result = await res.json();

      if (res.ok) {
        const targetUser = users.find(
          (u) => (u._id || u.id) === selectedUserId
        );
        setFaceFeedback({
          type: "success",
          message: `Biometric face registered successfully for "${
            targetUser?.name || "Staff Member"
          }"!`,
        });

        // Update local user record
        setUsers((prev) =>
          prev.map((u) =>
            (u._id || u.id) === selectedUserId
              ? { ...u, faceData: base64Image }
              : u
          )
        );
      } else {
        setFaceFeedback({
          type: "error",
          message: result.message || "Failed to save face data.",
        });
      }
    } catch (err) {
      console.error("Face capture error:", err);
      setFaceFeedback({
        type: "error",
        message: "Could not send face data to server.",
      });
    } finally {
      setCapturing(false);
    }
  };

  // ======================================================
  // 4. STAFF FORM HANDLERS
  // ======================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormFeedback({ type: "", message: "" });

    // Basic Validation
    if (!formData.name.trim()) {
      setFormFeedback({ type: "error", message: "Please enter staff name." });
      return;
    }
    if (!formData.email.trim()) {
      setFormFeedback({ type: "error", message: "Please enter valid email." });
      return;
    }
    if (!formData.username.trim()) {
      setFormFeedback({ type: "error", message: "Please enter username." });
      return;
    }
    if (!editingUserId && !formData.password) {
      setFormFeedback({
        type: "error",
        message: "Password is required for new users.",
      });
      return;
    }

    try {
      setFormSubmitting(true);

      if (editingUserId) {
        // UPDATE EXISTING USER
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          username: formData.username.trim().toLowerCase(),
          role: formData.role,
        };
        // Only include password if user typed a new one
        if (formData.password && formData.password.trim().length > 0) {
          payload.password = formData.password.trim();
        }

        const res = await fetch(`${API_BASE_URL}/users/${editingUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();

        if (res.ok) {
          setFormFeedback({
            type: "success",
            message: `Staff member "${result.user?.name}" updated successfully.`,
          });
          setUsers((prev) =>
            prev.map((u) =>
              (u._id || u.id) === editingUserId
                ? { ...u, ...result.user }
                : u
            )
          );
          setEditingUserId(null);
          setFormData({
            name: "",
            email: "",
            username: "",
            password: "",
            role: "Staff",
          });
        } else {
          setFormFeedback({
            type: "error",
            message: result.message || "Failed to update staff member.",
          });
        }
      } else {
        // REGISTER NEW USER
        const res = await fetch(`${API_BASE_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            username: formData.username.trim().toLowerCase(),
            password: formData.password,
            role: formData.role,
          }),
        });

        const result = await res.json();

        if (res.ok) {
          setFormFeedback({
            type: "success",
            message: `Staff member "${result.user?.name}" created successfully!`,
          });
          setUsers((prev) => [result.user, ...prev]);
          setFormData({
            name: "",
            email: "",
            username: "",
            password: "",
            role: "Staff",
          });
        } else {
          setFormFeedback({
            type: "error",
            message: result.message || "Failed to register staff member.",
          });
        }
      }
    } catch (err) {
      console.error("Save staff error:", err);
      setFormFeedback({
        type: "error",
        message: "Server connection failed.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUserId(user._id || user.id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      username: user.username || "",
      password: "", // Leave blank to keep existing
      role: user.role || "Staff",
    });
    setFormFeedback({ type: "", message: "" });
    setActiveTab("staff");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setFormData({
      name: "",
      email: "",
      username: "",
      password: "",
      role: "Staff",
    });
    setFormFeedback({ type: "", message: "" });
  };

  const handleDeleteUser = async (user) => {
    const userId = user._id || user.id;
    const confirm = window.confirm(
      `Are you sure you want to delete staff account "${user.name}" (@${user.username})?\n\nThis will remove their system credentials and biometric face login.`
    );

    if (!confirm) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => (u._id || u.id) !== userId));
        if (selectedUserId === userId) {
          const remaining = users.filter((u) => (u._id || u.id) !== userId);
          setSelectedUserId(remaining[0]?._id || remaining[0]?.id || "");
        }
        setFormFeedback({
          type: "success",
          message: `Staff member "${user.name}" has been removed.`,
        });
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.message || "Failed to delete staff member."}`);
      }
    } catch (err) {
      console.error("Delete user error:", err);
      alert("Could not reach server to delete user.");
    }
  };

  const handleGoToFaceRegistration = (userId) => {
    setSelectedUserId(userId);
    setActiveTab("face");
    setFaceFeedback({ type: "", message: "" });
    setCapturedPreview(null);
  };

  // Filtered users for directory search
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const selectedUserObj = users.find(
    (u) => (u._id || u.id) === selectedUserId
  );

  const enrolledCount = users.filter((u) => !!u.faceData).length;

  return (
    <div className="settings-main">
      {/* Header */}
      <header className="settings-header">
        <div>
          <p className="settings-label">STORE MANAGEMENT</p>
          <h1>Settings & Staff Access</h1>
          <p className="settings-subtitle">
            Manage staff accounts, login credentials, and facial biometric enrollment for POS counter access.
          </p>
        </div>

        {/* Global Stats Pill */}
        <div className="settings-stat-pill">
          <div className="stat-pill-item">
            <span className="stat-pill-label">Total Staff</span>
            <strong>{users.length}</strong>
          </div>
          <div className="stat-pill-divider" />
          <div className="stat-pill-item">
            <span className="stat-pill-label">Face Enrolled</span>
            <strong className="stat-pill-highlight">
              {enrolledCount}/{users.length}
            </strong>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="settings-tabs-bar">
        <button
          type="button"
          className={`settings-tab-btn ${
            activeTab === "staff" ? "active" : ""
          }`}
          onClick={() => setActiveTab("staff")}
        >
          <span className="tab-icon">👥</span>
          <span>Staff Management</span>
          <span className="tab-badge">{users.length}</span>
        </button>

        <button
          type="button"
          className={`settings-tab-btn ${activeTab === "face" ? "active" : ""}`}
          onClick={() => setActiveTab("face")}
        >
          <span className="tab-icon">👤</span>
          <span>Face Biometric Registration</span>
          <span className="tab-badge highlight">{enrolledCount} enrolled</span>
        </button>
      </div>

      {/* ======================================================
          TAB 1: STAFF MANAGEMENT
      ====================================================== */}
      {activeTab === "staff" && (
        <div className="settings-staff-layout">
          {/* Left: Register / Edit Staff Form */}
          <section className="settings-card form-card">
            <div className="card-header">
              <div className="card-header-icon">
                {editingUserId ? "✎" : "＋"}
              </div>
              <div>
                <h2>
                  {editingUserId ? "Edit Staff Account" : "Register New Staff"}
                </h2>
                <p>
                  {editingUserId
                    ? "Update credentials or role for this staff member."
                    : "Create POS register access for store personnel."}
                </p>
              </div>
            </div>

            {formFeedback.message && (
              <div
                className={`feedback-banner ${formFeedback.type}`}
                role="alert"
              >
                <span>{formFeedback.type === "success" ? "✓" : "⚠"}</span>
                <span>{formFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="staff-form">
              <div className="form-group">
                <label htmlFor="staff-name">Full Name *</label>
                <input
                  id="staff-name"
                  type="text"
                  name="name"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="staff-email">Email Address *</label>
                <input
                  id="staff-email"
                  type="email"
                  name="email"
                  placeholder="rahul@fisat.ac.in"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="staff-username">Username *</label>
                  <input
                    id="staff-username"
                    type="text"
                    name="username"
                    placeholder="e.g. rahul01"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="staff-role">Role</label>
                  <select
                    id="staff-role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="Staff">Staff / Cashier</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="staff-password">
                  {editingUserId
                    ? "New Password (leave blank to keep current)"
                    : "Password *"}
                </label>
                <input
                  id="staff-password"
                  type="password"
                  name="password"
                  placeholder={
                    editingUserId
                      ? "•••••••• (unchanged)"
                      : "Create secure password"
                  }
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingUserId}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-actions">
                {editingUserId && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting
                    ? "Saving..."
                    : editingUserId
                    ? "✓ Update Staff Member"
                    : "＋ Register Staff"}
                </button>
              </div>
            </form>
          </section>

          {/* Right: Staff Directory Table */}
          <section className="settings-card list-card">
            <div className="card-header list-header">
              <div>
                <h2>Current Staff Members ({users.length})</h2>
                <p>All accounts authorized to log in to the POS system.</p>
              </div>

              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Filter by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner" />
                <p>Loading registered accounts...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No staff members found</h3>
                <p>
                  {searchQuery
                    ? "Try adjusting your search query."
                    : "Register your first staff member using the form on the left."}
                </p>
              </div>
            ) : (
              <div className="staff-table-wrapper">
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Biometrics</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const uId = u._id || u.id;
                      const hasFace = !!u.faceData;

                      return (
                        <tr key={uId}>
                          <td>
                            <div className="staff-profile">
                              <div className="staff-avatar">
                                {hasFace && typeof u.faceData === "string" ? (
                                  <img
                                    src={u.faceData}
                                    alt={u.name}
                                    className="avatar-img"
                                  />
                                ) : (
                                  <span className="avatar-initials">
                                    {u.name ? u.name[0].toUpperCase() : "U"}
                                  </span>
                                )}
                              </div>
                              <div className="staff-info">
                                <strong>{u.name}</strong>
                                <span className="staff-username">
                                  @{u.username}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="staff-email-cell">{u.email}</td>

                          <td>
                            <span
                              className={`role-badge ${String(
                                u.role
                              ).toLowerCase()}`}
                            >
                              {u.role || "Staff"}
                            </span>
                          </td>

                          <td>
                            {hasFace ? (
                              <span className="face-status enrolled">
                                <span className="status-dot green" />
                                Face Enrolled
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="face-status-action"
                                onClick={() => handleGoToFaceRegistration(uId)}
                                title="Click to enroll face now"
                              >
                                <span className="status-dot gray" />
                                Enroll Face →
                              </button>
                            )}
                          </td>

                          <td>
                            <div className="table-actions">
                              <button
                                type="button"
                                className="btn-icon-action edit"
                                onClick={() => handleEditUser(u)}
                                title="Edit user details"
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                className="btn-icon-action delete"
                                onClick={() => handleDeleteUser(u)}
                                title="Delete user"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ======================================================
          TAB 2: FACE REGISTRATION
      ====================================================== */}
      {activeTab === "face" && (
        <div className="settings-face-layout">
          {/* Top selection card */}
          <section className="settings-card face-user-selector-card">
            <div className="face-selector-content">
              <div>
                <h2>Select Staff Member for Biometric Enrollment</h2>
                <p>
                  Choose an account from the directory, align the face within the camera viewport, and click Capture Face.
                </p>
              </div>

              <div className="user-dropdown-wrapper">
                <label htmlFor="face-user-select">Staff Account:</label>
                <select
                  id="face-user-select"
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    setCapturedPreview(null);
                    setFaceFeedback({ type: "", message: "" });
                  }}
                  className="user-select-dropdown"
                >
                  {users.map((u) => {
                    const id = u._id || u.id;
                    return (
                      <option key={id} value={id}>
                        {u.name} (@{u.username}) — {u.faceData ? "✓ Enrolled" : "○ Pending"}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </section>

          {/* Feedback banner if present */}
          {faceFeedback.message && (
            <div
              className={`feedback-banner ${faceFeedback.type}`}
              style={{ marginBottom: "20px" }}
              role="alert"
            >
              <span>{faceFeedback.type === "success" ? "✓" : "⚠"}</span>
              <span>{faceFeedback.message}</span>
            </div>
          )}

          {/* Camera & Preview Grid */}
          <div className="face-capture-grid">
            {/* Live Camera Viewport Card */}
            <section className="settings-card camera-card">
              <div className="camera-card-header">
                <div className="camera-status-indicator">
                  <span
                    className={`live-dot ${cameraActive ? "pulsing" : "off"}`}
                  />
                  <span>
                    {cameraActive
                      ? "Webcam Active • Live Feed"
                      : "Webcam Inactive"}
                  </span>
                </div>

                <div className="camera-header-controls">
                  {cameraActive ? (
                    <button
                      type="button"
                      className="btn-camera-toggle off"
                      onClick={stopCamera}
                    >
                      Stop Camera
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-camera-toggle on"
                      onClick={startCamera}
                    >
                      Start Camera
                    </button>
                  )}
                </div>
              </div>

              {cameraError ? (
                <div className="camera-error-box">
                  <div className="error-icon">📷</div>
                  <h4>Camera Access Notice</h4>
                  <p>{cameraError}</p>
                  <button
                    type="button"
                    className="btn-retry"
                    onClick={startCamera}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="camera-viewport">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="camera-video-element"
                  />

                  {/* Biometric Face Guide Overlay */}
                  <div className="biometric-guide-overlay">
                    <div className="guide-oval">
                      <div className="guide-corner top-left" />
                      <div className="guide-corner top-right" />
                      <div className="guide-corner bottom-left" />
                      <div className="guide-corner bottom-right" />
                      <div className="scan-line" />
                    </div>
                    <span className="guide-caption">
                      Center face inside the guide frame
                    </span>
                  </div>
                </div>
              )}

              {/* Hidden Canvas for capture processing */}
              <canvas ref={canvasRef} style={{ display: "none" }} />

              <div className="camera-actions-bar">
                <button
                  type="button"
                  className="btn-capture-face"
                  onClick={handleCaptureFace}
                  disabled={!cameraActive || capturing || !selectedUserId}
                >
                  <span className="capture-icon">📸</span>
                  <span>
                    {capturing
                      ? "Enrolling Face..."
                      : `Capture Face for ${
                          selectedUserObj?.name?.split(" ")[0] || "Staff"
                        }`}
                  </span>
                </button>
              </div>
            </section>

            {/* Profile & Biometrics Details Card */}
            <section className="settings-card face-details-card">
              <div className="card-header">
                <div className="card-header-icon">🆔</div>
                <div>
                  <h2>Biometric Record</h2>
                  <p>Active face profile for selected staff account.</p>
                </div>
              </div>

              {selectedUserObj ? (
                <div className="enrolled-profile-details">
                  <div className="profile-summary-header">
                    <div className="profile-large-avatar">
                      {capturedPreview ? (
                        <img
                          src={capturedPreview}
                          alt="Captured Face"
                          className="preview-img"
                        />
                      ) : selectedUserObj.faceData &&
                        typeof selectedUserObj.faceData === "string" ? (
                        <img
                          src={selectedUserObj.faceData}
                          alt={selectedUserObj.name}
                          className="preview-img"
                        />
                      ) : (
                        <div className="placeholder-avatar">
                          <span>👤</span>
                          <small>No Face</small>
                        </div>
                      )}
                    </div>

                    <div className="profile-meta">
                      <h3>{selectedUserObj.name}</h3>
                      <span className="meta-username">
                        @{selectedUserObj.username}
                      </span>
                      <span
                        className={`role-badge ${String(
                          selectedUserObj.role
                        ).toLowerCase()}`}
                      >
                        {selectedUserObj.role || "Staff"}
                      </span>
                    </div>
                  </div>

                  <div className="biometric-info-box">
                    <div className="info-row">
                      <span className="info-label">Face Authentication:</span>
                      <strong
                        className={`info-value ${
                          selectedUserObj.faceData || capturedPreview
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {selectedUserObj.faceData || capturedPreview
                          ? "✓ Active (Enrolled)"
                          : "○ Not Registered"}
                      </strong>
                    </div>

                    <div className="info-row">
                      <span className="info-label">Account Email:</span>
                      <span className="info-value">
                        {selectedUserObj.email}
                      </span>
                    </div>

                    <div className="info-row">
                      <span className="info-label">Storage Format:</span>
                      <span className="info-value">
                        High-Resolution RGB Descriptor
                      </span>
                    </div>
                  </div>

                  <div className="biometric-instructions">
                    <h4>💡 Tips for high-accuracy face recognition:</h4>
                    <ul>
                      <li>Ensure front-facing lighting with minimal shadows.</li>
                      <li>Look straight into the lens without tilting.</li>
                      <li>Remove dark sunglasses or face coverings.</li>
                      <li>Both face and credentials will be verified at login.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>Select a staff member to view biometric enrollment.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
