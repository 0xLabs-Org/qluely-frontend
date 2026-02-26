"use client";

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';


export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const { addToast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'application/pdf') {
                setError('Please upload a valid PDF file.');
                setFile(null);
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size must be less than 5MB.');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
            setSuccess(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type !== 'application/pdf') {
                setError('Please drop a valid PDF file.');
                return;
            }
            if (droppedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB.');
                return;
            }
            setFile(droppedFile);
            setError(null);
            setSuccess(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            // Dynamically import pdfjs-dist only on the client-side to avoid SSR DOMMatrix error
            const pdfjsLib = await import('pdfjs-dist');
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            }

            // Read and parse PDF client-side
            const arrayBuffer = await file.arrayBuffer();
            const pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let extractedText = '';
            for (let i = 1; i <= pdfDocument.numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                extractedText += pageText + '\n';
            }

            // We send the extracted data to our Next.js proxy
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/document/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                },
                body: JSON.stringify({ details: extractedText }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to upload document');
            }

            setSuccess(true);
            addToast('Document successfully uploaded!', 'success');
        } catch (err: any) {
            setError('Please Try Again');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">Upload Document</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Upload your resume or cover letter. Only PDF format is accepted (Max: 5MB).
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-500" />
                                </div>
                                <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">Upload Successful!</h3>
                                <p className="text-zinc-500 dark:text-zinc-400">Your document has been parsed successfully. Redirecting...</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <label
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ease-in-out ${file
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/5'
                                        : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900'
                                        }`}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {file ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <FileText className="w-12 h-12 text-indigo-400" />
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">{file.name}</p>
                                                    <p className="text-xs text-zinc-500 mt-1">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mb-4" />
                                                <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                    <span className="font-semibold text-indigo-500 dark:text-indigo-400">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-zinc-500">PDF documents only</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        id="dropzone-file"
                                        type="file"
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                    />
                                </label>

                                {error && (
                                    <div className="mt-4 flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10 p-3 rounded-lg text-sm">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleUpload}
                                    disabled={!file || uploading}
                                    className="w-full mt-6 bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Upload Document'
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
