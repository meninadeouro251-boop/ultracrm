import ultraaiApi from '@/services/core/apiUltraAI';
import { extractData } from '@/utils/apiHelpers';
import {
  MCPServer,
  MCPServerCreate,
  MCPServerUpdate,
  MCPServersListParams
} from '@/types/ai';

// Create MCP server
export const createMCPServer = async (server: MCPServerCreate) => {
  const response = await ultraaiApi.post('/mcp-servers', server);
  return extractData<any>(response);
};

// List MCP servers
export const listMCPServers = async (params?: MCPServersListParams): Promise<MCPServer[]> => {
  const queryParams: { skip: number; limit: number; page?: number; pageSize?: number } = {
    skip: params?.skip || 0,
    limit: params?.limit || 100
  };

  if (params?.page !== undefined) {
    queryParams.page = params.page;
  }
  if (params?.pageSize !== undefined) {
    queryParams.pageSize = params.pageSize;
  }

  const response = await ultraaiApi.get('/mcp-servers', {
    params: queryParams,
  });

  return extractData<MCPServer[]>(response);
};

// Get MCP server by ID
export const getMCPServer = async (serverId: string) => {
  const response = await ultraaiApi.get(`/mcp-servers/${serverId}`);
  return extractData<any>(response);
};

// Update MCP server
export const updateMCPServer = async (
  serverId: string,
  server: MCPServerUpdate,
) => {
  const response = await ultraaiApi.put(`/mcp-servers/${serverId}`, server);
  return extractData<any>(response);
};

// Delete MCP server
export const deleteMCPServer = async (serverId: string) => {
  const response = await ultraaiApi.delete(`/mcp-servers/${serverId}`);
  return extractData<any>(response);
};
