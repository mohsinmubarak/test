// import React, { useState, useRef, useEffect } from 'react';
// import { ChatMessage } from './ChatMessage';
// import { QueryInput } from './QueryInput';
// import { DatabaseResponse } from './DatabaseResponse';
// import { CircleCheck } from 'lucide-react';
// import { useToast } from "@/hooks/use-toast";
// import { sendQueryToAI, AIApiResponse } from '@/services/api';
// import Plot from 'react-plotly.js';

// interface ChatHistoryItem {
//   id: string;
//   type: 'user' | 'ai' | 'error' | 'loading';
//   content: string | React.ReactNode;
//   timestamp: string;
//   response?: AIApiResponse;
// }

// function ChartResponse({ chartData, explaination }: { chartData: any; explaination?: string }) {
//   const downloadChart = () => {
//     const chartHtml = `
//       <html>
//         <head>
//           <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
//         </head>
//         <body>
//           <div id="chart"></div>
//           <script>
//             Plotly.newPlot('chart', ${JSON.stringify(chartData.data)}, ${JSON.stringify(chartData.layout)});
//           </script>
//         </body>
//       </html>
//     `;
//     const blob = new Blob([chartHtml], { type: 'text/html' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'chart.html';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   if (!chartData || !chartData.data || !chartData.layout) {
//     return <div>No chart data available</div>;
//   }

//   return (
//     <div className="flex flex-col space-y-4 w-full">
//       <div className="w-full overflow-x-auto">
//         <div className="min-w-[700px]">
//           <Plot
//             data={chartData.data}
//             layout={{
//               ...chartData.layout,
//               autosize: true,
//               height: 500,
//               legend: { orientation: 'h' },
//             }}
//             config={{ responsive: true, displaylogo: false }}
//             style={{ width: '100%', height: '500px' }}
//           />
//         </div>
//       </div>
//       <button
//         onClick={downloadChart}
//         className="self-start px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
//       >
//         Download Chart
//       </button>
//       {explaination && (
//         <div className="text-sm text-gray-600 mt-2">
//           <strong>explanation:</strong> {explaination}
//         </div>
//       )}
//     </div>
//   );
// }

// function ReportResponse({ reportData, explaination }: { reportData: any; explaination?: string }) {
//   if (!reportData || typeof reportData !== 'object') {
//     return <div>No report data available</div>;
//   }

//   const columns = Object.keys(reportData);
//   const rowCount = Object.keys(reportData[columns[0]] || {}).length;

//   const rows = Array.from({ length: rowCount }, (_, idx) => (
//     <tr key={idx}>
//       {columns.map(col => (
//         <td key={col} className="border px-4 py-2">{reportData[col][idx]}</td>
//       ))}
//     </tr>
//   ));

//   const downloadReport = () => {
//     const csvContent = [columns.join(',')]
//       .concat(
//         Array.from({ length: rowCount }, (_, i) =>
//           columns.map(col => `"${reportData[col][i]}"`).join(',')
//         )
//       )
//       .join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'report.csv';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="flex flex-col space-y-4">
//       <div className="overflow-x-auto">
//         <table className="table-auto w-full border-collapse border border-gray-300">
//           <thead>
//             <tr>
//               {columns.map(col => (
//                 <th key={col} className="border px-4 py-2 bg-gray-100">{col}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>{rows}</tbody>
//         </table>
//       </div>
//       <button
//         onClick={downloadReport}
//         className="self-start px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
//       >
//         Download Report
//       </button>
//       {explaination && (
//         <div className="text-sm text-gray-600 mt-2">
//           <strong>explanation:</strong> {explaination}
//         </div>
//       )}
//     </div>
//   );
// }

// export function AIQueryEngine() {
//   const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [userRole, setUserRole] = useState<'Admin' | 'Consultant'>('Admin');
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const { toast } = useToast();

//   const getUserEmail = (role: 'Admin' | 'Consultant') =>
//     role === 'Admin' ? 'user_89@example.com' : 'user_21@example.com';

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [chatHistory]);

//   const getTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

//   const handleQuerySubmit = async (query: string) => {
//     const messageId = Date.now().toString();
//     const userEmail = getUserEmail(userRole);

//     setChatHistory(prev => [
//       ...prev,
//       { id: messageId, type: 'user', content: query, timestamp: getTimestamp() },
//       {
//         id: `${messageId}-loading`,
//         type: 'loading',
//         content: 'Understanding your query, thinking to get the best result for you...',
//         showSpinner: true,
//         timestamp: getTimestamp()
//       }
//     ]);
    
//     setIsLoading(true);
    
