import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

export default function CodeEditor({ name = "content", defaultValue = "" }) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <div>
      <CodeMirror
        value={value}
        height="300px"
        extensions={[javascript({ jsx: true })]}
        onChange={(val) => setValue(val)}
      />
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
