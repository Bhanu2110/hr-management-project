import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, TrendingUp } from "lucide-react";

const attendanceData = [
  {
    id: 1,
    employee: "John Doe",
    checkIn: "09:15 AM",
    checkOut: "06:30 PM",
    date: "2024-01-15",
    status: "Present",
    hours: "9h 15m"
  },
  {
    id: 2,
    employee: "Sarah Wilson",
    checkIn: "08:45 AM",
    checkOut: "05:45 PM",
    date: "2024-01-15",
    status: "Present",
    hours: "9h 00m"
  },
  {
    id: 3,
    employee: "Mike Johnson",
    checkIn: "-",
    checkOut: "-",
    date: "2024-01-15",
    status: "Absent",
    hours: "0h 00m"
  }
];

const Attendance = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
            <p className="text-muted-foreground">Track employee attendance and working hours</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </Button>
            <Button className="bg-gradient-primary hover:opacity-90 text-white">
              <Clock className="h-4 w-4 mr-2" />
              Mark Attendance
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Present Today</p>
                  <p className="text-xl font-bold text-foreground">142</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Absent Today</p>
                  <p className="text-xl font-bold text-foreground">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Late Check-ins</p>
                  <p className="text-xl font-bold text-foreground">5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  <p className="text-xl font-bold text-foreground">94.7%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Check In</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Check Out</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total Hours</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((record) => (
                    <tr key={record.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{record.employee}</td>
                      <td className="py-3 px-4 text-muted-foreground">{record.checkIn}</td>
                      <td className="py-3 px-4 text-muted-foreground">{record.checkOut}</td>
                      <td className="py-3 px-4 text-muted-foreground">{record.hours}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={record.status === "Present" ? "default" : "destructive"}
                          className={record.status === "Present" ? "bg-success text-success-foreground" : ""}
                        >
                          {record.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Attendance;