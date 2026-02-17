'use client';

import { useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function UploadForm() {
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'application/pdf') {
                setError('Only PDF files are allowed');
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const clearFile = () => {
        setFile(null);
        setError(null);
    };

    /**
     * Placeholder function for document upload logic.
     * Implementation can be added here later without database dependency.
     */
    const uploadDoc = async (file: File) => {
        setProcessing(true);
        setError(null);

        try {
            console.log('uploadDoc called with:', file.name);

            // Simulate processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // TODO: Implement your custom upload/processing logic here
            alert(`File "${file.name}" processed successfully (Placeholder logic)`);

            setFile(null);
        } catch (err) {
            setError('An error occurred during processing');
        } finally {
            setProcessing(false);
        }
    };

    const handleUploadClick = () => {
        if (!file) return;
        uploadDoc(file);
    };

    return (
        <Card className="border-dashed border-2">
            <CardHeader>
                <CardTitle>Upload Document</CardTitle>
                <CardDescription>Select a PDF document to process.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4">
                    {!file ? (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-400">PDF (MAX. 10MB)</p>
                            </div>
                            <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                        </label>
                    ) : (
                        <div className="flex items-center justify-between w-full p-4 border rounded-lg bg-indigo-50 border-indigo-200">
                            <div className="flex items-center space-x-3">
                                <FileText className="w-6 h-6 text-indigo-600" />
                                <div>
                                    <p className="text-sm font-medium text-indigo-900 truncate max-w-[200px] md:max-w-md">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-indigo-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            {!processing && (
                                <button onClick={clearFile} className="p-1 hover:bg-indigo-100 rounded-full text-indigo-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    )}

                    {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                    <Button
                        className="w-full"
                        disabled={!file || processing}
                        onClick={handleUploadClick}
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Upload and Process'
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
