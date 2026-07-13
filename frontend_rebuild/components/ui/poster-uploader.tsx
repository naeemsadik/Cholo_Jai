"use client";

import * as React from "react";
import { Upload, Link as LinkIcon, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PosterUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<{ data?: { url: string }; error?: string }>;
  error?: string;
  className?: string;
}

export function PosterUploader({
  value,
  onChange,
  onUpload,
  error,
  className,
}: PosterUploaderProps) {
  const [activeTab, setActiveTab] = React.useState<"upload" | "url">(
    value && !value.startsWith("/") && !value.includes("localhost") && !value.startsWith("http") ? "url" : "upload"
  );
  const [uploading, setUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-switch to URL tab if the value starts with HTTP but tab is upload and we didn't just upload it
  React.useEffect(() => {
    if (value && (value.startsWith("http://") || value.startsWith("https://")) && !value.includes("/uploads/")) {
      setActiveTab("url");
    }
  }, [value]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    setUploading(true);
    try {
      const res = await onUpload(file);
      if (res.data?.url) {
        onChange(res.data.url);
      } else if (res.error) {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      void handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex border-b border-rule bg-cream-50/50 rounded-t-lg overflow-hidden p-1 max-w-xs">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-medium transition-all",
            activeTab === "upload"
              ? "bg-paper text-ink shadow-sm"
              : "text-ink-500 hover:text-ink hover:bg-cream-100"
          )}
        >
          <Upload className="h-3 w-3" />
          Upload file
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("url")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-medium transition-all",
            activeTab === "url"
              ? "bg-paper text-ink shadow-sm"
              : "text-ink-500 hover:text-ink hover:bg-cream-100"
          )}
        >
          <LinkIcon className="h-3 w-3" />
          Web URL
        </button>
      </div>

      {activeTab === "upload" ? (
        <div className="space-y-2">
          {value ? (
            <div className="relative rounded-lg border border-rule overflow-hidden bg-cream-50 p-2 flex items-center gap-3">
              {/* Thumbnail */}
              <div className="relative h-16 w-16 bg-cream-200 rounded border border-rule overflow-hidden shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value.startsWith("/") ? value : value}
                  alt="Poster preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder icon on error
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <ImageIcon className="absolute h-5 w-5 text-ink-300 pointer-events-none" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-ink truncate">{value.split("/").pop()}</p>
                <p className="text-[10px] text-ink-500 truncate">{value}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearImage}
                className="h-8 w-8 text-ink-500 hover:text-ember-600 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px]",
                dragActive
                  ? "border-accent-500 bg-accent-50/20"
                  : "border-rule bg-paper hover:border-ink-300"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 text-accent-500 animate-spin" />
                  <p className="mt-2 text-xs font-medium text-ink">Uploading image...</p>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-ink-400 mb-2" />
                  <p className="text-xs font-medium text-ink">
                    Drag & drop your poster, or <span className="text-accent-700 underline font-semibold">browse</span>
                  </p>
                  <p className="text-[10px] text-ink-400 mt-1">Supports JPG, PNG, WEBP up to 5MB</p>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/poster.jpg"
            className={cn(error && "border-ember-500 focus-visible:ring-ember-500")}
          />
          {value && (
            <button
              type="button"
              onClick={clearImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {error && <p className="text-[11px] text-ember-600 mt-1 font-medium">{error}</p>}
    </div>
  );
}
