import { AIApiResponse } from './api';

/**
 * Mock API endpoint for local development and testing only
 */
export const mockSendQueryToAI = async (userQuery: string, userEmail: string): Promise<AIApiResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const query = userQuery.toLowerCase();
  
  if (query.includes('error') || userEmail === 'wrong_email@example.com') {
    return {
      status_code: 400,
      query_class: 'error',
      data: 'Error: Invalid query or permissions denied'
    };
  } else if (query.includes('graph') || query.includes('chart') || query.includes('visualization') || query.includes('distribution')) {
    return {
      status_code: 200,
      query_class: 'graph',
      data: {
        data: [
          { name: 'Admin', value: 1783 },
          { name: 'Business Manager', value: 898 },
          { name: 'Consultant', value: 4213 },
          { name: 'Support', value: 6 },
          { name: 'Team Leader', value: 83 },
          { name: 'Validator', value: 1 }
        ]
      },
      explaination: 'This chart shows the distribution of users by their role in the system.'
    };
  } else if (query.includes('report') || query.includes('summary') || query.includes('analytics')) {
    return {
      status_code: 200,
      query_class: 'report',
      data: {
        role_name: { 
          "0": "admin", "1": "bm", "2": "bu", "3": "butl", "4": "consultant", "5": "support_bu", "6": "team_leader", "7": "team_leader_plus", "8": "validator" 
        },
        count: { 
          "0": 1783, "1": 898, "2": 1, "3": 174, "4": 4213, "5": 6, "6": 83, "7": 289, "8": 1 
        }
      },
      explaination: 'This report shows the distribution of users across different roles.'
    };
  } else if (query.includes('database') || query.includes('count') || query.includes('how many') || query.includes('active')) {
    return {
      status_code: 200,
      query_class: 'database',
      data: 'There are 7,448 user accounts currently active in the database.'
    };
  } else {
    return {
      status_code: 200,
      query_class: 'general',
      data: `I've processed your query about "${userQuery}".`
    };
  }
};

// Only used if explicitly imported — no effect on production!
