"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link2,
  Quote,
  Undo,
  Redo,
} from "lucide-react";

function ToolbarButton({
  icon: Icon,
  onClick,
  title,
}: {
  icon: any;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-white hover:text-ink"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function RichTextEditor({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(defaultValue);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== defaultValue) {
      ref.current.innerHTML = defaultValue || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string, value?: string) {
    document.execCommand(command, false, value);
    sync();
  }

  function sync() {
    if (ref.current) setHtml(ref.current.innerHTML);
  }

  function addLink() {
    const url = window.prompt("Enter URL");
    if (url) exec("createLink", url);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-black/5 bg-ivory/60 p-1.5">
        <ToolbarButton icon={Bold} title="Bold" onClick={() => exec("bold")} />
        <ToolbarButton icon={Italic} title="Italic" onClick={() => exec("italic")} />
        <ToolbarButton icon={Underline} title="Underline" onClick={() => exec("underline")} />
        <div className="mx-1 h-5 w-px bg-black/10" />
        <ToolbarButton icon={Heading2} title="Heading" onClick={() => exec("formatBlock", "<h2>")} />
        <ToolbarButton icon={Heading3} title="Subheading" onClick={() => exec("formatBlock", "<h3>")} />
        <ToolbarButton icon={Quote} title="Quote" onClick={() => exec("formatBlock", "<blockquote>")} />
        <div className="mx-1 h-5 w-px bg-black/10" />
        <ToolbarButton icon={List} title="Bullet list" onClick={() => exec("insertUnorderedList")} />
        <ToolbarButton icon={ListOrdered} title="Numbered list" onClick={() => exec("insertOrderedList")} />
        <ToolbarButton icon={Link2} title="Link" onClick={addLink} />
        <div className="mx-1 h-5 w-px bg-black/10" />
        <ToolbarButton icon={Undo} title="Undo" onClick={() => exec("undo")} />
        <ToolbarButton icon={Redo} title="Redo" onClick={() => exec("redo")} />
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={sync}
        onBlur={sync}
        className="prose-editor min-h-[320px] max-w-none px-4 py-3 text-sm leading-relaxed text-ink outline-none"
        suppressContentEditableWarning
      />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
