"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";


export default function DetectRiceDiseaseDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ class: string; confidence: number } | null>(null);
  const [allProbs, setAllProbs] = useState<Array<[string, number]>>([]);
  const [processedImg, setProcessedImg] = useState<string | null>(null);
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
    setProcessedImg(null);
    setAllProbs([]);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      // Expecting: { predicted_class: string, all_probs: [ [class, prob], ... ], processed_image }
      if (data && data.predicted_class && data.all_probs && data.all_probs.length > 0) {
        setResult({ class: data.predicted_class, confidence: data.all_probs[0][1] });
        setAllProbs(data.all_probs);
        if (data.processed_image) setProcessedImg(data.processed_image);
      } else {
        setError("Invalid API response");
      }
    } catch (err) {
      setError("Lỗi kết nối API hoặc dự đoán.");
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
          <Image
            width={320}
            height={240}
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
          {allProbs.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>All Predictions:</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f7f7f7' }}>
                    <th style={{ textAlign: 'left', padding: 4 }}>Disease</th>
                    <th style={{ textAlign: 'left', padding: 4 }}>Confidence (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {allProbs.map(([disease, prob]) => (
                    <tr key={disease}>
                      <td style={{ padding: 4 }}>{disease}</td>
                      <td style={{ padding: 4 }}>{(prob * 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {processedImg && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>Processed Image:</div>
              <Image
                width={320}
                height={240}
                src={`data:image/jpeg;base64,${processedImg}`}
                alt="Processed"
                style={{ width: 320, height: 240, objectFit: "cover", borderRadius: 8, border: '1px solid #ccc' }}
              />
            </div>
          )}
        </div>
      )}
      {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
    </div>
  );
}
