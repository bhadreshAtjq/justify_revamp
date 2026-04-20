"use client";

import { useState } from "react";
import { FaCopy, FaCheckCircle } from "react-icons/fa";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export default function CopyButton({ text, label, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`btn btn-sm ${copied ? "btn-primary" : "btn-dark"} ${className}`}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <>
          <FaCheckCircle style={{ width: 14, height: 14 }} />
          {label ? "Copied" : null}
        </>
      ) : (
        <>
          <FaCopy style={{ width: 14, height: 14 }} />
          {label || null}
        </>
      )}
    </button>
  );
}
