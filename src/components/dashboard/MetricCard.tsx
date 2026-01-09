import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral" | "info" | "warning";
  icon: LucideIcon;
  iconColor?: string;
  percentage?: number;
  percentageColor?: string;
}

function CircularProgress({ percentage, color }: { percentage: number; color: string }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted/30"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span className="absolute text-xs font-semibold" style={{ color }}>
        {percentage > 0 ? '+' : ''}{percentage}%
      </span>
    </div>
  );
}

export const MetricCard = function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-primary",
  percentage,
  percentageColor = "#22c55e"
}: MetricCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive": return "text-green-600";
      case "negative": return "text-red-600";
      case "neutral": return "text-gray-500";
      case "info": return "text-blue-600";
      case "warning": return "text-yellow-600";
      default: return "text-gray-500";
    }
  };

  return (
    <Card className="bg-metric-bg border-border shadow-card hover:shadow-elevated transition-all duration-200">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
            {change && (
              <p className={`text-xs ${getChangeColor()} flex items-center gap-1`}>
                <span className="inline-block">↗</span> {change}
              </p>
            )}
          </div>
          {percentage !== undefined && (
            <CircularProgress percentage={percentage} color={percentageColor} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}