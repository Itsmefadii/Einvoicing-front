'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  CloudArrowUpIcon, 
  DocumentArrowDownIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export default function UploadInvoicePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check permissions on component mount
  useEffect(() => {
    if (!authLoading && user) {
      // Admin users (roleId === 1) cannot upload invoices
      if (user.roleId === 1) {
        router.push('/dashboard/invoices?error=access_denied');
        return;
      }
      setIsCheckingPermissions(false);
    }
  }, [user, authLoading, router]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      
      // Process each file immediately with real API call
      newFiles.forEach(file => processFileWithAPI(file.id, selectedFiles[0]));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const newFiles: UploadedFile[] = Array.from(droppedFiles).map(file => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      
      // Process each file immediately with real API call
      newFiles.forEach(file => processFileWithAPI(file.id, droppedFiles[0]));
    }
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'Only Excel (.xlsx, .xls) and CSV files are allowed';
    }

    return null;
  };

  const processFileWithAPI = async (fileId: string, file: File) => {
    try {
      // Validate file first
      const validationError = validateFile(file);
      if (validationError) {
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error', error: validationError }
            : f
        ));
        return;
      }

      // Get authorization token
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error', error: 'No authorization token found' }
            : f
        ));
        return;
      }

      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'processing', progress: 50 }
          : f
      ));

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);

      // Call the API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${apiUrl}/invoice/upload-excel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      // Update status based on response
      if (response.ok && data.success) {
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'completed', progress: 100 }
            : f
        ));
      } else {
        const errorMessage = data.message || data.error || 'Upload failed';
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error', error: errorMessage }
            : f
        ));
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', error: 'Network error occurred' }
          : f
      ));
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const downloadTemplate = () => {
    const csvContent = `Invoice No,Date,Customer Name,Customer NTN,CNIC,Item Description,HS Code,Qty,Unit Price,Tax %,Tax Amount,Total
INV-2024-001,2024-06-15,ABC Company Ltd,1234567,1234567890123,Software Development Services,8514.40,1,50000,15,7500,57500
INV-2024-002,2024-06-16,XYZ Corporation,2345678,2345678901234,Consulting Services,9983.10,2,25000,15,7500,57500`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Removed startBulkUpload function as requested

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600';
      case 'processing':
        return 'text-yellow-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Show loading while checking permissions
  if (authLoading || isCheckingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show access denied if user is not authorized
  if (!user || user.roleId === 1) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to upload invoices.</p>
          <Button onClick={() => router.push('/dashboard/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Invoices</h1>
          <p className="text-gray-600">Bulk upload invoices from Excel or CSV files</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={downloadTemplate}>
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Drag and drop your Excel or CSV files here, or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-900">
                {isDragOver ? 'Drop files here' : 'Upload your files'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Supports Excel (.xlsx, .xls) and CSV files up to 10MB
              </p>
            </div>
            <div className="mt-6">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2"
              >
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>Track the progress of your file uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(file.status)}
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getStatusColor(file.status)}`}>
                          {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                        </p>
                        {file.status === 'uploading' && (
                          <p className="text-xs text-gray-500">{file.progress}%</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {file.status === 'error' && file.error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700">{file.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
          <CardDescription>Follow these steps to successfully upload your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">1. Prepare Your File</h3>
                <p className="text-sm text-gray-600">
                  Use the provided template or ensure your file has the required columns:
                  Invoice No, Date, Customer Name, NTN, CNIC, Item Description, HS Code, Qty, Unit Price, Tax %, Tax Amount, Total
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">2. Upload File</h3>
                <p className="text-sm text-gray-600">
                  Drag and drop your file or click "Choose Files" to select from your computer.
                  Supported formats: Excel (.xlsx, .xls) and CSV files up to 10MB.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">3. Process & Review</h3>
                <p className="text-sm text-gray-600">
                  The system will automatically process your file and validate the data.
                  Review any errors and fix them before proceeding with the bulk upload.
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Important Notes:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Customer NTN must be exactly 7 digits</li>
                <li>• CNIC must be exactly 13 digits (optional)</li>
                <li>• Dates should be in YYYY-MM-DD format</li>
                <li>• All monetary values should be numbers only</li>
                <li>• HS Code is optional but recommended for FBR compliance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
