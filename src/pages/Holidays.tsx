import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { Holiday } from "@/types/holidays";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { fetchHolidays } from "@/services/holidayService";

const Holidays = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i));
  const locations = ["All", "New York", "London", "Bangalore"]; // These should ideally come from an API or be more dynamic

  useEffect(() => {
    const getHolidays = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching holidays for year:", selectedYear, "and location:", selectedLocation);
        const data = await fetchHolidays(selectedYear, selectedLocation);
        setHolidays(data);
      } catch (err) {
        setError("Failed to fetch holidays.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getHolidays();
  }, [selectedYear, selectedLocation]);

  const filteredHolidays = useMemo(() => {
    return holidays.filter((holiday) => {
      const matchesSearch = holiday.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            holiday.day.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, holidays]);

  const getRowClassName = (holidayType: Holiday["type"]) => {
    switch (holidayType) {
      case "Public":
        return "bg-blue-50/50 hover:bg-blue-100/50"; // Light blue for public holidays
      case "Optional":
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

  return (
    <div className="holidays-container p-4 sm:p-6 lg:p-8">
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
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Holiday Name</TableHead>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead className="w-[100px]">Day</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="w-[150px]">Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHolidays.length > 0 ? (
                    filteredHolidays.map((holiday) => (
                      <TableRow key={holiday.id} className={getRowClassName(holiday.type)}>
                        <TableCell className="font-medium">{holiday.name}</TableCell>
                        <TableCell>{holiday.date}</TableCell>
                        <TableCell>{holiday.day}</TableCell>
                        <TableCell>{holiday.type}</TableCell>
                        <TableCell>{holiday.location || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No holidays found.
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
  );
};

export default Holidays;
