class Webhooks::BaileysController < ActionController::API
  def webhook
    Rails.logger.info "Baileys webhook received: #{params.to_unsafe_hash}"

    payload = params.to_unsafe_hash
    
    if payload[:status]
      process_status_update(payload)
    else
      process_message(payload)
    end

    render json: { success: true }
  end

  private

  def process_message(payload)
    return if payload[:from].blank? || payload[:messageId].blank?

    message_data = {
      instance_id: payload[:instanceId],
      from: payload[:from],
      sender_name: payload[:senderName],
      message_id: payload[:messageId],
      message: payload[:message],
      message_type: payload[:type],
      timestamp: payload[:timestamp]
    }

    Rails.logger.info "Processing Baileys message: #{message_data}"
    
    # Here you would integrate with your existing message handling
    # For example, find or create a contact and conversation
    
    # Example integration with existing services:
    # contact = find_or_create_contact(payload[:from], payload[:senderName])
    # conversation = find_or_create_conversation(contact, payload[:instance_id])
    # create_message(conversation, payload[:message], payload[:messageId])
  end

  def process_status_update(payload)
    Rails.logger.info "Baileys status update: #{payload[:instanceId]} - #{payload[:status]}"
    
    # Update instance status in database
    # Channel::Whatsapp.where(...).update(...)
  end
end
