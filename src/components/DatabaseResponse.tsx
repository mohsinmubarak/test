
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DatabaseResponseProps {
  data: any;
  isLoading?: boolean;
}

export function DatabaseResponse({ data, isLoading = false }: DatabaseResponseProps) {
  if (isLoading) {
    return (
      <Card className="w-full bg-white border border-edelivery-gray animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-edelivery-dark-blue">Loading Results...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-edelivery-light-gray rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return (
      <Card className="w-full bg-white border border-edelivery-gray">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-edelivery-dark-blue">No Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No data available for this query.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white border border-edelivery-gray">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-edelivery-dark-blue">Query Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded border border-edelivery-gray overflow-auto max-h-[300px]">
          <pre className="p-4 text-sm whitespace-pre-wrap">
            {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
