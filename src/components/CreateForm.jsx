import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:1337/"

export default function CreateForm() {
  const navigate = useNavigate();

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

        <label htmlFor="content">Content</label>
        <textarea name="content" defaultValue="" />

        <input type="submit" value="Create" />
      </form>
    </>
  );
}
