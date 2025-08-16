// TipTapEditor.jsx
import './editor.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

const TipTapEditor = ({ value, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image, // add image support
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'custom-editor',
            },
        },
    });

    const addImage = () => {
        const url = window.prompt('Enter image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '8px' }}>
                <button
                    type="button"
                    onClick={addImage}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginBottom: '8px',
                    }}
                >
                    Add Image
                </button>
            </div>

            <div
                style={{
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px',
                    minHeight: '150px',
                    width: '100%',
                    transition: 'border-color 0.2s ease-in-out',
                    backgroundColor: '#fff',
                    fontFamily: 'inherit',
                }}
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default TipTapEditor;

