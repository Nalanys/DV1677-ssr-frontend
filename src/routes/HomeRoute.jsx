import { useEffect, useState } from "react";
import DocsList from "../components/DocsList";
import CreateForm from "../components/CreateForm";

const API_BASE = "http://localhost:1337/graphql"

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function HomeRoute() {
  const [docs, setDocs] = useState([]);
  useEffect(() => {
    (async () => {
      
      try {
        const res = await fetch(`${API_BASE}`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            query: "{ documents { _id title } }"
          })
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const { data } = await res.json();
        const mapped = data.documents.map((d) => ({ id: String(d._id ?? d.id), title: d.title ?? "untitled" }));
        setDocs(mapped);
      } catch (e) {
        console.error(e);
        setDocs([]);
      }
    })();
  }, []);

  return (
    <>
      <DocsList docs={docs} />
      <br />
      <CreateForm />
    </>
  );
}
