
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ReportResponseProps {
  data: any;
  explaination?: string;
}

export function ReportResponse({ data, explaination }: ReportResponseProps) {
  // Convert the report data to a more readable format
  const renderReportData = () => {
    if (!data) return <p className="text-gray-500">No report data available</p>;

    try {
      // Check if data contains paired arrays (keys and values) like role_name and count
      // This is a common format for reports with columns and values
      const keyArrays = Object.entries(data).filter(
        ([key, value]) => key !== 'explaination' && Array.isArray(Object(value)) && !Array.isArray(value)
      );

      // If we have arrays that look like columns, render as a table
      if (keyArrays.length >= 2) {
        // Find arrays with matching indices (column pairs)
        const columns = keyArrays.map(([key]) => key);
        const rows = [];
        
        // Get the first column array to determine number of rows
        const firstColKey = keyArrays[0][0];
        const firstCol = data[firstColKey];
        const rowCount = Object.keys(firstCol).length;
        
        // Create rows from the column data
        for (let i = 0; i < rowCount; i++) {
          const row: Record<string, any> = {};
          columns.forEach(col => {
            row[col] = data[col][i.toString()];
          });
          rows.push(row);
        }
        
        // Render as table
        return (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col} className="capitalize">
                      {col.replace(/_/g, ' ')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((col) => (
                      <TableCell key={`${rowIndex}-${col}`}>
                        {row[col]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      }
      
      // Handle regular object format (key-value pairs)
      return (
        <div className="space-y-4">
          {Object.entries(data).map(([key, value]: [string, any]) => {
            // Skip rendering explaination as it's handled separately
            if (key === 'explaination') return null;
            
            // If value is an object, render it with more structure
            if (typeof value === 'object' && value !== null) {
              return (
                <div key={key} className="border-b pb-2 mb-2">
                  <h4 className="font-medium text-edelivery-dark-blue capitalize">{key.replace(/_/g, ' ')}</h4>
                  <div className="pl-2 border-l-2 border-edelivery-light-blue mt-1">
                    {Object.entries(value as object).map(([subKey, subValue]) => (
                      <div key={subKey} className="py-1 flex justify-between">
                        <span className="text-gray-700">{subKey}:</span>
                        <span className="font-mono">{String(subValue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            
            // Simple key-value display
            return (
              <div key={key} className="border-b pb-2 mb-2">
                <h4 className="font-medium text-edelivery-dark-blue capitalize">{key.replace(/_/g, ' ')}</h4>
                <p>{String(value)}</p>
              </div>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error('Error rendering report data:', error);
      return <p className="text-red-500">Error rendering report data</p>;
    }
  };

  return (
    <Card className="w-full bg-white border border-edelivery-gray">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-edelivery-dark-blue">Report Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {renderReportData()}
          {explaination && (
            <div className="text-sm text-gray-600 mt-4 pt-4 border-t border-edelivery-gray">
              <h4 className="font-semibold mb-1">Analysis:</h4>
              <p>{explaination}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
