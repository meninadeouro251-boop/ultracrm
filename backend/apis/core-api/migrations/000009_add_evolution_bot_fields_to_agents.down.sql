DROP INDEX IF EXISTS idx_agents_ultralution_bot_sync;
DROP INDEX IF EXISTS idx_agents_ultralution_bot_id;

ALTER TABLE ultra_core_agents DROP IF EXISTS COLUMN ultralution_bot_sync;
ALTER TABLE ultra_core_agents DROP IF EXISTS COLUMN ultralution_bot_id;