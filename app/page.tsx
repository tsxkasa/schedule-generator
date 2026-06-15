"use client";
import { useState, useEffect } from "react";
import FullSchedulePreview, { generateSchedule } from "./schedule_gen";
import { ScheduleData } from "./types";

export default function Page() {
  const [studentId, setStudentId] = useState("");
  const [theme, setTheme] = useState("default");
  const [allScheduleData, setAllScheduleData] = useState<ScheduleData | null>(
    null,
  );
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [generatedImage, setGeneratedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const response = await fetch("/sched.json");
        if (!response.ok) throw new Error("Failed to fetch schedule");
        const data: ScheduleData = await response.json();
        setAllScheduleData(data);
        setError("");
        console.log("Loaded schedule:", data);
      } catch (error) {
        console.error("Failed to load schedule:", error);
        setError(
          "Failed to load schedule. Make sure /public/sched.json exists.",
        );
      }
    };
    loadSchedule();
  }, []);

  const handleStudentIdChange = (id: string) => {
    setStudentId(id);

    if (!id.trim()) {
      setScheduleData(null);
      return;
    }

    if (!allScheduleData) {
      setError("Schedule data not loaded yet");
      return;
    }

    if (allScheduleData.student_id.toString() === id) {
      setScheduleData(allScheduleData);
      setError("");
    } else {
      setScheduleData(null);
      setError(`Student ID ${id} not found in schedule`);
    }
  };

  const handleGenerateSchedule = async () => {
    if (!scheduleData) {
      setError("No schedule loaded for this student");
      return;
    }

    setLoading(true);

    try {
      const image = await generateSchedule(scheduleData, theme);
      if (image) {
        setGeneratedImage(image);
      }
    } catch (error) {
      console.error("Generation failed:", error);
      setError("Failed to generate schedule image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "16px", maxWidth: "1600px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "16px" }}>Schedule Generator</h1>

      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "16px",
          alignItems: "flex-end",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Student ID
          </label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => handleStudentIdChange(e.target.value)}
            placeholder={
              allScheduleData
                ? allScheduleData.student_id.toString()
                : "Enter Student ID"
            }
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              width: "150px",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            Theme
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          >
            <option value="default">Default</option>
            <option value="dark">Dark</option>
            <option value="blue">Blue</option>
          </select>
        </div>

        <button
          onClick={handleGenerateSchedule}
          disabled={loading || !scheduleData}
          style={{
            padding: "8px 16px",
            background: "#2196f3",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading || !scheduleData ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            opacity: loading || !scheduleData ? 0.5 : 1,
          }}
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#ffebee",
            color: "#c62828",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <hr style={{ margin: "16px 0" }} />

      {scheduleData && (
        <div
          style={{
            position: "absolute",
            left: "-99999px",
            top: 0,
          }}
        >
          <FullSchedulePreview scheduleData={scheduleData} theme={theme} />
        </div>
      )}

      {!generatedImage && !scheduleData && (
        <div
          style={{ padding: "40px 20px", textAlign: "center", color: "#999" }}
        >
          {studentId
            ? "Student ID not found"
            : "Enter a Student ID and click Generate to view schedule"}
        </div>
      )}

      <h2>Generated Output</h2>
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "20px",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {generatedImage ? (
          <div style={{ width: "100%" }}>
            <img
              src={generatedImage}
              alt="Generated Schedule"
              style={{ width: "100%" }}
            />
            <a
              href={generatedImage}
              download="schedule.png"
              style={{
                display: "block",
                textAlign: "center",
                color: "#2196f3",
                textDecoration: "underline",
                marginTop: "12px",
                fontSize: "14px",
              }}
            >
              Download Image
            </a>
          </div>
        ) : (
          <span style={{ color: "#999", fontSize: "14px" }}>
            No schedule generated yet
          </span>
        )}
      </div>
    </main>
  );
}
