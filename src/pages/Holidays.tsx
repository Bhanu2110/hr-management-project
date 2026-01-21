import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, X, ArrowUpDown } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Holiday, HOLIDAY_TYPES } from "@/types/holidays";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { holidayService } from "@/services/holidayService";
import { useTheme } from "@/context/ThemeContext";

type SortField = 'name' | 'date' | 'day' | 'type' | 'location';
type SortDirection = 'asc' | 'desc';

const Holidays = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isMonthFiltered, setIsMonthFiltered] = useState(false);
  const selectedYear = date ? String(date.getFullYear()) : String(currentMonth.getFullYear());
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const locations = ["All", "New York", "London", "Bangalore"];

  useEffect(() => {
    const getHolidays = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching holidays for year:", selectedYear, "and location:", selectedLocation);
        const data = await holidayService.fetchHolidays(selectedYear, selectedLocation);
        setHolidays(data);
      } catch (err) {
        setError("Failed to fetch holidays.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getHolidays();
  }, [date, currentMonth, selectedLocation]);

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

  const handleSort = (field: SortField) => {
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

  const getRowClassName = () => {
    return "bg-background hover:bg-muted/50";
  };

  const handleDownloadPdf = () => {
    if (sortedHolidays.length === 0) {
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Holiday List " + selectedYear, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    const tableColumn = ["S.No", "Holiday Name", "Date", "Day", "Type", "Location"];
    const tableRows: string[][] = [];

    sortedHolidays.forEach((holiday, index) => {
      const holidayData = [
        String(index + 1),
        holiday.name,
        holiday.date,
        holiday.day,
        holiday.type,
        holiday.location || "N/A",
      ];
      tableRows.push(holidayData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [20, 100, 160], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      didDrawPage: (data: any) => {
        let str = "Page " + (doc as any).internal.getNumberOfPages();
        if (typeof (doc as any).putTotalPages === 'function') {
          str = str + " of " + (doc as any).internal.getNumberOfPages();
        }
        doc.setFontSize(10);
        doc.text(str, data.settings.margin.left, (doc as any).internal.pageSize.height - 10);
      }
    });

    doc.save(`Holidays_${selectedYear}.pdf`);
  };

  const { themeColor } = useTheme();

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold">Holidays</CardTitle>
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
                    }
                  }}
                  month={currentMonth}
                  onMonthChange={(newMonth) => {
                    setCurrentMonth(newMonth);
                    setDate(undefined);
                    setIsMonthFiltered(true);
                  }}
                  className="w-full sm:w-[180px]"
                />
                {(date || isMonthFiltered) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setDate(undefined);
                      setIsMonthFiltered(false);
                      setCurrentMonth(new Date());
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
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleDownloadPdf} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" /> Download PDF
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedHolidays.length > 0 ? (
                      sortedHolidays.map((holiday, index) => (
                        <TableRow key={holiday.id} id={`holiday-${holiday.date}`} className={getRowClassName()}>
                          <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="font-medium">{holiday.name}</TableCell>
                          <TableCell>{holiday.date}</TableCell>
                          <TableCell>{holiday.day}</TableCell>
                          <TableCell>{holiday.type}</TableCell>
                          <TableCell>{holiday.location || "N/A"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
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
    </AppLayout>
  );

};

export default Holidays;
