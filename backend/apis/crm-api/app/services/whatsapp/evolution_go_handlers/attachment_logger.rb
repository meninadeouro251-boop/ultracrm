module Whatsapp::ultralutionGoHandlers::AttachmentLogger
  private

  def log_attachment_details
    return unless @raw_message[:messageType]&.match?(/(image|video|audio|document|sticker)Message/)

    Rails.logger.info "ultralution Go: Processing #{@raw_message[:messageType]} attachment"
    Rails.logger.debug { "ultralution Go: Media URL: #{media_url}" }
  end
end
