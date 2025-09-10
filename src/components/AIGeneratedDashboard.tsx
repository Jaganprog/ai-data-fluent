import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Calendar,
  FileText,
  Target,
  Activity
} from "lucide-react";

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  chartType: string;
  data: any[];
  insights: string[];
  colorScheme: string[];
}

interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  icon: string;
}

interface DashboardConfig {
  name: string;
  description: string;
  category: string;
  widgets: DashboardWidget[];
  layout: string;
  metrics: DashboardMetric[];
}

interface AIGeneratedDashboardProps {
  config: DashboardConfig;
}

const iconMap = {
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
  Calendar,
  FileText,
  Target,
  Activity
};

export const AIGeneratedDashboard = ({ config }: AIGeneratedDashboardProps) => {
  const renderChart = (widget: DashboardWidget) => {
    if (!widget.data || widget.data.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center bg-muted rounded-lg">
          <p className="text-muted-foreground">No data available</p>
        </div>
      );
    }

    const colors = widget.colorScheme || ['#8884d8', '#82ca9d', '#ffc658'];
    const chartConfig = {
      data: {
        label: "Data",
        color: colors[0],
      },
    };

    switch (widget.chartType?.toLowerCase()) {
      case 'bar':
        const barDataKey = Object.keys(widget.data[0]).find(key => 
          typeof widget.data[0][key] === 'number'
        ) || 'value';
        const barNameKey = Object.keys(widget.data[0]).find(key => 
          typeof widget.data[0][key] === 'string'
        ) || 'name';
        
        return (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={widget.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={barNameKey} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey={barDataKey} fill={colors[0]} />
            </BarChart>
          </ChartContainer>
        );
        
      case 'line':
        const lineDataKey = Object.keys(widget.data[0]).find(key => 
          typeof widget.data[0][key] === 'number'
        ) || 'value';
        const lineNameKey = Object.keys(widget.data[0]).find(key => 
          typeof widget.data[0][key] === 'string'
        ) || 'name';
        
        return (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={widget.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={lineNameKey} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey={lineDataKey} stroke={colors[0]} strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        );
        
      case 'pie':
        const pieDataKey = Object.keys(widget.data[0]).find(key => 
          typeof widget.data[0][key] === 'number'
        ) || 'value';
        const pieNameKey = Object.keys(widget.data[0]).find(key => 
          typeof widget.data[0][key] === 'string'
        ) || 'name';
        
        return (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <PieChart>
              <Pie
                data={widget.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill={colors[0]}
                dataKey={pieDataKey}
                nameKey={pieNameKey}
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {widget.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        );
        
      default:
        return (
          <div className="h-[300px] flex items-center justify-center bg-muted rounded-lg">
            <p className="text-muted-foreground">Chart type "{widget.chartType}" not supported</p>
          </div>
        );
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || BarChart3;
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{config.name}</h1>
        <p className="text-muted-foreground">{config.description}</p>
      </div>

      {/* Metrics Cards */}
      {config.metrics && config.metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.metrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs text-accent">{metric.change}</p>
                  </div>
                  <div className="text-primary">
                    {getIcon(metric.icon)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Widgets */}
      <div className={`grid gap-6 ${
        config.layout === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 
        config.layout === 'masonry' ? 'grid-cols-1 lg:grid-cols-2' : 
        'grid-cols-1'
      }`}>
        {config.widgets.map((widget) => (
          <Card key={widget.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                {widget.title}
              </CardTitle>
              {widget.insights && widget.insights.length > 0 && (
                <CardDescription>
                  {widget.insights[0]}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {renderChart(widget)}
              
              {/* Widget Insights */}
              {widget.insights && widget.insights.length > 1 && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Key Insights:</h4>
                  <ul className="text-sm space-y-1">
                    {widget.insights.slice(1).map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};