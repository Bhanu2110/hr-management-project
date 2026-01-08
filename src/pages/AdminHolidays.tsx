import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Plus, Pencil, Trash2, AlertCircle, X, ArrowUpDown } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Holiday, HOLIDAY_TYPES } from "@/types/holidays";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { format, parse } from "date-fns";
import { holidayService } from "@/services/holidayService";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeContext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const AdminHolidays = () => {
  const { themeColor } = useTheme();
  const { toast } = useToast();
  const { employee } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isMonthFiltered, setIsMonthFiltered] = useState(false);
  const selectedYear = date ? String(date.getFullYear()) : String(currentMonth.getFullYear());
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'name' | 'date' | 'day' | 'type' | 'location'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState<Holiday | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    date: new Date(),
    type: HOLIDAY_TYPES.PUBLIC as string,
    location: "All"
  });


  const locations = ["All", "New York", "London", "Bangalore"]; // These should ideally come from an API or be more dynamic

  useEffect(() => {
    loadHolidays();
  }, [date, currentMonth, selectedLocation]);

  const loadHolidays = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading holidays for year:', selectedYear, 'and location:', selectedLocation);
      const data = await holidayService.fetchHolidays(selectedYear, selectedLocation);
      console.log('Loaded holidays:', data);
      setHolidays(data);
    } catch (err) {
      setError("Failed to fetch holidays.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const filteredHolidays = useMemo(() => {
    return holidays.filter((holiday) => {
      const matchesSearch = holiday.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        holiday.day.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDate = date
        ? holiday.date === format(date, 'yyyy-MM-dd')
        : isMonthFiltered
          ? holiday.date.startsWith(format(currentMonth, 'yyyy-MM'))
          : true;

      return matchesSearch && matchesDate;
    });
  }, [searchQuery, holidays, date, currentMonth, isMonthFiltered]);

  const handleSort = (field: 'name' | 'date' | 'day' | 'type' | 'location') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedHolidays = useMemo(() => {
    return [...filteredHolidays].sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [filteredHolidays, sortField, sortDirection]);

  const getRowClassName = (holidayType: string) => {
    switch (holidayType) {
      case HOLIDAY_TYPES.PUBLIC:
        return "bg-blue-50/50 hover:bg-blue-100/50"; // Light blue for public holidays
      case HOLIDAY_TYPES.OPTIONAL:
        return "bg-green-50/50 hover:bg-green-100/50"; // Light green for optional holidays
      default:
        return "";
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Holiday List", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    const tableColumn = ["Holiday Name", "Date", "Day", "Type", "Location"];
    const tableRows: string[][] = [];

    filteredHolidays.forEach((holiday) => {
      const holidayData = [
        holiday.name,
        holiday.date,
        holiday.day,
        holiday.type,
        holiday.location || "N/A",
      ];
      tableRows.push(holidayData);
    });

    (doc as any).autoTable(tableColumn, tableRows, {
      startY: 30,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [20, 100, 160], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      didDrawPage: (data: any) => {
        // Footer
        let str = "Page " + (doc as any).internal.getNumberOfPages();
        // Total page number plugin only available in jspdf v1.0+ 
        if (typeof (doc as any).putTotalPages === 'function') {
          str = str + " of " + (doc as any).internal.getNumberOfPages();
        }
        doc.setFontSize(10);
        doc.text(str, data.settings.margin.left, (doc as any).internal.pageSize.height - 10);
      }
    });

    doc.save(`Holidays_${selectedYear}.pdf`);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      date: new Date(),
      type: HOLIDAY_TYPES.PUBLIC,
      location: "All"
    });
  };

  const handleAddHoliday = async () => {
    try {
      console.log('Adding holiday with form data:', formData);
      console.log('Current employee:', employee);

      const newHoliday = {
        name: formData.name,
        date: format(formData.date, 'yyyy-MM-dd'),
        type: formData.type,
        location: formData.location,
        created_by: employee?.id
      };

      console.log('Sending holiday data to service:', newHoliday);
      const result = await holidayService.createHoliday(newHoliday);
      console.log('Holiday creation result:', result);

      // Manually add the new holiday to the state
      setHolidays(prevHolidays => {
        // Check if this holiday is already in the list (by ID)
        const exists = prevHolidays.some(h => h.id === result.id);
        if (exists) {
          return prevHolidays; // Don't add duplicates
        }
        return [...prevHolidays, result];
      });

      toast({
        title: "Success",
        description: "Holiday added successfully",
      });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error adding holiday:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to add holiday",
        variant: "destructive",
      });
    }
  };

  const handleEditHoliday = async () => {
    if (!currentHoliday) return;

    try {
      console.log('Editing holiday with ID:', currentHoliday.id);
      console.log('Form data:', formData);

      const updatedHoliday = {
        name: formData.name,
        date: format(formData.date, 'yyyy-MM-dd'),
        type: formData.type,
        location: formData.location
      };

      const result = await holidayService.updateHoliday(currentHoliday.id, updatedHoliday);
      console.log('Holiday update result:', result);

      // Manually update the holiday in the state
      setHolidays(prevHolidays => {
        return prevHolidays.map(h => {
          if (h.id === currentHoliday.id) {
            return result; // Replace with updated holiday
          }
          return h;
        });
      });

      toast({
        title: "Success",
        description: "Holiday updated successfully",
      });
      setIsEditDialogOpen(false);
      setCurrentHoliday(null);
    } catch (error: any) {
      console.error("Error updating holiday:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update holiday",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHoliday = async () => {
    if (!currentHoliday) return;

    try {
      console.log('Deleting holiday with ID:', currentHoliday.id);

      const success = await holidayService.deleteHoliday(currentHoliday.id);
      console.log('Holiday deletion result:', success);

      if (success) {
        // Manually remove the holiday from the state
        setHolidays(prevHolidays => {
          return prevHolidays.filter(h => h.id !== currentHoliday.id);
        });

        toast({
          title: "Success",
          description: "Holiday deleted successfully",
        });
      } else {
        throw new Error('Failed to delete holiday');
      }

      setIsDeleteDialogOpen(false);
      setCurrentHoliday(null);
    } catch (error: any) {
      console.error("Error deleting holiday:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete holiday",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (holiday: Holiday) => {
    setCurrentHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: parse(holiday.date, 'yyyy-MM-dd', new Date()),
      type: holiday.type,
      location: holiday.location || "All"
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (holiday: Holiday) => {
    setCurrentHoliday(holiday);
    setIsDeleteDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold">Manage Holidays</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Input
                placeholder="Search holidays..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[250px]"
              />
              <div className="flex items-center gap-2">
                <DatePicker
                  date={date}
                  setDate={(newDate) => {
                    setDate(newDate);
                    if (newDate) {
                      setCurrentMonth(newDate);
                      setIsMonthFiltered(false); // Specific date selected, not month filter
                    }
                  }}
                  month={currentMonth}
                  onMonthChange={(newMonth) => {
                    setCurrentMonth(newMonth);
                    setDate(undefined); // Clear specific date selection when changing month
                    setIsMonthFiltered(true); // Enable month filtering
                  }}
                  isMonthFiltered={isMonthFiltered}
                  className="w-full sm:w-[180px]"
                />
                {(date || isMonthFiltered) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setDate(undefined);
                      setIsMonthFiltered(false);
                      setCurrentMonth(new Date()); // Optional: Reset to today
                    }}
                    title="Clear Filter"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Locations</SelectItem>
                  {locations.filter(loc => loc !== "All").map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleDownloadPdf} variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}
                className="w-full sm:w-auto"
                style={{ backgroundColor: themeColor }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Holiday
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading && <p>Loading holidays...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-muted/50">
                      <TableHead className="w-[60px] text-center font-medium">S.No</TableHead>
                      <TableHead 
                        className="w-[200px] font-medium cursor-pointer hover:bg-muted/80"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Holiday Name
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="w-[120px] font-medium cursor-pointer hover:bg-muted/80"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center">
                          Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="w-[100px] font-medium cursor-pointer hover:bg-muted/80"
                        onClick={() => handleSort('day')}
                      >
                        <div className="flex items-center">
                          Day
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="w-[100px] font-medium cursor-pointer hover:bg-muted/80"
                        onClick={() => handleSort('type')}
                      >
                        <div className="flex items-center">
                          Type
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="w-[150px] font-medium cursor-pointer hover:bg-muted/80"
                        onClick={() => handleSort('location')}
                      >
                        <div className="flex items-center">
                          Location
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="w-[100px] text-right font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedHolidays.length > 0 ? (
                      sortedHolidays.map((holiday, index) => (
                        <TableRow key={holiday.id} id={`holiday-${holiday.date}`} className={getRowClassName(holiday.type)}>
                          <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="font-medium">{holiday.name}</TableCell>
                          <TableCell>{holiday.date}</TableCell>
                          <TableCell>{holiday.day}</TableCell>
                          <TableCell>{holiday.type}</TableCell>
                          <TableCell>{holiday.location || "All"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(holiday)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(holiday)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No holidays are present.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Holiday Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Holiday</DialogTitle>
            <DialogDescription>
              Create a new holiday for the calendar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="Holiday name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={format(formData.date, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : new Date();
                  setFormData({ ...formData, date });
                }}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: string) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={HOLIDAY_TYPES.PUBLIC}>Public</SelectItem>
                  <SelectItem value={HOLIDAY_TYPES.OPTIONAL}>Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Locations</SelectItem>
                  {locations.filter(loc => loc !== "All").map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddHoliday} style={{ backgroundColor: themeColor }}>
              Add Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Holiday Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Holiday</DialogTitle>
            <DialogDescription>
              Update the holiday details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-date" className="text-right">
                Date
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={format(formData.date, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : new Date();
                  setFormData({ ...formData, date });
                }}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: string) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={HOLIDAY_TYPES.PUBLIC}>Public</SelectItem>
                  <SelectItem value={HOLIDAY_TYPES.OPTIONAL}>Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-location" className="text-right">
                Location
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Locations</SelectItem>
                  {locations.filter(loc => loc !== "All").map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditHoliday} style={{ backgroundColor: themeColor }}>
              Update Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the holiday
              "{currentHoliday?.name}" from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHoliday} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default AdminHolidays;
