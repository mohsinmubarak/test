
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface QueryInputProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
}

export function QueryInput({ onSubmit, isLoading = false }: QueryInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query);
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2 items-center">
      <Input
        placeholder="Ask about your e-delivery data..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 rounded-full px-4 border border-edelivery-gray focus:border-edelivery-blue focus:ring-1 focus:ring-edelivery-blue"
        disabled={isLoading}
      />
      <Button 
        type="submit"
        disabled={!query.trim() || isLoading}
        className="rounded-full aspect-square p-2 bg-edelivery-blue hover:bg-edelivery-dark-blue text-white"
      >
        <Send size={18} />
      </Button>
    </form>
  );
}
