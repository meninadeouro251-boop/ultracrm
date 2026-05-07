ALTER TABLE ultra_core_agents ADD COLUMN IF NOT EXISTS ultralution_bot_id UUID;
ALTER TABLE ultra_core_agents ADD COLUMN IF NOT EXISTS ultralution_bot_sync BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_agents_ultralution_bot_id ON ultra_core_agents(ultralution_bot_id);
CREATE INDEX IF NOT EXISTS idx_agents_ultralution_bot_sync ON ultra_core_agents(ultralution_bot_sync);