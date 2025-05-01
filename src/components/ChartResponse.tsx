
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, LineChart, Line,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface ChartResponseProps {
  chartData?: any;
  explaination?: string;
}

// Colors for pie charts and other visualizations
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export function ChartResponse({ chartData, explaination }: ChartResponseProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [layout, setLayout] = useState<any>(null);
  const [title, setTitle] = useState<string>('');

  // Parse and prepare chart data for rendering
  useEffect(() => {
    if (!chartData) return;
    
    try {
      // If chartData is a string, try to parse it
      const data = typeof chartData === 'string' ? JSON.parse(chartData) : chartData;
      
      // Handle different data formats
      if (data.data && Array.isArray(data.data)) {
        // Simple array format
        setProcessedData(data.data);
        
        // Try to determine the best chart type based on the data
        if (data.data.length > 0 && typeof data.data[0].value === 'number') {
          // If we have name/value pairs, a pie chart might be good
          setChartType(data.data.length <= 8 ? 'pie' : 'bar');
        }
      } else if (data.layout) {
        // Handle plotly-style data with layout
        setLayout(data.layout);
        setTitle(data.layout.title?.text || '');
        
        // Extract data series
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          // Extract actual data points
          setProcessedData(transformPlotlyData(data.data));
          
          // Determine chart type based on the plotly data
          if (data.data[0].type === 'bar') {
            setChartType('bar');
          } else if (['scatter', 'line'].includes(data.data[0].type)) {
            setChartType('line');
          } else if (data.data[0].type === 'pie') {
            setChartType('pie');
          }
        }
      } else {
        // Fallback: just use the data as is if it's an array
        if (Array.isArray(data)) {
          setProcessedData(data);
        } else {
          console.warn('Unsupported chart data format:', data);
          setProcessedData([]);
        }
      }
    } catch (error) {
      console.error('Error parsing chart data:', error);
      setProcessedData([]);
    }
  }, [chartData]);

  // Function to transform Plotly-style data for Recharts
  const transformPlotlyData = (plotlyData: any[]) => {
    // This is a simplified transformation - we'd need more comprehensive logic
    // for a full Plotly to Recharts conversion
    if (!plotlyData || plotlyData.length === 0) return [];
    
    const firstTrace = plotlyData[0];
    
    // Handle bar chart data
    if (firstTrace.type === 'bar') {
      return firstTrace.x.map((label: string, index: number) => ({
        name: label,
        value: firstTrace.y[index]
      }));
    }
    
    // Handle line/scatter data
    if (['scatter', 'line'].includes(firstTrace.type)) {
      return firstTrace.x.map((x: number, index: number) => ({
        name: x.toString(),
        value: firstTrace.y[index]
      }));
    }
    
    return [];
  };

  // Render the appropriate chart based on chart type
  const renderChart = () => {
    if (!processedData || processedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500 italic">
          No chart data available
        </div>
      );
    }
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className="w-full bg-white border border-edelivery-gray">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-edelivery-dark-blue">
          {title || 'Data Visualization'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white rounded-md p-2 mb-3 border border-edelivery-light-blue/20 min-h-[300px]">
          {renderChart()}
        </div>
        {explaination && (
          <div className="text-sm text-gray-600 mt-2">
            <h4 className="font-semibold mb-1">Analysis:</h4>
            <p>{explaination}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
