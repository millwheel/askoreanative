'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useCallback, useState } from 'react';

interface RichTextEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
  error?: string;
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  onImageUpload,
  error,
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable headings for simplicity
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  const handleImageUpload = useCallback(async () => {
    if (!editor) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        alert('Only JPEG, PNG, GIF, and WebP images are allowed');
        return;
      }

      setIsUploading(true);
      try {
        let url: string;

        if (onImageUpload) {
          // Use custom upload handler
          url = await onImageUpload(file);
        } else {
          // Use base64 for now (fallback)
          const reader = new FileReader();
          url = await new Promise((resolve) => {
            reader.onload = (e) => {
              resolve(e.target?.result as string);
            };
            reader.readAsDataURL(file);
          });
        }

        editor.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="border border-b-0 border-gray-300 rounded-t-lg bg-gray-50 p-2 flex gap-1 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('bold')
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-100'
          }`}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!editor.can().chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-100'
          }`}
          title="Bullet List"
        >
          •
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={!editor.can().chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-100'
          }`}
          title="Blockquote"
        >
          "
        </button>

        <div className="border-l border-gray-300 mx-1" />

        <button
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) {
              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }
          }}
          className="px-3 py-1 rounded text-sm font-medium bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
          title="Insert Link"
        >
          🔗
        </button>

        <button
          onClick={handleImageUpload}
          disabled={isUploading}
          className="px-3 py-1 rounded text-sm font-medium bg-white border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50"
          title="Insert Image"
        >
          {isUploading ? '⏳' : '🖼️'}
        </button>

        <div className="border-l border-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().clearNodes().run()}
          className="px-3 py-1 rounded text-sm font-medium bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
          title="Clear Formatting"
        >
          ✖️
        </button>
      </div>

      {/* Editor */}
      <div
        className={`border border-gray-300 rounded-b-lg bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors ${
          error ? 'border-red-500' : ''
        }`}
      >
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none p-4"
          style={{
            minHeight: '300px',
          }}
        />
      </div>

      {/* Error message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Character count */}
      <p className="text-xs text-gray-500 mt-1">
        {editor.getCharacterCount()} characters
      </p>
    </div>
  );
}
