import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Calendar, DollarSign } from "lucide-react";

interface StaffingEntry {
  id: string;
  name: string;
  type: "contractor" | "temp" | "agency";
  startDate: string;
  endDate: string;
  rate: string;
  agency?: string;
  status: "active" | "ending-soon" | "inactive";
}

export default function StaffingManagement() {
  const [staffing] = useState<StaffingEntry[]>([
    {
      id: "1",
      name: "Ahmed Hassan",
      type: "contractor",
      startDate: "2025-01-15",
      endDate: "2025-06-15",
      rate: "$85/hr",
      status: "active"
    },
    {
      id: "2",
      name: "John Park",
      type: "temp",
      startDate: "2025-02-01",
      endDate: "2025-04-30",
      rate: "$65/hr",
      status: "ending-soon"
    },
    {
      id: "3",
      name: "Lisa Martinez",
      type: "agency",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      rate: "$95/hr",
      agency: "TechStaff Pro",
      status: "active"
    },
    {
      id: "4",
      name: "David Chen",
      type: "contractor",
      startDate: "2024-09-01",
      endDate: "2025-03-01",
      rate: "$90/hr",
      status: "ending-soon"
    }
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "contractor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "temp":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "agency":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "ending-soon":
        return "bg-yellow-500";
      case "inactive":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const activeCount = staffing.filter(s => s.status === "active").length;
  const endingSoon = staffing.filter(s => s.status === "ending-soon").length;
  const contractorCount = staffing.filter(s => s.type === "contractor").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Staffing Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage contractors, temporary staff, and agency workers
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Ending Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{endingSoon}</div>
            <p className="text-xs text-muted-foreground mt-1">Contracts expiring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contractors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{contractorCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Independent workers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Avg Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$84</div>
            <p className="text-xs text-muted-foreground mt-1">Per hour</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staffing Overview</CardTitle>
          <CardDescription>All contractors, temps, and agency workers</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Staff</TabsTrigger>
              <TabsTrigger value="contractor">Contractors</TabsTrigger>
              <TabsTrigger value="temp">Temporary</TabsTrigger>
              <TabsTrigger value="agency">Agency</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffing.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(staff.type)}>
                          {staff.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(staff.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(staff.endDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">{staff.rate}</TableCell>
                      <TableCell>{staff.agency || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(staff.status)}`} />
                          <span className="text-sm capitalize">{staff.status.replace("-", " ")}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="contractor">
              <div className="text-center py-8 text-muted-foreground">
                Filter showing contractors only
              </div>
            </TabsContent>

            <TabsContent value="temp">
              <div className="text-center py-8 text-muted-foreground">
                Filter showing temporary staff only
              </div>
            </TabsContent>

            <TabsContent value="agency">
              <div className="text-center py-8 text-muted-foreground">
                Filter showing agency workers only
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
