import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

export default function CodeEditor({ value = "", onChange }) {
  return (
    <div>
      <CodeMirror
        value={value}
        height="300px"
        extensions={[javascript({ jsx: true })]}
        onChange={(val) => {
          onChange?.(val);
        }}
      />
    </div>
  );
}
