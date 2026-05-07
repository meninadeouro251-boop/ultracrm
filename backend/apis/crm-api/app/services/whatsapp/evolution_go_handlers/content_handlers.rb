module Whatsapp::ultralutionGoHandlers::ContentHandlers
  private

  def extract_content
    # Content extraction is handled directly in MessagesUpsert
    Rails.logger.debug 'ultralution Go API: Content processing handled in MessagesUpsert'
  end

  def extract_from_baileys_structure
    # ultralution Go doesn't use Baileys structure in the same way
    Rails.logger.debug 'ultralution Go API: Baileys structure extraction not used'
  end
end
