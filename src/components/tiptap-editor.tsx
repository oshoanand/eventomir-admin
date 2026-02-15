"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Quote,
} from "lucide-react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-md border my-4 max-h-[400px] w-auto mx-auto",
        },
      }),
    ],
    content: content,
    // --- FIX: Disable immediate render to prevent SSR hydration mismatch ---
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] border p-4 rounded-md dark:prose-invert max-w-none",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Image URL");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="space-y-2 border rounded-md p-2 bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b pb-2 mb-2 sticky top-0 bg-background z-10">
        <Button
          size="sm"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          type="button"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          type="button"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={
            editor.isActive("heading", { level: 1 }) ? "default" : "ghost"
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          type="button"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={
            editor.isActive("heading", { level: 2 }) ? "default" : "ghost"
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          type="button"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          type="button"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          type="button"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={editor.isActive("link") ? "default" : "ghost"}
          onClick={setLink}
          type="button"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={addImage} type="button">
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
