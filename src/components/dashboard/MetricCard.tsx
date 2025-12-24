import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral" | "info" | "warning";
  icon: LucideIcon;
  iconColor?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-primary"
}: MetricCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive": return "text-green-600";
      case "negative": return "text-red-600";
      case "neutral": return "text-gray-500";
      case "info": return "text-blue-600";       // <-- valid Tailwind class
      case "warning": return "text-yellow-600";  // <-- valid Tailwind class
      default: return "text-gray-500";
    }
  };


  return (
    <Card className="bg-metric-bg border-border shadow-card hover:shadow-elevated transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <p className={`text-xs ${getChangeColor()} mt-1`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}