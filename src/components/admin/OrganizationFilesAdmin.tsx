
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  getAllOrganizationFiles,
  deleteOrganizationFile,
  OrganizationFileMetadata
} from "@/services/fileStorageService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Download, Trash2, Search, FileText, Image, FileIcon } from "lucide-react";
import { trackEvent } from "@/lib/firebase";

export function OrganizationFilesAdmin() {
  const [files, setFiles] = useState<OrganizationFileMetadata[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<OrganizationFileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filtered = files.filter(
        file => 
          file.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          file.description?.toLowerCase().includes(lowerCaseSearchTerm) ||
          file.category?.toLowerCase().includes(lowerCaseSearchTerm) ||
          file.organizationId.toLowerCase().includes(lowerCaseSearchTerm)
      );
      setFilteredFiles(filtered);
    } else {
      setFilteredFiles(files);
    }
  }, [searchTerm, files]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const allFiles = await getAllOrganizationFiles();
      setFiles(allFiles);
      setFilteredFiles(allFiles);
      
      trackEvent('admin_viewed_organization_files', { 
        fileCount: allFiles.length 
      });
    } catch (error) {
      console.error("Error loading files:", error);
      toast({
        title: "Error",
        description: "Could not load organization files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (file: OrganizationFileMetadata) => {
    if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    try {
      await deleteOrganizationFile(file.id, file.storagePath);
      
      setFiles(prev => prev.filter(f => f.id !== file.id));
      setFilteredFiles(prev => prev.filter(f => f.id !== file.id));
      
      toast({
        title: "Success",
        description: `"${file.name}" has been deleted.`,
      });
      
      trackEvent('admin_deleted_organization_file', { 
        fileId: file.id, 
        organizationId: file.organizationId 
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "Could not delete file. Please try again.",
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
    <Card>
      <CardHeader>
        <CardTitle>Organization Materials</CardTitle>
        <CardDescription>
          View and manage files uploaded by partner organizations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search files by name, category, or organization ID"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={loadFiles}>Refresh</Button>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
          </div>
        ) : filteredFiles.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="font-medium truncate max-w-[180px] md:max-w-[250px]">
                            {file.name}
                          </p>
                          {file.description && (
                            <p className="text-xs text-gray-500 truncate max-w-[180px] md:max-w-[250px]">
                              {file.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {file.organizationId}
                      </span>
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
            {searchTerm ? (
              <>
                <Search className="h-12 w-12 mx-auto text-gray-300" />
                <p className="mt-2">No files match your search.</p>
              </>
            ) : (
              <>
                <FileText className="h-12 w-12 mx-auto text-gray-300" />
                <p className="mt-2">No organization files found.</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