//     try {
//       const response = await sendQueryToAI(query, userEmail);
//       setChatHistory(prev => prev.filter(item => item.id !== `${messageId}-loading`));

//       if (response.query_class === 'error' || response.status_code >= 400) {
//         toast({
//           title: "Error",
//           description: typeof response.data === 'string' ? response.data : "An error occurred processing your query",
//           variant: "destructive",
//         });

//         setChatHistory(prev => [
//           ...prev,
//           {
//             id: `${messageId}-error`,
//             type: 'error',
//             content: typeof response.data === 'string' ? response.data : "Sorry, something went wrong.",
//             timestamp: getTimestamp(),
//             response
//           }
//         ]);
//       } else {
//         setChatHistory(prev => [
//           ...prev,
//           {
//             id: `${messageId}-response`,
//             type: 'ai',
//             content: renderResponseContent(response),
//             timestamp: getTimestamp(),
//             response
//           }
//         ]);
//       }
//     } catch (error) {
//       console.error('Error during query processing:', error);
//       setChatHistory(prev => prev.filter(item => item.id !== `${messageId}-loading`));

//       toast({
//         title: "Connection Error",
//         description: "Could not connect to the AI service. Please try again later.",
//         variant: "destructive",
//       });

//       setChatHistory(prev => [
//         ...prev,
//         {
//           id: `${messageId}-error`,
//           type: 'error',
//           content: 'Sorry, there was an error connecting to the AI service.',
//           timestamp: getTimestamp()
//         }
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderResponseContent = (response: AIApiResponse) => {
//     switch (response.query_class) {
//       case 'graph':
//         return (
//           <>
//             <p className="mb-3">Here's a visualization based on your query:</p>
//             <ChartResponse chartData={response.data} explaination={response.explaination} />
//           </>
//         );
//       case 'report':
//         return (
//           <>
//             <p className="mb-3">Here's the report you requested:</p>
//             <ReportResponse reportData={response.data} explaination={response.explaination} />
//           </>
//         );
//       case 'database':
//         return typeof response.data === 'string'
//           ? response.data
//           : <DatabaseResponse data={response.data} />;
//       case 'error':
//         return <span className="text-red-500">{response.data}</span>;
//       case 'general':
//       default:
//         return typeof response.data === 'string'
//           ? response.data
//           : JSON.stringify(response.data);
//     }
//   };

//   return (
//     <div className="flex flex-col h-full">
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {chatHistory.length === 0 ? (
//           <div className="h-full flex flex-col items-center justify-center text-center p-6">
//             <div className="w-16 h-16 rounded-full bg-edelivery-lightest-blue flex items-center justify-center mb-4">
//               <CircleCheck className="text-edelivery-blue" size={28} />
//             </div>
//             <h2 className="text-xl font-semibold text-edelivery-dark-blue mb-2">E-delivery AI Assistant</h2>
//             <p className="text-gray-600 max-w-md">
//               Welcome! Ask me anything about your e-delivery data, project information, or request reports and visualizations.
//             </p>
//           </div>
//         ) : (
//           chatHistory.map((message) => (
//             <ChatMessage
//               key={message.id}
//               type={message.type}
//               content={message.content}
//               timestamp={message.timestamp}
//             />
//           ))
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       <div className="border-t border-edelivery-gray p-4 bg-white">
//         <div className="flex items-center justify-between mb-2">
//           <label className="text-sm font-medium text-gray-700">Select Role:</label>
//           <select
//             value={userRole}
//             onChange={(e) => setUserRole(e.target.value as 'Admin' | 'Consultant')}
//             className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none"
//           >
//             <option value="Admin">Admin</option>
//             <option value="Consultant">Consultant</option>
//           </select>
//         </div>
//         <QueryInput onSubmit={handleQuerySubmit} isLoading={isLoading} />
//       </div>
//     </div>
//   );
// }

// v3
// import React, { useState, useRef, useEffect } from 'react';
// import { ChatMessage } from './ChatMessage';
// import { QueryInput } from './QueryInput';
// import { DatabaseResponse } from './DatabaseResponse';
// import { CircleCheck } from 'lucide-react';
// import { useToast } from "@/hooks/use-toast";
// import { sendQueryToAI, AIApiResponse } from '@/services/api';
// import Plot from 'react-plotly.js';

// interface ChatHistoryItem {
//   id: string;
//   type: 'user' | 'ai' | 'error' | 'loading';
//   content: string | React.ReactNode;
//   timestamp: string;
//   response?: AIApiResponse;
// }

// function ChartResponse({ chartData, explaination }: { chartData: any; explaination?: string }) {
//   const downloadChart = () => {
//     const chartHtml = `
//       <html>
//         <head>
//           <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
//         </head>
//         <body>
//           <div id="chart"></div>
//           <script>
//             Plotly.newPlot('chart', ${JSON.stringify(chartData.data)}, ${JSON.stringify(chartData.layout)});
//           </script>
//         </body>
//       </html>
//     `;
//     const blob = new Blob([chartHtml], { type: 'text/html' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'chart.html';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   if (!chartData || !chartData.data || !chartData.layout) {
//     return <div>No chart data available</div>;
//   }

//   return (
//     <div className="flex flex-col space-y-4 w-full">
//       <div className="w-full overflow-x-auto">
//         <div className="min-w-[700px]">
//           <Plot
//             data={chartData.data}
//             layout={{
//               ...chartData.layout,
//               autosize: true,
//               height: 500,
//               legend: { orientation: 'h' },
//             }}
//             config={{ responsive: true, displaylogo: false }}
//             style={{ width: '100%', height: '500px' }}
//           />
//         </div>
//       </div>
//       <button
//         onClick={downloadChart}
//         className="self-start px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
//       >
//         Download Chart
//       </button>
//       {explaination && (
//         <div className="text-sm text-gray-600 mt-2">
//           <strong>explanation:</strong> {explaination}
//         </div>
//       )}
//     </div>
//   );
// }

// function ReportResponse({ reportData, explaination }: { reportData: any; explaination?: string }) {
//   if (!reportData || typeof reportData !== 'object') {
//     return <div>No report data available</div>;
//   }

//   const columns = Object.keys(reportData);
//   const rowCount = Object.keys(reportData[columns[0]] || {}).length;

//   const rows = Array.from({ length: rowCount }, (_, idx) => (
//     <tr key={idx}>
//       {columns.map(col => (
//         <td key={col} className="border px-4 py-2">{reportData[col][idx]}</td>
//       ))}
//     </tr>
//   ));

//   const downloadReport = () => {
//     const csvContent = [columns.join(',')]
//       .concat(
//         Array.from({ length: rowCount }, (_, i) =>
//           columns.map(col => `"${reportData[col][i]}"`).join(',')
//         )
//       )
//       .join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'report.csv';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="flex flex-col space-y-4">
//       <div className="overflow-x-auto">
//         <table className="table-auto w-full border-collapse border border-gray-300">
//           <thead>
//             <tr>
//               {columns.map(col => (
//                 <th key={col} className="border px-4 py-2 bg-gray-100">{col}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>{rows}</tbody>
//         </table>
//       </div>
//       <button
//         onClick={downloadReport}
//         className="self-start px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
//       >
//         Download Report
//       </button>
//       {explaination && (
//         <div className="text-sm text-gray-600 mt-2">
//           <strong>explanation:</strong> {explaination}
//         </div>
//       )}
//     </div>
//   );
// }

// export function AIQueryEngine() {
//   const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [userRole, setUserRole] = useState<'Admin' | 'Consultant'>('Admin');
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const { toast } = useToast();

//   const getUserEmail = (role: 'Admin' | 'Consultant') =>
//     role === 'Admin' ? 'user_89@example.com' : 'user_21@example.com';

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [chatHistory]);

//   const getTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

//   const handleQuerySubmit = async (query: string) => {
//     const messageId = Date.now().toString();
//     const userEmail = getUserEmail(userRole);

//     setChatHistory(prev => [
//       ...prev,
//       { id: messageId, type: 'user', content: query, timestamp: getTimestamp() },
//       {
//         id: `${messageId}-ai-streaming`,
//         type: 'ai',
//         content: '',
//         timestamp: getTimestamp()
//       }
//     ]);

//     setIsLoading(true);

//     try {
//       const response = await sendQueryToAI(query, userEmail, (token: string) => {
//         setChatHistory(prev =>
//           prev.map((msg) =>
//             msg.id === `${messageId}-ai-streaming`
//               ? { ...msg, content: (msg.content as string) + token }
//               : msg
//           )
//         );
//       });

//       if (response.query_class !== 'general' && response.query_class !== 'database') {
//         // Replace placeholder with actual component
//         setChatHistory(prev =>
//           prev.map((msg) =>
//             msg.id === `${messageId}-ai-streaming`
//               ? {
//                   ...msg,
//                   content: renderResponseContent(response),
//                   response
//                 }
//               : msg
//           )
//         );
//       }
//     } catch (error) {
//       console.error('Error during query processing:', error);

//       toast({
//         title: "Connection Error",
//         description: "Could not connect to the AI service. Please try again later.",
//         variant: "destructive",
//       });

//       setChatHistory(prev =>
//         prev.map((msg) =>
//           msg.id === `${messageId}-ai-streaming`
//             ? {
//                 ...msg,
//                 type: 'error',
//                 content: 'Sorry, there was an error connecting to the AI service.'
//               }
//             : msg
//         )
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderResponseContent = (response: AIApiResponse) => {
//     switch (response.query_class) {
//       case 'graph':
//         return (
//           <>
//             <p className="mb-3">Here's a visualization based on your query:</p>
//             <ChartResponse chartData={response.data} explaination={response.explaination} />
//           </>
//         );
//       case 'report':
//         return (
//           <>
//             <p className="mb-3">Here's the report you requested:</p>
//             <ReportResponse reportData={response.data} explaination={response.explaination} />
//           </>
//         );
//       case 'database':
//         return typeof response.data === 'string'
//           ? response.data
//           : <DatabaseResponse data={response.data} />;
//       case 'error':
//         return <span className="text-red-500">{response.data}</span>;
//       case 'general':
//       default:
//         return typeof response.data === 'string'
//           ? response.data
//           : JSON.stringify(response.data);
//     }
//   };

//   return (
//     <div className="flex flex-col h-full">
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {chatHistory.length === 0 ? (
//           <div className="h-full flex flex-col items-center justify-center text-center p-6">
//             <div className="w-16 h-16 rounded-full bg-edelivery-lightest-blue flex items-center justify-center mb-4">
//               <CircleCheck className="text-edelivery-blue" size={28} />
//             </div>
//             <h2 className="text-xl font-semibold text-edelivery-dark-blue mb-2">E-delivery AI Assistant</h2>
//             <p className="text-gray-600 max-w-md">
//               Welcome! Ask me anything about your e-delivery data, project information, or request reports and visualizations.
//             </p>
//           </div>
//         ) : (
//           chatHistory.map((message) => (
//             <ChatMessage
//               key={message.id}
//               type={message.type}
//               content={message.content}
//               timestamp={message.timestamp}
//             />
//           ))
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       <div className="border-t border-edelivery-gray p-4 bg-white">
//         <div className="flex items-center justify-between mb-2">
//           <label className="text-sm font-medium text-gray-700">Select Role:</label>
//           <select
//             value={userRole}
//             onChange={(e) => setUserRole(e.target.value as 'Admin' | 'Consultant')}
//             className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none"
//           >
//             <option value="Admin">Admin</option>
//             <option value="Consultant">Consultant</option>
//           </select>
//         </div>
//         <QueryInput onSubmit={handleQuerySubmit} isLoading={isLoading} />
//       </div>
//     </div>
//   );
// }

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { QueryInput } from './QueryInput';
import { DatabaseResponse } from './DatabaseResponse';
import { CircleCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { sendQueryToAI, AIApiResponse } from '@/services/api';
import Plot from 'react-plotly.js';

interface ChatHistoryItem {
  id: string;
  type: 'user' | 'ai' | 'error' | 'loading';
  content: string | React.ReactNode;
  timestamp: string;
  response?: AIApiResponse;
  showSpinner?: boolean;
}

function ChartResponse({ chartData, explaination }: { chartData: any; explaination?: string }) {
  const downloadChart = () => {
    const chartHtml = `
      <html>
        <head>
          <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        </head>
        <body>
          <div id="chart"></div>
          <script>
            Plotly.newPlot('chart', ${JSON.stringify(chartData.data)}, ${JSON.stringify(chartData.layout)});
          </script>
        </body>
      </html>
    `;
    const blob = new Blob([chartHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chart.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!chartData || !chartData.data || !chartData.layout) {
    return <div>No chart data available</div>;
  }

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="w-full overflow-x-auto">
        <div className="min-w-[700px]">
          <Plot
            data={chartData.data}
            layout={{
              ...chartData.layout,
              autosize: true,
              height: 500,
              legend: { orientation: 'h' },
            }}
            config={{ responsive: true, displaylogo: false }}
            style={{ width: '100%', height: '500px' }}
          />
        </div>
      </div>
      <button
        onClick={downloadChart}
        className="self-start px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        Download Chart
      </button>
      {explaination && (
        <div className="text-sm text-gray-600 mt-2">
          <strong>explanation:</strong> {explaination}
        </div>
      )}
    </div>
  );
}

function ReportResponse({ reportData, explaination }: { reportData: any; explaination?: string }) {
  if (!reportData || typeof reportData !== 'object') {
    return <div>No report data available</div>;
  }

  const columns = Object.keys(reportData);
  const rowCount = Object.keys(reportData[columns[0]] || {}).length;

  const rows = Array.from({ length: rowCount }, (_, idx) => (
    <tr key={idx}>
      {columns.map(col => (
        <td key={col} className="border px-4 py-2">{reportData[col][idx]}</td>
      ))}
    </tr>
  ));

  const downloadReport = () => {
    const csvContent = [columns.join(',')]
      .concat(
        Array.from({ length: rowCount }, (_, i) =>
          columns.map(col => `"${reportData[col][i]}"`).join(',')
        )
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} className="border px-4 py-2 bg-gray-100">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
      <button
        onClick={downloadReport}
        className="self-start px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
      >
        Download Report
      </button>
      {explaination && (
        <div className="text-sm text-gray-600 mt-2">
          <strong>explanation:</strong> {explaination}
        </div>
      )}
    </div>
  );
}

export function AIQueryEngine() {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<'Admin' | 'Consultant'>('Admin');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const getUserEmail = (role: 'Admin' | 'Consultant') =>
    role === 'Admin' ? 'user_89@example.com' : 'user_21@example.com';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const getTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleQuerySubmit = async (query: string) => {
    const messageId = Date.now().toString();
    const userEmail = getUserEmail(userRole);

    setChatHistory(prev => [
      ...prev,
      { id: messageId, type: 'user', content: query, timestamp: getTimestamp() },
      {
        id: `${messageId}-ai-streaming`,
        type: 'ai',
        content: 'Understanding your query to get best result...',
        timestamp: getTimestamp(),
        showSpinner: true
      }
    ]);

    setIsLoading(true);

    try {
      const response = await sendQueryToAI(query, userEmail, (token: string) => {
        setChatHistory(prev =>
          prev.map(msg =>
            msg.id === `${messageId}-ai-streaming`
              ? {
                  ...msg,
                  content:
                    typeof msg.content === 'string'
                      ? msg.content.replace("Understanding your query to get best result...", "") + token
                      : token,
                  showSpinner: true
                }
              : msg
          )
        );
      });

      if (response.query_class !== 'general' && response.query_class !== 'database') {
        setChatHistory(prev =>
          prev.map(msg =>
            msg.id === `${messageId}-ai-streaming`
              ? {
                  ...msg,
                  content: renderResponseContent(response),
                  showSpinner: false,
                  response
                }
              : msg
          )
        );
      } else {
        setChatHistory(prev =>
          prev.map(msg =>
            msg.id === `${messageId}-ai-streaming`
              ? {
                  ...msg,
                  showSpinner: false,
                  response
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error during query processing:', error);
      toast({
        title: "Connection Error",
        description: "Could not connect to the AI service. Please try again later.",
        variant: "destructive",
      });

      setChatHistory(prev =>
        prev.map(msg =>
          msg.id === `${messageId}-ai-streaming`
            ? {
                ...msg,
                type: 'error',
                content: 'Sorry, there was an error connecting to the AI service.',
                showSpinner: false
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderResponseContent = (response: AIApiResponse) => {
    switch (response.query_class) {
      case 'graph':
        return (
          <>
            <p className="mb-3">Here's a visualization based on your query:</p>
            <ChartResponse chartData={response.data} explaination={response.explaination} />
          </>
        );
      case 'report':
        return (
          <>
            <p className="mb-3">Here's the report you requested:</p>
            <ReportResponse reportData={response.data} explaination={response.explaination} />
          </>
        );
      case 'database':
        return typeof response.data === 'string'
          ? response.data
          : <DatabaseResponse data={response.data} />;
      case 'error':
        return <span className="text-red-500">{response.data}</span>;
      case 'general':
      default:
        return typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-edelivery-lightest-blue flex items-center justify-center mb-4">
              <CircleCheck className="text-edelivery-blue" size={28} />
            </div>
            <h2 className="text-xl font-semibold text-edelivery-dark-blue mb-2">E-delivery AI Assistant</h2>
            <p className="text-gray-600 max-w-md">
              Welcome! Ask me anything about your e-delivery data, project information, or request reports and visualizations.
            </p>
          </div>
        ) : (
          chatHistory.map((message) => (
            <ChatMessage
              key={message.id}
              type={message.type}
              content={message.content}
              timestamp={message.timestamp}
              // showSpinner={message.showSpinner}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-edelivery-gray p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Select Role:</label>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as 'Admin' | 'Consultant')}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none"
          >
            <option value="Admin">Admin</option>
            <option value="Consultant">Consultant</option>
          </select>
        </div>
        <QueryInput onSubmit={handleQuerySubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
