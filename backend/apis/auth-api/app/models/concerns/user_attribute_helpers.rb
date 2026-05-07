module UserAttributeHelpers
  extend ActiveSupport::Concern

  def available_name
    self[:display_name].presence || name
  end

  def availability_status
    availability
  end

  def auto_offline
    false
  end

  def inviter
    user_roles.joins(:role).first&.inviter
  end

  def administrator?
    has_role?('administrator')
  end

  def agent?
    has_role?('agent')
  end

  # Used internally for ultralution in ultralution
  def hmac_identifier
    hmac_key = GlobalConfigService.load('ultraLUTION_INBOX_HMAC_KEY')
    return OpenSSL::HMAC.hexdigest('sha256', hmac_key, email) if hmac_key.present?

    ''
  end
end
