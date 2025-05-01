// // Define response types
// export type QueryClass = 'database' | 'graph' | 'report' | 'general' | 'error';

// export interface AIApiResponse {
//   status_code: number;
//   query_class: QueryClass;
//   data: any;
//   explaination?: string;
// }

// /**
//  * Sends a query to the AI Query Engine API (Real Backend)
//  * @param userQuery The natural language query from the user
//  * @param userEmail The email of the user making the request
//  * @returns Promise with the API response
//  */
// export const sendQueryToAI = async (
//   userQuery: string, 
//   userEmail: string = "user_89@example.com"
// ): Promise<AIApiResponse> => {
//   try {
//     const response = await fetch('http://localhost:8000/query-engine', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         user_email: userEmail,
//         query: userQuery,
//       }),
//     });

//     const responseData = await response.json();

//     if (!response.ok) {
//       return {
//         status_code: response.status,
//         query_class: 'error',
//         data: responseData?.data || `Error: ${response.status} ${response.statusText}`,
//       };
//     }

//     let parsedData: any = responseData.data;

//     // Special parsing for 'graph' and 'report'
//     if (responseData.query_class === 'graph' || responseData.query_class === 'report') {
//       try {
//         if (typeof responseData.data === 'string') {
//           parsedData = JSON.parse(responseData.data);
//         }
//       } catch (parseError) {
//         console.warn('Failed to parse graph/report JSON:', parseError);
//       }
//     }

//     return {
//       status_code: response.status,
//       query_class: responseData.query_class || 'general', // fallback to 'general' if missing
//       data: parsedData,
//       explaination: responseData.explaination,
//     };
//   } catch (error) {
//     console.error('API request failed:', error);
//     return {
//       status_code: 500,
//       query_class: 'error',
//       data: `Failed to connect to the server: ${error instanceof Error ? error.message : String(error)}`,
//     };
//   }
// };

// Define response types
export type QueryClass = 'database' | 'graph' | 'report' | 'general' | 'error';

export interface AIApiResponse {
  status_code: number;
  query_class: QueryClass;
  data: any;
  explaination?: string;
}

/**
 * Sends a query to the AI Query Engine API (Real Backend)
 * Simulates streaming of long string response via onStreamToken()
 * @param userQuery The natural language query from the user
 * @param userEmail The email of the user making the request
 * @param onStreamToken Optional callback for token-wise simulated streaming
 * @returns Promise with the API response
 */
export const sendQueryToAI = async (
  userQuery: string,
  userEmail: string = "user_89@example.com",
  onStreamToken?: (token: string) => void
): Promise<AIApiResponse> => {
  try {
    const response = await fetch('http://localhost:8000/query-engine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_email: userEmail,
        query: userQuery,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        status_code: response.status,
        query_class: 'error',
        data: responseData?.data || `Error: ${response.status} ${response.statusText}`,
      };
    }

    let parsedData: any = responseData.data;

    // Special parsing for 'graph' and 'report'
    if (responseData.query_class === 'graph' || responseData.query_class === 'report') {
      try {
        if (typeof responseData.data === 'string') {
          parsedData = JSON.parse(responseData.data);
        }
      } catch (parseError) {
        console.warn('Failed to parse graph/report JSON:', parseError);
      }
    }

    // Simulate streaming token-by-token (word-by-word) if it's a long string
    if (typeof parsedData === 'string' && onStreamToken) {
      const tokens = parsedData.split(" ");
      for (const token of tokens) {
        onStreamToken(token + " ");
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay
      }
    }

    return {
      status_code: response.status,
      query_class: responseData.query_class || 'general',
      data: parsedData,
      explaination: responseData.explaination,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      status_code: 500,
      query_class: 'error',
      data: `Failed to connect to the server: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
