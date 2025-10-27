import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:1337/graphql";

export default function LoginRegisterRoute() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitAuth() {
    setError("");
    setLoading(true);
    try {
      const registerMutation = `mutation Register($email: String!, $password: String!) {
        register(email: $email, password: $password) {
          _id
          email
          token
        }
      }`;

      const loginMutation = `mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          _id
          email
          token
        }
      }`;

      const graphqlQuery = mode === "register" ? registerMutation : loginMutation;

      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: graphqlQuery, variables: { email, password } }),
      });

      if (!res.ok) throw new Error(`Network error: ${res.status}`);

      const result = await res.json();
      if (result.errors && result.errors.length) {
        throw new Error(result.errors.map((e) => e.message).join('\n'));
      }

      const user = result?.data?.[mode === "register" ? "register" : "login"];
      if (!user) throw new Error("Invalid server response");

      localStorage.setItem("token", user.token || "");
      localStorage.setItem("user", JSON.stringify({ _id: user._id, email: user.email }));

      window.dispatchEvent(new Event("userChange"));
      navigate("//");
    } catch (err) {
      console.error(err);
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    submitAuth();
  }

  return (
    <div className="auth-route">
      <h2>{mode === "login" ? "Login" : "Register"}</h2>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setMode("login")} disabled={mode === "login"}>
          Login
        </button>
        <button onClick={() => setMode("register")} disabled={mode === "register"} style={{ marginLeft: 8 }}>
          Register
        </button>
      </div>

      <form onSubmit={onSubmit} className="auth-form">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? (mode === "register" ? "Registering..." : "Logging in...") : (mode === "register" ? "Register" : "Login")}
        </button>
      </form>
    </div>
  );
}
