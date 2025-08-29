"use client";
import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "./ui/button";

export default function ShareQRCode({ url }: { url: string }) {
  const shareData = useMemo(() => ({ title: "Vote on this poll", text: "Join the poll:", url }), [url]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard");
      }
    } catch {}
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard");
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
        <QRCodeSVG value={url} size={160} includeMargin color="#0f172a" />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={handleCopy}>Copy link</Button>
        <Button onClick={handleShare}>Share</Button>
      </div>
    </div>
  );
}


