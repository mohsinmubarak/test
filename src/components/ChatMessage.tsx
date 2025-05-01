
import React from 'react';
import { cn } from '@/lib/utils';
import { MessageCircle, CircleCheck, AlertCircle, User } from 'lucide-react';

export type MessageType = 'user' | 'ai' | 'error' | 'loading' | 'success';

interface ChatMessageProps {
  type: MessageType;
  content: string | React.ReactNode;
  timestamp?: string;
}

export function ChatMessage({ type, content, timestamp }: ChatMessageProps) {
  const isUser = type === 'user';
  const isError = type === 'error';
  const isLoading = type === 'loading';
  const isSuccess = type === 'success';
  
  return (
    <div className={cn(
      "flex w-full mb-4 animate-fade-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && !isLoading && (
        <div className="h-8 w-8 rounded-full bg-edelivery-blue flex items-center justify-center mr-2 flex-shrink-0">
          <MessageCircle size={16} className="text-white" />
        </div>
      )}
      {isUser && (
        <div className="h-8 w-8 rounded-full bg-edelivery-dark-blue flex items-center justify-center ml-2 order-2 flex-shrink-0">
          <User size={16} className="text-white" />
        </div>
      )}
      <div className={cn(
        "max-w-[80%] rounded-2xl p-4",
        isUser ? "bg-edelivery-dark-blue text-white rounded-tr-none order-1" : 
        isError ? "bg-red-100 text-red-800 border border-red-200 rounded-tl-none" :
        isLoading ? "bg-edelivery-light-gray border border-edelivery-gray rounded-tl-none" :
        isSuccess ? "bg-green-100 text-green-800 border border-green-200 rounded-tl-none" :
        "bg-edelivery-lightest-blue text-edelivery-dark-blue rounded-tl-none"
      )}>
        <div className="flex flex-col">
          <div className={cn("text-sm", isLoading && "animate-pulse-light")}>
            {content}
          </div>
          {timestamp && (
            <div className={cn(
              "text-xs mt-1",
              isUser ? "text-edelivery-lightest-blue" : "text-gray-500"
            )}>
              {timestamp}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
