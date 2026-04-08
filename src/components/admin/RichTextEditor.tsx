"use client";

import { useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extension-placeholder";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Palette,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  TableIcon,
  Type,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";

interface RichTextEditorProps {
  content?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  signature?: string;
}

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px"];

const TEXT_COLORS = [
  "#000000", "#1e293b", "#dc2626", "#ea580c", "#ca8a04",
  "#16a34a", "#2563eb", "#7c3aed", "#db2777", "#64748b",
];

const BG_COLORS = [
  "transparent", "#fef2f2", "#fff7ed", "#fefce8",
  "#f0fdf4", "#eff6ff", "#faf5ff", "#fdf2f8", "#f1f5f9",
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-blue-100 text-blue-700"
          : "text-slate-600 hover:bg-slate-200"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Tulis pesan...",
  minHeight = "200px",
  signature,
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-600 underline" } }),
      Image.configure({ inline: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none`,
        style: `min-height: ${minHeight}`,
      },
    },
  });

  const insertLink = useCallback(() => {
    if (!editor || !linkUrl.trim()) return;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setLinkUrl("");
    setShowLinkDialog(false);
  }, [editor, linkUrl]);

  const insertImage = useCallback(() => {
    if (!editor) return;
    const url = prompt("URL gambar:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar Row 1 */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 px-2 py-1.5 bg-slate-50">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-slate-200" />

        <select
          className="text-xs border border-slate-200 rounded px-1.5 py-1 bg-white text-slate-700 h-7"
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setMark("textStyle", { fontFamily: e.target.value }).run();
            } else {
              editor.chain().focus().unsetMark("textStyle").run();
            }
          }}
          title="Font"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        <select
          className="text-xs border border-slate-200 rounded px-1.5 py-1 bg-white text-slate-700 h-7 w-16"
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setMark("textStyle", { fontSize: e.target.value }).run();
            }
          }}
          title="Ukuran"
        >
          <option value="">Size</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <span className="mx-1 h-5 w-px bg-slate-200" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-slate-200" />

        {/* Text color */}
        <div className="relative group">
          <ToolbarButton onClick={() => {}} title="Warna teks">
            <Palette className="h-4 w-4" />
          </ToolbarButton>
          <div className="absolute left-0 top-full z-50 mt-1 hidden group-hover:grid grid-cols-5 gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
            {TEXT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className="h-5 w-5 rounded-full border border-slate-200"
                style={{ backgroundColor: color }}
                onClick={() => editor.chain().focus().setColor(color).run()}
              />
            ))}
          </div>
        </div>

        {/* Background color */}
        <div className="relative group">
          <ToolbarButton onClick={() => {}} title="Warna latar">
            <Highlighter className="h-4 w-4" />
          </ToolbarButton>
          <div className="absolute left-0 top-full z-50 mt-1 hidden group-hover:grid grid-cols-5 gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
            {BG_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className="h-5 w-5 rounded-full border border-slate-200"
                style={{ backgroundColor: color === "transparent" ? "#fff" : color }}
                onClick={() => {
                  if (color === "transparent") {
                    editor.chain().focus().unsetHighlight().run();
                  } else {
                    editor.chain().focus().toggleHighlight({ color }).run();
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar Row 2 */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 px-2 py-1.5 bg-slate-50">
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Rata kiri">
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Tengah">
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Rata kanan">
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-slate-200" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Daftar">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Bernomor">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-slate-200" />

        <ToolbarButton onClick={insertTable} title="Tabel">
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={insertImage} title="Sisipkan gambar">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
              } else {
                setShowLinkDialog(true);
              }
            }}
            active={editor.isActive("link")}
            title="Sisipkan tautan"
          >
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
          {showLinkDialog && (
            <div className="absolute left-0 top-full z-50 mt-1 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
              <input
                className="text-xs border border-slate-200 rounded px-2 py-1 w-48"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && insertLink()}
                autoFocus
              />
              <button type="button" className="text-xs bg-blue-600 text-white rounded px-2 py-1" onClick={insertLink}>OK</button>
              <button type="button" className="text-xs text-slate-500" onClick={() => setShowLinkDialog(false)}>Batal</button>
            </div>
          )}
        </div>

        <span className="mx-1 h-5 w-px bg-slate-200" />

        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Hapus format"
        >
          <RemoveFormatting className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading"
        >
          <Type className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="px-4 py-3" />

      {/* Signature preview */}
      {signature && (
        <div
          className="border-t border-slate-200 bg-slate-50/80 px-4 py-3 text-[13px] text-slate-500 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: signature }}
        />
      )}
    </div>
  );
}
