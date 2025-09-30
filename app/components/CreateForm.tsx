import React from "react";
import { Form } from "react-router";

const CreateForm: React.FC = () => {
  return (
    <>
      <h2>Create new document</h2>
      <Form method="post" className="new-doc">
        <label htmlFor="title">Title</label>
        <input type="text" name="title" defaultValue="" />

        <label htmlFor="content">Content</label>
        <textarea name="content" defaultValue="" />

        <input type="submit" value="Create" />
      </Form>
    </>
  );
};

export default CreateForm;
