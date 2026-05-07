class ultralutionGo::FetchContactAvatarJob < ApplicationJob
  queue_as :low

  def perform(contact_id, phone_number, api_url, instance_token)
    contact = Contact.find_by(id: contact_id)
    return unless contact
    return if contact.avatar.attached?

    Rails.logger.info "ultralution Go Job: Fetching avatar for contact #{contact.id} (#{phone_number})"

    profile_picture_url = fetch_profile_picture_from_ultralution_go(phone_number, api_url, instance_token)

    if profile_picture_url.present?
      Rails.logger.info "ultralution Go Job: Scheduling avatar download for contact #{contact.id}"
      Avatar::AvatarFromUrlJob.perform_later(contact, profile_picture_url)
    else
      Rails.logger.debug { "ultralution Go Job: No profile picture available for contact #{contact.id}" }
    end
  rescue StandardError => e
    Rails.logger.error "ultralution Go Job: Failed to fetch avatar for contact #{contact_id}: #{e.message}"
  end

  private

  def fetch_profile_picture_from_ultralution_go(phone_number, api_url, instance_token)
    Rails.logger.debug { "ultralution Go Job: Calling /user/avatar for number #{phone_number}" }

    avatar_url = "#{api_url}/user/avatar"

    request_body = {
      number: phone_number,
      preview: false
    }

    uri = URI.parse(avatar_url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = (uri.scheme == 'https')
    http.open_timeout = 10
    http.read_timeout = 10

    request = Net::HTTP::Post.new(uri)
    request['apikey'] = instance_token
    request['Content-Type'] = 'application/json'
    request.body = request_body.to_json

    Rails.logger.debug { "ultralution Go Job: Avatar request - URL: #{avatar_url}" }

    response = http.request(request)
    Rails.logger.debug { "ultralution Go Job: Avatar response - Code: #{response.code}" }

    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.warn "ultralution Go Job: Avatar request failed - Status: #{response.code}"
      return nil
    end

    response_data = JSON.parse(response.body)

    # Extract URL from ultralution Go response format
    profile_picture_url = response_data.dig('data', 'url')

    if profile_picture_url.present?
      Rails.logger.info 'ultralution Go Job: Profile picture URL retrieved'
      profile_picture_url
    else
      Rails.logger.debug { "ultralution Go Job: No profile picture available for contact #{contact.id}" }
      nil
    end
  rescue JSON::ParserError => e
    Rails.logger.error "ultralution Go Job: Avatar response JSON parse error: #{e.message}"
    nil
  rescue StandardError => e
    Rails.logger.error "ultralution Go Job: Avatar request error: #{e.class} - #{e.message}"
    nil
  end
end
