import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Download,
  Eye,
  Filter,
  FileText,
  Image,
  FileSpreadsheet,
  Presentation,
  Archive,
  File,
  Calendar,
  User,
  Tag,
  Clock,
  AlertTriangle
} from "lucide-react";
import {
  Document,
  DocumentCategory,
  DOCUMENT_CATEGORIES,
  DOCUMENT_STATUS_COLORS,
  formatFileSize,
  getFileIcon
} from "@/types/documents";
import { fetchEmployeeDocuments, downloadDocument } from "@/api/documents";

interface DocumentViewerProps {
  employeeId?: string;
}

export function DocumentViewer({ employeeId }: DocumentViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      if (!employeeId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await fetchEmployeeDocuments(employeeId);
        setDocuments(data);
      } catch (error) {
        console.error("Failed to load documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [employeeId]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getIconComponent = (fileType: string) => {
    const iconName = getFileIcon(fileType);
    const iconMap: Record<string, any> = {
      FileText,
      Image,
      FileSpreadsheet,
      Presentation,
      Archive,
      File,
    };
    return iconMap[iconName] || File;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const handleDownload = async (document: Document) => {
    try {
      await downloadDocument(document.id);
    } catch (error) {
      console.error("Failed to download document:", error);
    }
  };

  const handleView = (document: Document) => {
    setSelectedDocument(document);
    // Update access count (would be done via API in real implementation)
  };

  // Group documents by category for better organization
  const documentsByCategory = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Documents</h1>
          <p className="text-muted-foreground">
            Access your personal documents and company resources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(DOCUMENT_CATEGORIES).map(([key, category]) => (
                  <SelectItem key={key} value={key}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Document Categories */}
      {selectedCategory === "all" ? (
        <div className="space-y-8">
          {Object.entries(documentsByCategory).map(([categoryKey, documents]) => {
            const category = DOCUMENT_CATEGORIES[categoryKey as DocumentCategory];
            if (!category || documents.length === 0) return null;

            return (
              <div key={categoryKey}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <div className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{category.name}</h2>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <Badge variant="secondary">{documents.length}</Badge>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((document) => {
                      const IconComponent = getIconComponent(document.file_type);
                      return (
                        <Card key={document.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                <IconComponent className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-medium text-sm truncate">{document.title}</h3>
                                  {document.is_confidential && (
                                    <Badge variant="destructive" className="text-xs ml-2">
                                      Confidential
                                    </Badge>
                                  )}
                                </div>

                                {document.description && (
                                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                    {document.description}
                                  </p>
                                )}

                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                  <span>{formatFileSize(document.file_size)}</span>
                                  <span>•</span>
                                  <span>{formatDate(document.uploaded_date)}</span>
                                </div>

                                {(isExpired(document.expiry_date) || isExpiringSoon(document.expiry_date)) && (
                                  <div className="flex items-center gap-1 text-xs text-amber-600 mb-2">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>
                                      {isExpired(document.expiry_date) ? 'Expired' : 'Expires Soon'}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 gap-1"
                                    onClick={() => handleView(document)}
                                  >
                                    <Eye className="h-3 w-3" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 gap-1"
                                    onClick={() => handleDownload(document)}
                                  >
                                    <Download className="h-3 w-3" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {documents.map((document) => {
                          const IconComponent = getIconComponent(document.file_type);
                          return (
                            <div key={document.id} className="p-4 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-muted rounded-lg">
                                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium truncate">{document.title}</h3>
                                    {document.is_confidential && (
                                      <Badge variant="destructive" className="text-xs">
                                        Confidential
                                      </Badge>
                                    )}
                                    {(isExpired(document.expiry_date) || isExpiringSoon(document.expiry_date)) && (
                                      <Badge variant="outline" className="text-xs text-amber-600">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        {isExpired(document.expiry_date) ? 'Expired' : 'Expires Soon'}
                                      </Badge>
                                    )}
                                  </div>

                                  {document.description && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {document.description}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>{formatFileSize(document.file_size)}</span>
                                    <span>•</span>
                                    <span>{formatDate(document.uploaded_date)}</span>
                                    <span>•</span>
                                    <span>{document.access_count} views</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleView(document)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownload(document)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Single category view
        <div>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((document) => {
                const IconComponent = getIconComponent(document.file_type);
                return (
                  <Card key={document.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <IconComponent className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-sm truncate">{document.title}</h3>
                            {document.is_confidential && (
                              <Badge variant="destructive" className="text-xs ml-2">
                                Confidential
                              </Badge>
                            )}
                          </div>

                          {document.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {document.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <span>{formatFileSize(document.file_size)}</span>
                            <span>•</span>
                            <span>{formatDate(document.uploaded_date)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-1"
                              onClick={() => handleView(document)}
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-1"
                              onClick={() => handleDownload(document)}
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredDocuments.map((document) => {
                    const IconComponent = getIconComponent(document.file_type);
                    return (
                      <div key={document.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-muted rounded-lg">
                            <IconComponent className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate">{document.title}</h3>
                              {document.is_confidential && (
                                <Badge variant="destructive" className="text-xs">
                                  Confidential
                                </Badge>
                              )}
                            </div>

                            {document.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {document.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{formatFileSize(document.file_size)}</span>
                              <span>•</span>
                              <span>{formatDate(document.uploaded_date)}</span>
                              <span>•</span>
                              <span>{document.access_count} views</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleView(document)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(document)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {(() => {
                  const IconComponent = getIconComponent(selectedDocument.file_type);
                  return <IconComponent className="h-5 w-5" />;
                })()}
                {selectedDocument.title}
              </DialogTitle>
              <DialogDescription>
                {selectedDocument.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">File Size:</span> {formatFileSize(selectedDocument.file_size)}
                </div>
                <div>
                  <span className="font-medium">Uploaded:</span> {formatDate(selectedDocument.uploaded_date)}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {DOCUMENT_CATEGORIES[selectedDocument.category]?.name}
                </div>
                <div>
                  <span className="font-medium">Views:</span> {selectedDocument.access_count}
                </div>
              </div>

              {selectedDocument.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {selectedDocument.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDocument(null)}>
                  Close
                </Button>
                <Button onClick={() => handleDownload(selectedDocument)} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Documents Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters to find documents."
                : "You don't have any documents yet. Documents will appear here when they are uploaded."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
