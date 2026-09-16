import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import type { Attachment } from "../../types";

const LocalAttachmentViewer: React.FC<{ attachment: Attachment }> = ({ attachment }) => {
  const [dataUrl, setDataUrl] = useState<string>(attachment.url);

  useEffect(() => {
    if (attachment.url.startsWith("local://")) {
      const key = attachment.url.replace("local://", "");
      const stored = localStorage.getItem(key);
      if (stored) {
        setDataUrl(stored);
      }
    }
  }, [attachment.url]);

  if (attachment.type === "image") {
    return <img src={dataUrl} alt={attachment.name} className="max-w-full rounded-xl object-contain max-h-64" />;
  }

  return (
    <a href={dataUrl} download={attachment.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
      <FileText className="w-5 h-5" />
      <span className="font-medium text-sm underline">{attachment.name}</span>
    </a>
  );
};

export default LocalAttachmentViewer;