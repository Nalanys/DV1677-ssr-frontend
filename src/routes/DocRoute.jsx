import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";

const API_BASE = "http://localhost:1337/graphql";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function DocRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [execOutput, setExecOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");

  useEffect(() => {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}`, {
            method: "POST",
            headers: getAuthHeaders(),
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
          setDoc({
            id: String(data.document._id ?? data.document.id ?? id),
            title: data.document.title ?? "",
            content: data.document.content ?? "",
            docType: data.document.docType ?? "doc",
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
    const graphqlQuery = `mutation UpdateDocument($id: ID!, $title: String, $content: String, $docType: String) {
      updateDocument(id: $id, title: $title, content: $content, docType: $docType) {
        _id
        title
        content
        docType
      }
    }`;
    const res = await fetch(`${API_BASE}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        query: graphqlQuery,
        variables: {
          id: payload.id,
          title: payload.title || "",
          content: payload.content || "",
          docType: payload.docType || "doc",
        }
      }),
    });

    if (!res.ok) {
      alert("Could not update document (network error)");
      return;
    }

    const result = await res.json();
    if (result == 0) {
      alert("Could not update document (server error)");
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
        headers: getAuthHeaders(),
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

  async function handleInviteSubmit(e) {
    e.preventDefault();
    setInviteStatus("");
    if (!inviteEmail) {
      setInviteStatus("Please enter an email address.");
      return;
    }
    const graphqlQuery = `mutation InviteUserToDocument($documentId: ID!, $email: String!) {
      inviteUserToDocument(documentId: $documentId, email: $email) {
        _id
        title
      }
    }`;
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        query: graphqlQuery,
        variables: {
          documentId: doc.id,
          email: inviteEmail,
        },
      }),
    });
    if (!res.ok) {
      setInviteStatus("Network error. Try again.");
      return;
    }
    const result = await res.json();
    if (result.errors && result.errors.length) {
      setInviteStatus(result.errors.map((e) => e.message).join("\n"));
      return;
    }
    if (result?.data?.inviteUserToDocument) {
      setInviteStatus("User invited successfully!");
      setInviteEmail("");
    } else {
      setInviteStatus("Could not invite user.");
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

      <form className="invite-user" onSubmit={handleInviteSubmit} style={{ marginTop: 32 }}>
  
        <h3>Invite user to this document</h3>
        <label htmlFor="inviteEmail">Email address</label>
        <input
          type="email"
          id="inviteEmail"
          name="inviteEmail"
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
          required
        />
        <button type="submit">Invite</button>
        {inviteStatus && <p style={{ color: inviteStatus.includes("success") ? "green" : "crimson" }}>{inviteStatus}</p>}
      </form>
    </>
  );
}
