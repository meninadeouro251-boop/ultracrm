class Whatsapp::IncomingMessageultralutionGoService < Whatsapp::IncomingMessageBaseService
  include Whatsapp::ultralutionGoHandlers::MessagesUpsert
  include Whatsapp::ultralutionGoHandlers::MessagesUpdate
  include Whatsapp::ultralutionGoHandlers::ReceiptHandler
  include Whatsapp::ultralutionGoHandlers::Helpers

  def perform
    Rails.logger.info "ultralution Go API: Service initialized with inbox: #{@inbox.present? ? @inbox.id : 'NIL'}"

    # ultralution Go API structure: { event: 'Message', data: { Info: {...}, Message: {...} }, instanceId: '...', instanceToken: '...' }
    event_type = processed_params[:event]

    Rails.logger.info "ultralution Go API: Processing event #{event_type} for instance #{processed_params[:instanceId]}"
    Rails.logger.debug { "ultralution Go API: Full payload: #{processed_params.inspect}" }

    case event_type
    when 'Message'
      process_ultralution_go_message
    when 'Receipt'
      process_read_receipt
    when 'PairSuccess'
      process_pair_success
    when 'LoggedOut'
      process_logged_out
    else
      Rails.logger.warn "ultralution Go API: Unhandled event type: #{event_type}"
    end
  end

  private

  def process_ultralution_go_message
    # ultralution Go structure: { data: { Info: {...}, Message: {...} } }
    data = processed_params[:data]
    return if data.blank?

    info = data[:Info]
    message = data[:Message]

    return if info.blank? || message.blank?

    Rails.logger.info "ultralution Go API: Processing message #{info[:ID]} (fromMe: #{info[:IsFromMe]}, type: #{info[:Type]})"

    # Set the ultralution Go message structure for handlers
    @ultralution_go_data = data
    @ultralution_go_info = info
    @ultralution_go_message = message

    handle_message
  end

  def incoming?
    # ultralution Go: Check IsFromMe field from Info
    from_me = @ultralution_go_info&.dig(:IsFromMe)

    if from_me.nil?
      Rails.logger.warn 'ultralution Go API: Unable to determine message direction from IsFromMe field, assuming incoming'
      true
    else
      !from_me  # If IsFromMe is false, it's incoming
    end
  end

  def conversation_id
    # ultralution Go: Chat field from Info contains the conversation ID
    @ultralution_go_info&.dig(:Chat)
  end

  def sender_id
    if incoming?
      if group_message?
        # For group messages, get the actual sender
        @ultralution_go_info&.dig(:Sender)
      else
        # For individual chats, use Chat field
        conversation_id
      end
    else
      # For outgoing messages, use the instance's phone number
      whatsapp_channel.phone_number
    end
  end

  def group_message?
    @ultralution_go_info&.dig(:IsGroup) == true
  end

  def raw_message_id
    @ultralution_go_info&.dig(:ID)
  end

  def phone_number_from_jid
    jid = sender_id
    return nil unless jid

    # Extract phone number from JID (e.g., "557499879409@s.whatsapp.net" -> "557499879409")
    jid.split('@').first.gsub(/:\d+$/, '')
  end

  def contact_name
    @ultralution_go_info&.dig(:PushName).presence || phone_number_from_jid
  end

  def whatsapp_channel
    @whatsapp_channel ||= @inbox.channel
  end

  def process_pair_success
    instance_id = processed_params[:instanceId]
    data = processed_params[:data]
    status = data[:status]
    jid = data[:jid] || data[:ID]

    Rails.logger.info "ultralution Go API: PairSuccess event - instanceId: #{instance_id}, status: #{status}, jid: #{jid}"
    Rails.logger.info "ultralution Go API: Full PairSuccess data: #{data.inspect}"

    # Clear any reauthorization flags from previous disconnections
    channel = inbox.channel
    Rails.logger.info "ultralution Go API: Channel ID: #{channel.id}, Inbox ID: #{inbox.id}"

    if channel.reauthorization_required?
      Rails.logger.info "ultralution Go API: Clearing reauthorization flag for channel #{channel.id}"
      channel.reauthorized!
    end

    # Update provider_connection status to open
    Rails.logger.info "ultralution Go API: Updating provider_connection to open"
    channel.update_provider_connection!({ 'connection' => 'open', 'error' => nil })

    # Extract phone number from JID (e.g., "553199365519:13@s.whatsapp.net" -> "553199365519")
    phone_number = jid.to_s.split('@').first.gsub(/:\d+$/, '')
    Rails.logger.info "ultralution Go API: Extracted phone number: #{phone_number} from jid: #{jid}"

    unless phone_number.present?
      Rails.logger.warn "ultralution Go API: Could not extract phone number from jid: #{jid}"
      return
    end

    Rails.logger.info "ultralution Go API: Fetching avatar for phone #{phone_number}"

    # Fetch and update inbox avatar
    begin
      fetch_and_update_inbox_avatar(phone_number)
    rescue StandardError => e
      Rails.logger.error "ultralution Go API: Failed to update inbox avatar from PairSuccess: #{e.message}"
      Rails.logger.error "ultralution Go API: Backtrace: #{e.backtrace.first(5).join("\n")}"
      # Don't raise error - avatar update is not critical
    end
  rescue StandardError => e
    Rails.logger.error "ultralution Go API: Failed to process PairSuccess: #{e.message}"
    Rails.logger.error "ultralution Go API: Backtrace: #{e.backtrace.first(5).join("\n")}"
  end

  def process_logged_out
    instance_id = processed_params[:instanceId]
    data = processed_params[:data]
    reason = data[:reason] || data[:Reason]

    Rails.logger.info "ultralution Go API: LoggedOut event - instanceId: #{instance_id}, reason: #{reason}"

    # Update provider_connection status to close
    channel = inbox.channel
    channel.update_provider_connection!({
      'connection' => 'close',
      'error' => reason || 'Logged out'
    })

    # Mark channel for reauthorization
    channel.authorization_error!

    Rails.logger.info "ultralution Go API: Channel #{channel.id} marked as disconnected and requiring reauthorization"
  rescue StandardError => e
    Rails.logger.error "ultralution Go API: Failed to process LoggedOut: #{e.message}"
  end

  def fetch_and_update_inbox_avatar(phone_number)
    return unless inbox && phone_number.present?

    channel = inbox.channel
    provider_config = channel.provider_config
    api_url = provider_config['api_url']
    instance_token = provider_config['instance_token']

    return unless api_url.present? && instance_token.present?

    Rails.logger.info "ultralution Go API: Fetching avatar from API for phone #{phone_number}"

    # Call ultralution Go /user/avatar endpoint
    avatar_url_endpoint = "#{api_url.chomp('/')}/user/avatar"

    uri = URI.parse(avatar_url_endpoint)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = (uri.scheme == 'https')
    http.open_timeout = 15
    http.read_timeout = 15

    request = Net::HTTP::Post.new(uri)
    request['apikey'] = instance_token
    request['Content-Type'] = 'application/json'
    request.body = {
      number: phone_number,
      preview: false
    }.to_json

    Rails.logger.info "ultralution Go API: Avatar request to #{avatar_url_endpoint} for number #{phone_number}"

    response = http.request(request)
    Rails.logger.info "ultralution Go API: Avatar response code: #{response.code}"
    Rails.logger.info "ultralution Go API: Avatar response body: #{response.body[0..200]}" # Log first 200 chars

    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.warn "ultralution Go API: Failed to fetch avatar. Status: #{response.code}"
      return
    end

    response_data = JSON.parse(response.body)

    # ultralution Go returns: { "data": { "url": "https://..." }, "message": "success" }
    avatar_url = response_data.dig('data', 'url') || response_data['url']

    if avatar_url.present?
      Rails.logger.info "ultralution Go API: Avatar URL found: #{avatar_url[0..50]}..."

      # Download and attach avatar
      downloaded_image = URI.open(avatar_url)
      filename = "profile_#{inbox.id}_#{Time.now.to_i}.jpg"

      inbox.avatar.attach(
        io: downloaded_image,
        filename: filename,
        content_type: 'image/jpeg'
      )

      Rails.logger.info "ultralution Go API: Successfully updated inbox #{inbox.id} avatar via PairSuccess event"
    else
      Rails.logger.info "ultralution Go API: No avatar URL found in response"
    end
  rescue JSON::ParserError => e
    Rails.logger.error "ultralution Go API: Avatar response JSON parse error: #{e.message}"
  rescue StandardError => e
    Rails.logger.error "ultralution Go API: Failed to fetch and update avatar: #{e.class} - #{e.message}"
    raise
  end
end
