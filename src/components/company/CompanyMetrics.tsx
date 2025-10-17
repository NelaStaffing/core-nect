import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, FileText, TrendingUp } from "lucide-react";

export default function CompanyMetrics() {
  const metrics = [
    {
      title: "Total Employees",
      value: "127",
      change: "+12%",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Active Surveys",
      value: "8",
      change: "+2",
      icon: FileText,
      color: "text-green-500",
    },
    {
      title: "Response Rate",
      value: "78%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      title: "Satisfaction Score",
      value: "4.2",
      change: "+0.3",
      icon: BarChart3,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Company Metrics</h1>
        <p className="text-muted-foreground mt-2">
          Overview of company performance and employee engagement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">{metric.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Distribution</CardTitle>
            <CardDescription>By department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Engineering', 'Sales', 'Marketing', 'Operations'].map((dept, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="w-32 text-sm">{dept}</div>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2" 
                      style={{ width: `${(idx + 1) * 20}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm text-muted-foreground">
                    {(idx + 1) * 20}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New employee joined", time: "2 hours ago" },
                { action: "Survey completed", time: "5 hours ago" },
                { action: "Feedback submitted", time: "1 day ago" },
                { action: "New survey created", time: "2 days ago" },
              ].map((activity, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}