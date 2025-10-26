import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import { io } from "socket.io-client";

const API_BASE = "http://localhost:1337/graphql";
const SERVER_URL = "http://localhost:1337";

export default function DocRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [execOutput, setExecOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            query: `{
              document(id: \"${id}\") {
                _id
                title
                content
                docType
              }
            }`
          })
        });

        if (!res.ok) throw new Error("Not found");
        const { data } = await res.json();
        if (!data || !data.document) throw new Error("Document not found");

        if (!isMounted) return;

        const fetchedDoc = {
          id: String(data.document._id ?? data.document.id ?? id),
          title: data.document.title ?? "",
          content: data.document.content ?? "",
          docType: data.document.docType ?? "doc",
        };

        setDoc(fetchedDoc);

        socketRef.current = io(SERVER_URL);
        const socket = socketRef.current;

        socket.on("connect", () => {
          console.log("Connected to socket:", socket.id);
          socket.emit("create", fetchedDoc.id);
        });

        socket.on("doc", (data) => {
          setDoc((prev) =>
            prev && prev.id === data._id
              ? { ...prev, content: data.html }
              : prev
          );
        });
      } catch (e) {
        console.error(e);
        setDoc(null);
      }
    })();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [id]);

  async function handleLiveChange(e) {
    const newValue = e.target.value;
    setDoc((prev) => (prev ? { ...prev, content: newValue } : prev));

    if (doc?.id && socketRef.current) {
      const data = {
        _id: doc.id,
        html: newValue,
      };
      socketRef.current.emit("doc", data);
    }

    if (doc?.id) {
      await updateDocument(doc.id, doc.title, newValue, doc.docType);
    }
  }

  async function handleTitleChange(e) {
    const newTitle = e.target.value;
    setDoc((prev) => (prev ? { ...prev, title: newTitle } : prev));

    if (doc?.id) {
      await updateDocument(doc.id, newTitle, doc.content, doc.docType);
    }
  }

  async function updateDocument(id, title, content, docType) {
    const graphqlQuery = `mutation UpdateDocument($id: ID!, $title: String, $content: String, $docType: String) {
      updateDocument(id: $id, title: $title, content: $content, docType: $docType) {
        _id
        title
        content
        docType
      }
    }`;

    try {
      const res = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: {
            id: id,
            title: title || "",
            content: content || "",
            docType: docType || "doc",
          }
        }),
      });

      if (!res.ok) {
        console.error("Could not update document (network error)");
        return;
      }

      const result = await res.json();
      if (!result.data) {
        console.error("Could not update document (server error)");
      }
    } catch (err) {
      console.error("Error updating document:", err);
    }
  }

  function handleGoBack() {
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
      <button type="button" onClick={handleGoBack}>Back to Documents</button>
      <h2>Document</h2>
      <div className="new-doc">
        
        <label htmlFor="title">Title</label>
        <input 
          type="text" 
          name="title" 
          value={doc.title} 
          onChange={handleTitleChange}
        />

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
          <textarea
            name="content"
            value={doc.content}
            onChange={handleLiveChange}
          />
        )}
      </div>
    </>
  );
}
