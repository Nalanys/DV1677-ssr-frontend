import { useEffect, useState } from "react";
import DocsList from "../components/DocsList";
import CreateForm from "../components/CreateForm";

const API_BASE = "https://jsramverk-editor-alai20-sogi20-eaa9cxenbbfje6dt.northeurope-01.azurewebsites.net/"

export default function HomeRoute() {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/`, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("Failed to fetch");
        const raw = await res.json();
        const mapped = raw.map((d) => ({ id: String(d._id ?? d.id), title: d.title ?? "untitled" }));
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
