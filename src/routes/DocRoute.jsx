import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";

const API_BASE = "https://jsramverk-editor-alai20-sogi20-eaa9cxenbbfje6dt.northeurope-01.azurewebsites.net/";

export default function DocRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [execOutput, setExecOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

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
          docType: data.docType ?? "doc",
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

  async function handleExecute() {
    if (!doc?.content) return;
    setIsExecuting(true);
    setExecOutput("");
    try {
      const base64Code = btoa(doc.content);
      const res = await fetch("https://execjs.emilfolino.se/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: base64Code }),
      });
      if (!res.ok) throw new Error("Execution failed");
      const data = await res.json();
      const decoded = atob(data.data || "");
      setExecOutput(decoded);
    } catch (err) {
      console.error(err);
      setExecOutput(`Error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
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

        {doc.docType === "code" ? (
          <>
            <CodeEditor name="content" defaultValue={doc.content} />
            <button type="button" onClick={handleExecute} disabled={isExecuting}>
              {isExecuting ? "Executing code..." : "Execute Code"}
            </button>
            {execOutput ? <pre className="codeOutput">{execOutput}</pre> : null}
          </>
        ) : (
          <textarea name="content" defaultValue={doc.content} />
        )}

        <input type="submit" value="Update" />
      </form>
    </>
  );
}
