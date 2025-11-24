"use client";

import { useRef, useState } from "react";
import { Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";

interface FileUploadProps {
    onFileSelect: (files: File[]) => void;
    disabled?: boolean;
}

export default function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(files);
        onFileSelect(files);
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        onFileSelect(newFiles);
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith("image/")) {
            return <ImageIcon className="w-4 h-4" />;
        }
        return <FileText className="w-4 h-4" />;
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
            />

            {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 bg-muted/50 border border-white/10 rounded-lg px-3 py-2 text-sm"
                        >
                            {getFileIcon(file)}
                            <span className="truncate max-w-[150px]">{file.name}</span>
                            <button
                                onClick={() => removeFile(index)}
                                className="hover:text-red-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="p-2 hover:bg-accent rounded-full transition-colors disabled:opacity-50"
                title="Attach file"
            >
                <Paperclip className="w-5 h-5" />
            </button>
        </div>
    );
}
