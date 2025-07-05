"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DetectRiceDiseaseDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ class: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setResult(data);
    } catch (err) {
       console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
      <h2>Rice Disease Detection Demo</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={!file || loading} style={{ marginLeft: 12 }}>
          {loading ? "Detecting..." : "Detect Disease"}
        </button>
      </form>
      {file && (
        <div style={{ marginTop: 24, position: "relative", width: 320, height: 240, borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px #0001" }}>
          <img
            src={URL.createObjectURL(file)}
            alt="Uploaded"
            style={{ width: 320, height: 240, objectFit: "cover", borderRadius: 8, display: "block" }}
          />
          <AnimatePresence>
            {loading && (
              <motion.div
                key="scan"
                initial={{ y: -240, opacity: 0.7 }}
                animate={{ y: 240, opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop", ease: "linear" }}
                style={{
                  position: "absolute",
                  left: 0,
                  width: "100%",
                  height: 32,
                  background: "linear-gradient(90deg, #00eaff44 0%, #00eaffcc 50%, #00eaff44 100%)",
                  borderRadius: 8,
                  pointerEvents: "none",
                  zIndex: 2,
                  filter: "blur(1px)",
                }}
              />
            )}
          </AnimatePresence>
        </div>
      )}
      {result && (
        <div style={{ marginTop: 24 }}>
          <h3>Result</h3>
          <p><b>Disease:</b> {result.class}</p>
          <p><b>Confidence:</b> {(result.confidence * 100).toFixed(2)}%</p>
        </div>
      )}
      {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
    </div>
  );
}
