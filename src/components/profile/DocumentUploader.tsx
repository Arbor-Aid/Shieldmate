
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { uploadFile, getUserFiles, deleteFile, FileMetadata } from "@/services/fileStorageService";
import { formatDistanceToNow } from "date-fns";
import { FileText, Download, Trash2, Upload, File } from "lucide-react";

const DocumentUploader = () => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserFiles();
  }, [currentUser]);

  const fetchUserFiles = async () => {
    if (!currentUser?.uid) return;
    
    setLoading(true);
    try {
      const userFiles = await getUserFiles(currentUser.uid);
      setFiles(userFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Could not load your documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile || !currentUser?.uid) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOCX, or TXT file",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "File size should be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadedFile = await uploadFile(
        currentUser.uid,
        selectedFile,
        (progress) => setUploadProgress(progress)
      );
      
      setFiles(prevFiles => [...prevFiles, uploadedFile]);
      
      toast({
        title: "Upload Complete",
        description: `${selectedFile.name} has been uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  const handleDelete = async (file: FileMetadata) => {
    try {
      await deleteFile(file.id, file.storagePath);
      setFiles(files.filter(f => f.id !== file.id));
      toast({
        title: "File Deleted",
        description: `${file.name} has been deleted`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting your file",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes('word')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (fileType.includes('text')) return <FileText className="h-5 w-5 text-gray-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="file"
            id="fileUpload"
            className="hidden"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="fileUpload">
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={uploading}
              asChild
            >
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </span>
            </Button>
          </label>
          <p className="text-sm text-muted-foreground">
            Accepted formats: PDF, DOCX, TXT (Max 10MB)
          </p>
        </div>

        {uploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2 w-full" />
            <p className="text-sm text-muted-foreground">Uploading: {uploadProgress.toFixed(0)}%</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
        </div>
      ) : files.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="flex items-center gap-2">
                  {getFileIcon(file.type)}
                  <span className="truncate max-w-[200px]">{file.name}</span>
                </TableCell>
                <TableCell>{file.type.split('/')[1].toUpperCase()}</TableCell>
                <TableCell>{formatFileSize(file.size)}</TableCell>
                <TableCell>{formatDistanceToNow(file.uploadDate)} ago</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.downloadUrl, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-muted/20 rounded-md border border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No documents yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload your important documents for quick access
          </p>
          <label htmlFor="fileUpload">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Upload your first document
              </span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
