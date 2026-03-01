"use client";
import { useState, useRef, useEffect } from "react";

interface Props {
  onSend: (msg: string, imageBase64?: string) => void;
  disabled: boolean;
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function focusInput() {
    inputRef.current?.focus();
  }

  useEffect(() => {
    focusInput();
  }, []);

  function send() {
    const t = text.trim();
    if ((!t && !imageBase64) || disabled) return;
    onSend(t || "📷 Imagem enviada", imageBase64 || undefined);
    setText("");
    setPreview(null);
    setImageBase64(null);
    focusInput();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function removeImage() {
    setPreview(null);
    setImageBase64(null);
  }

  return (
    <div>
      {/* Image preview */}
      {preview && (
        <div className="image-preview-bar">
          <div className="image-preview-wrapper">
            <img src={preview} alt="preview" className="image-preview-thumb" />
            <button className="image-preview-remove" onClick={removeImage}>✕</button>
          </div>
        </div>
      )}
      <div className="input-bar">
        <input type="file" ref={fileRef} accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        <button className="upload-btn" onClick={() => fileRef.current?.click()} title="Enviar foto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </button>
        <input
          type="text"
          ref={inputRef}
          className="input-field"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Digite sua mensagem para comparar..."
          disabled={disabled}
          autoFocus
        />
        <button className="send-btn" onClick={send} disabled={disabled || (!text.trim() && !imageBase64)}>
          Enviar
        </button>
      </div>
    </div>
  );
}
