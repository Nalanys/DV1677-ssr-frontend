import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CodeEditor from "./CodeEditor";

const API_BASE = "https://jsramverk-editor-alai20-sogi20-eaa9cxenbbfje6dt.northeurope-01.azurewebsites.net/";

export default function CreateForm() {
  const navigate = useNavigate();
  const [isCode, setIsCode] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd);

    const res = await fetch(`${API_BASE}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Could not create document");
      return;
    }

    const { id } = await res.json();
    navigate(`/${id}`);
  }

  return (
    <>
      <h2>Create New Document</h2>
      <form className="new-doc" onSubmit={onSubmit}>
        <label htmlFor="title">Title</label>
        <input type="text" name="title" defaultValue="" />

        <label>
          <input
            type="checkbox"
            checked={isCode}
            onChange={(e) => setIsCode(e.target.checked)}
          />
          Code mode
        </label>

        <input type="hidden" name="docType" value={isCode ? "code" : "doc"} />

        <label htmlFor="content">Content</label>

        {isCode ? (
          <CodeEditor name="content" defaultValue="" />
        ) : (
          <textarea name="content" defaultValue="" />
        )}

        <input type="submit" value="Create" />
      </form>
    </>
  );
}
