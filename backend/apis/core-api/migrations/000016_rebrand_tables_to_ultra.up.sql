-- Migration to rename all ultra_core tables to ultra_core

ALTER TABLE IF EXISTS ultra_core_custom_tools RENAME TO ultra_core_custom_tools;
ALTER TABLE IF EXISTS ultra_core_custom_mcp_servers RENAME TO ultra_core_custom_mcp_servers;
ALTER TABLE IF EXISTS ultra_core_mcp_servers RENAME TO ultra_core_mcp_servers;
ALTER TABLE IF EXISTS ultra_core_api_keys RENAME TO ultra_core_api_keys;
ALTER TABLE IF EXISTS ultra_core_folders RENAME TO ultra_core_folders;
ALTER TABLE IF EXISTS ultra_core_agents RENAME TO ultra_core_agents;
ALTER TABLE IF EXISTS ultra_core_folder_shares RENAME TO ultra_core_folder_shares;
ALTER TABLE IF EXISTS ultra_core_agent_integrations RENAME TO ultra_core_agent_integrations;

-- Rename indices if they follow the old pattern (optional but good for consistency)
ALTER INDEX IF EXISTS idx_ultra_core_agents_name RENAME TO idx_ultra_core_agents_name;
ALTER INDEX IF EXISTS idx_ultra_core_agents_name_unique RENAME TO idx_ultra_core_agents_name_unique;
ALTER INDEX IF EXISTS idx_ultra_core_api_keys_name RENAME TO idx_ultra_core_api_keys_name;
ALTER INDEX IF EXISTS idx_ultra_core_mcp_servers_name RENAME TO idx_ultra_core_mcp_servers_name;
