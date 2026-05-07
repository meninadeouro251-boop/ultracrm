require 'base64'

class Whatsapp::Providers::UltraService < Whatsapp::Providers::BaseService
  def send_message(phone_number, message)
    @message = message
    @phone_number = phone_number

    if message.attachments.present?
      send_attachment_message(phone_number, message)
    elsif message.content.present?
      send_text_message(phone_number, message)
    else
      @message.update!(is_unsupported: true)
      return
    end
  end

  def send_template(phone_number, template_info)
    # Ultra API doesn't support template messages in the same way
    # For now, we'll send a regular text message
    Rails.logger.warn "Ultra API doesn't support template messages, sending as text"
    send_text_message(phone_number, build_template_text(template_info))
  end

  def sync_templates
    # Ultra API doesn't have template syncing like WhatsApp Cloud
    # Templates are managed internally via create_template
    Rails.logger.debug "ultralution: Templates are managed internally, no external sync needed"
  end

  def create_template(template_data)
    # ultralution doesn't have external template API
    # Store template internally in message_templates JSONB field
    Rails.logger.info "ultralution: Creating template internally - #{template_data['name']}"
    
    current_templates = whatsapp_channel.message_templates || []
    # Ensure current_templates is always an array (fix for existing data)
    current_templates = [] unless current_templates.is_a?(Array)
    
    # Create internal template structure
    internal_template = {
      'id' => SecureRandom.uuid,
      'name' => template_data['name'],
      'category' => template_data['category'],
      'language' => template_data['language'],
      'status' => 'APPROVED', # ultralution templates are always approved
      'components' => template_data['components'],
      'created_at' => Time.current.iso8601,
      'updated_at' => Time.current.iso8601
    }
    
    # Add to existing templates
    current_templates << internal_template
    
    # Templates are now stored in message_templates table, not in JSONB column
    # No need to update channel columns
    
    Rails.logger.info "ultralution: Template created internally with ID #{internal_template['id']}"
    internal_template
  end

  def update_template(template_id, template_data)
    Rails.logger.info "ultralution: Updating template internally - #{template_id}"
    
    current_templates = whatsapp_channel.message_templates || []
    # Ensure current_templates is always an array
    current_templates = [] unless current_templates.is_a?(Array)
    template_index = current_templates.find_index { |t| t['id'] == template_id }
    
    return nil unless template_index
    
    # Update existing template
    current_templates[template_index].merge!(
      'name' => template_data['name'],
      'category' => template_data['category'],
      'language' => template_data['language'],
      'components' => template_data['components'],
      'updated_at' => Time.current.iso8601
    )
    
    # Templates are now stored in message_templates table, not in JSONB column
    # No need to update channel columns
    
    Rails.logger.info "ultralution: Template updated internally"
    current_templates[template_index]
  end

  def delete_template(template_name)
    Rails.logger.info "ultralution: Deleting template internally - #{template_name}"
    
    current_templates = whatsapp_channel.message_templates || []
    # Ensure current_templates is always an array
    current_templates = [] unless current_templates.is_a?(Array)
    template_index = current_templates.find_index { |t| t['name'] == template_name }
    
    return false unless template_index
    
    # Remove template from array
    deleted_template = current_templates.delete_at(template_index)
    
    # Templates are now stored in message_templates table, not in JSONB column
    # No need to update channel columns
    
    Rails.logger.info "ultralution: Template deleted internally"
    true
  end

  def validate_provider_config?
    api_url = whatsapp_channel.provider_config['api_url'].presence || GlobalConfigService.load('ultraLUTION_API_URL', '').to_s.strip
    admin_token = whatsapp_channel.provider_config['admin_token'].presence || GlobalConfigService.load('ultraLUTION_ADMIN_SECRET', '').to_s.strip
    
    # Try multiple keys for instance name
    instance_name = whatsapp_channel.provider_config['instance_name'].presence || 
                    whatsapp_channel.provider_config['instanceName'].presence ||
                    whatsapp_channel.provider_config['name'].presence

    return false if api_url.blank? || admin_token.blank? || instance_name.blank?

    # Test connection to Ultra API root endpoint
    response = HTTParty.get(
      api_url.chomp('/') + '/',
      headers: {
        'apikey' => admin_token,
        'Content-Type' => 'application/json'
      },
      timeout: 10
    )

    response.success? && (response.parsed_response['status'] == 200 || response.code == 200)
  rescue StandardError => e
    Rails.logger.error "Ultra API validation error: #{e.message}"
    false
  end

  def api_headers
    admin_token = whatsapp_channel.provider_config['admin_token'].presence || GlobalConfigService.load('ultraLUTION_ADMIN_SECRET', '').to_s.strip
    {
      'apikey' => admin_token,
      'Content-Type' => 'application/json'
    }
  end

  def media_url(media_id)
    # Ultra API media endpoint
    "#{api_base_path}/media/#{media_id}"
  end

  def subscribe_to_webhooks
    # Ultra API webhook subscription if needed
    Rails.logger.info 'Ultra API webhook subscription not implemented'
  end

  def unsubscribe_from_webhooks
    # Ultra API webhook unsubscription if needed
    Rails.logger.info 'Ultra API webhook unsubscription not implemented'
  end

  def disconnect_channel_provider
    return if whatsapp_channel.provider_config['instance_name'].blank?

    instance_name = whatsapp_channel.provider_config['instance_name']

    # First try logout
    logout_success = try_logout_instance(instance_name)

    # If logout fails, try to delete the instance
    return if logout_success

    Rails.logger.info "Ultra API: Logout failed, attempting to delete instance #{instance_name}"
    try_delete_instance(instance_name)
  end

  private

  def try_logout_instance(instance_name)
    logout_url = "#{api_base_path}/instance/logout/#{instance_name}"
    Rails.logger.info "Ultra API: Attempting logout for instance #{instance_name} at #{logout_url}"

    response = HTTParty.delete(
      logout_url,
      headers: api_headers,
      timeout: 30
    )

    Rails.logger.info "Ultra API logout response: #{response.code} - #{response.body}"

    if response.success?
      Rails.logger.info "Ultra API: Successfully logged out instance #{instance_name}"
      true
    else
      Rails.logger.warn "Ultra API: Logout failed for instance #{instance_name} - #{response.code}: #{response.body}"
      false
    end
  rescue StandardError => e
    Rails.logger.error "Ultra API: Logout error for instance #{instance_name} - #{e.message}"
    false
  end

  def try_delete_instance(instance_name)
    delete_url = "#{api_base_path}/instance/delete/#{instance_name}"
    Rails.logger.info "Ultra API: Attempting delete for instance #{instance_name} at #{delete_url}"

    response = HTTParty.delete(
      delete_url,
      headers: api_headers,
      timeout: 30
    )

    Rails.logger.info "Ultra API delete response: #{response.code} - #{response.body}"

    if response.success?
      Rails.logger.info "Ultra API: Successfully deleted instance #{instance_name}"
      true
    else
      Rails.logger.warn "Ultra API: Delete failed for instance #{instance_name} - #{response.code}: #{response.body}"
      false
    end
  rescue StandardError => e
    Rails.logger.error "Ultra API: Delete error for instance #{instance_name} - #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    false
  end

  def api_base_path
    api_url = whatsapp_channel.provider_config['api_url'].presence || GlobalConfigService.load('ultraLUTION_API_URL', '').to_s.strip
    api_url&.chomp('/')
  end

  def instance_name
    whatsapp_channel.provider_config['instance_name']
  end

  def send_text_message(phone_number, message)
    raw_content = message.respond_to?(:content) ? message.content : message.to_s

    response = HTTParty.post(
      "#{api_base_path}/message/sendText/#{instance_name}",
      headers: api_headers,
      body: {
        number: phone_number.delete('+'),
        text: html_to_whatsapp(raw_content)
      }.to_json
    )

    process_response(response)
  end

  def send_attachment_message(phone_number, message)
    attachment = message.attachments.first
    return unless attachment

    case attachment.file_type
    when 'image'
      send_media_message(phone_number, message, 'sendMedia')
    when 'audio'
      send_audio_message(phone_number, message)
    when 'video'
      send_media_message(phone_number, message, 'sendMedia')
    when 'file'
      send_media_message(phone_number, message, 'sendMedia')
    else
      # Fallback to text message
      send_text_message(phone_number, message)
    end
  end

  def send_media_message(phone_number, message, endpoint)
    attachment = message.attachments.first

    # Use direct S3 URL for media
    media_url = generate_direct_s3_url(attachment)

    Rails.logger.info "[ultralution Media] Sending #{attachment.file_type} with direct URL: #{media_url}"

    response = HTTParty.post(
      "#{api_base_path}/message/#{endpoint}/#{instance_name}",
      headers: api_headers,
      body: {
        number: phone_number.delete('+'),
        mediatype: attachment.file_type,
        media: media_url,
        caption: html_to_whatsapp(message.content.to_s),
        fileName: attachment.file.filename.to_s
      }.to_json
    )

    process_response(response)
  end

  def send_audio_message(phone_number, message)
    attachment = message.attachments.first

    # Try direct public URL first (for public S3 buckets)
    result = send_audio_with_direct_url(phone_number, attachment)

    # If direct URL fails, try base64
    if !result && attachment.file.attached?
      Rails.logger.info '[ultralution Audio] Direct URL failed, trying base64'
      result = send_audio_with_base64(phone_number, attachment)
    end

    result
  end

  def send_audio_with_direct_url(phone_number, attachment)
    # Generate direct public URL for S3 bucket
    audio_url = generate_direct_s3_url(attachment)

    # Debug log
    Rails.logger.info "[ultralution Audio] Trying direct URL: #{audio_url}"

    body_data = {
      number: phone_number.delete('+'),
      audio: audio_url
    }

    Rails.logger.info "[ultralution Audio] Request body: #{body_data.to_json}"

    response = HTTParty.post(
      "#{api_base_path}/message/sendWhatsAppAudio/#{instance_name}",
      headers: api_headers,
      body: body_data.to_json,
      timeout: 60
    )

    Rails.logger.info "[ultralution Audio] Response status: #{response.code}"
    Rails.logger.info "[ultralution Audio] Response body: #{response.body}"

    process_response(response)
  end

  def generate_direct_s3_url(attachment)
    return attachment.file_url unless attachment.file.attached?

    # Extract S3 details from existing signed URL
    signed_url = attachment.download_url

    Rails.logger.info "[ultralution S3] Original signed URL: #{signed_url}"

    # Try to extract bucket and key from the signed URL (flexible regex for different S3 providers)
    if signed_url =~ %r{https://([^/]+)/([^?]+)}
      host = Regexp.last_match(1)
      key = Regexp.last_match(2)

      # Create direct public URL - just remove query parameters
      direct_url = "https://#{host}/#{key}"
      Rails.logger.info "[ultralution S3] Generated direct URL: #{direct_url}"
      return direct_url
    end

    # Fallback to original URL if can't parse
    Rails.logger.warn "[ultralution S3] Could not parse S3 URL, using original: #{signed_url}"
    signed_url
  end

  def send_audio_with_base64(phone_number, attachment)
    # Convert to base64 - Ultra API expects just the base64 string
    buffer = Base64.strict_encode64(attachment.file.download)

    Rails.logger.info "[ultralution Audio] Trying base64 (size: #{buffer.length})"

    body_data = {
      number: phone_number.delete('+'),
      audio: buffer  # Just the base64 string, no data URI prefix
    }

    response = HTTParty.post(
      "#{api_base_path}/message/sendWhatsAppAudio/#{instance_name}",
      headers: api_headers,
      body: body_data.to_json,
      timeout: 60
    )

    Rails.logger.info "[ultralution Audio] Base64 Response status: #{response.code}"
    Rails.logger.info "[ultralution Audio] Base64 Response body: #{response.body}"

    process_response(response)
  end

  def build_template_text(template_info)
    # Convert template info to plain text for Ultra API
    text = template_info[:name] || 'Template Message'
    if template_info[:parameters].present?
      template_info[:parameters].each_with_index do |param, index|
        text = text.gsub("{{#{index + 1}}}", param)
      end
    end
    text
  end

  def process_response(response)
    if response.success?
      parsed_response = response.parsed_response
      return parsed_response.dig('key', 'id') || parsed_response['messageId'] || true
    end

    Rails.logger.error "Ultra API error: #{response.code} - #{response.body}"
    false
  end
end
