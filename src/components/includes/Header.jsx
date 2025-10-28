import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    function syncUser() {
      try {
        const raw = localStorage.getItem("user");
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    }

    syncUser();

    window.addEventListener("storage", syncUser);
    window.addEventListener("userChange", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("userChange", syncUser);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userChange")); 
    setUser(null);
    navigate("/user");
  }

  return (
    <header>
      <h1>SSR Editor</h1>
      <nav>
        {user ? (
          <div className="header-user">
            <span>Welcome, {user.email}</span>
            <button onClick={handleLogout} style={{ marginLeft: 8 }}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/user">Login / Register</Link>
        )}
      </nav>
    </header>
  );
}
