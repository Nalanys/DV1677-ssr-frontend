import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CodeEditor from "./CodeEditor";

const API_BASE = "http://localhost:1337/graphql";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export default function CreateForm() {
  const navigate = useNavigate();
  const [isCode, setIsCode] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd);
    const graphqlQuery = `mutation CreateDocument($title: String!, $content: String!, $docType: String!) {
      createDocument(title: $title, content: $content, docType: $docType)
    }`;
    const res = await fetch(`${API_BASE}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        query: graphqlQuery,
        variables: {
          title: payload.title || "",
          content: payload.content || "",
          docType: payload.docType || "doc",
        }
      }),
    });

    if (!res.ok) {
      alert("Could not create document");
      return;
    }
    const result = await res.json();
    navigate(`/${result.data.createDocument}`);
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
