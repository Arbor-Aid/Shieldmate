import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { FileText, Image, Download, Trash2, Upload, FileIcon } from "lucide-react";
import { Organization } from "@/types/organization";
import {
  uploadOrganizationFile,
  getOrganizationFiles,
  deleteOrganizationFile,
  OrganizationFileMetadata
} from "@/services/fileStorageService";
import { trackEvent } from "@/lib/firebase";

interface OrganizationFilesProps {
  organization: Organization;
}

export function OrganizationFiles({ organization }: OrganizationFilesProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<OrganizationFileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    loadFiles();
  }, [organization.id]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const organizationFiles = await getOrganizationFiles(organization.id);
      setFiles(organizationFiles);
    } catch (error) {
      console.error("Error loading organization files:", error);
      toast({
        title: "Error",
        description: "Could not load organization files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    
    if (!file) {
      setSelectedFile(null);
      return;
    }
    
    // Check file type
    const allowedTypes = [
      'application/pdf', 
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setFileError('Only PDF, DOCX, TXT, JPEG, PNG, and GIF files are allowed.');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size must be less than 10MB.');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentUser) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      await uploadOrganizationFile(
        organization.id,
        currentUser.uid,
        selectedFile,
        description,
        category,
        (progress) => setUploadProgress(progress)
      );

      toast({
        title: "Success",
        description: "File uploaded successfully.",
      });

      // Reset form
      setSelectedFile(null);
      setDescription('');
      setCategory('General');
      setUploadProgress(0);
      
      // Clear file input value
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Reload files list
      loadFiles();
      
      trackEvent('organization_file_uploaded', {
        fileType: selectedFile.type,
        organizationId: organization.id
      });

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: OrganizationFileMetadata) => {
    if (!window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      return;
    }

    try {
      await deleteOrganizationFile(file.id, file.storagePath);
      
      toast({
        title: "Success",
        description: "File deleted successfully.",
      });
      
      // Remove the deleted file from the state
      setFiles(files.filter(f => f.id !== file.id));
      
      trackEvent('organization_file_deleted', {
        fileId: file.id,
        organizationId: organization.id
      });
      
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting your file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.gif"
                disabled={uploading}
                className="cursor-pointer"
              />
              {fileError && (
                <p className="text-sm text-red-500 mt-1">{fileError}</p>
              )}
              <p className="text-xs text-gray-500">
                Allowed: PDF, DOCX, TXT, JPEG, PNG, GIF (Max: 10MB)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={category} 
                onValueChange={setCategory}
                disabled={uploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Brochures">Brochures</SelectItem>
                  <SelectItem value="Flyers">Flyers</SelectItem>
                  <SelectItem value="Presentations">Presentations</SelectItem>
                  <SelectItem value="Forms">Forms</SelectItem>
                  <SelectItem value="Images">Images</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter a brief description of the file"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                rows={3}
              />
            </div>

            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Uploading: {uploadProgress.toFixed(0)}%
                </p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload File"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization Materials</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading files...</p>
            </div>
          ) : files.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <div>
                            <p className="font-medium truncate max-w-[180px] sm:max-w-[300px]">
                              {file.name}
                            </p>
                            {file.description && (
                              <p className="text-xs text-gray-500 truncate max-w-[180px] sm:max-w-[300px]">
                                {file.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {file.category}
                        </span>
                      </TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>
                        {format(new Date(file.uploadDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(file.downloadUrl, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(file)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto text-gray-300" />
              <p className="mt-2">No files uploaded yet.</p>
              <p className="text-sm">Upload materials to share with your clients.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
