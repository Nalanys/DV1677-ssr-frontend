import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "https://jsramverk-editor-alai20-sogi20-eaa9cxenbbfje6dt.northeurope-01.azurewebsites.net/"

export default function DocRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/${id}`, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setDoc({
          id: String(data._id ?? data.id ?? id),
          title: data.title ?? "",
          content: data.content ?? "",
        });
      } catch (e) {
        console.error(e);
        setDoc(null);
      }
    })();
  }, [id]);

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd);

    const res = await fetch(`${API_BASE}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Could not update document");
      return;
    }
    navigate("/");
  }

  if (!doc) return <p>Loading...</p>;

  return (
    <>
      <h2>Document</h2>
      <form className="new-doc" onSubmit={onSubmit}>
        <input type="hidden" name="id" value={doc.id} />

        <label htmlFor="title">Title</label>
        <input type="text" name="title" defaultValue={doc.title} />

        <label htmlFor="content">Content</label>
        <textarea name="content" defaultValue={doc.content} />

        <input type="submit" value="Update" />
      </form>
    </>
  );
}
