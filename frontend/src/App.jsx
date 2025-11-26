import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    axios
      .get("/api/hello")
      .then((res) => setMessage(res.data))
      .catch(() => setMessage("Backend not reachable"));
  }, []);

  return (
    <div style={{ padding: "50px", fontFamily: "Arial" }}>
      <h1>Campus LMS – Frontend</h1>
      <p>
        Message from backend: <strong>{message}</strong>
      </p>
      {message.includes("running") && (
        <p style={{ color: "green" }}>Full-stack connection successful!</p>
      )}
    </div>
  );
}

export default App;
