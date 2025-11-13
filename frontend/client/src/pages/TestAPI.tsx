import { API_BASE_URL, API_V1_PREFIX } from "@/const";

export default function TestAPI() {
  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>API Configuration Test</h1>
      <div style={{ marginTop: "20px" }}>
        <p><strong>API_BASE_URL:</strong> {API_BASE_URL}</p>
        <p><strong>API_V1_PREFIX:</strong> {API_V1_PREFIX}</p>
        <p><strong>Full API URL:</strong> {API_BASE_URL}{API_V1_PREFIX}</p>
        <p><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || "undefined"}</p>
        <p><strong>VITE_API_BASE_URL:</strong> {import.meta.env.VITE_API_BASE_URL || "undefined"}</p>
      </div>
    </div>
  );
}
