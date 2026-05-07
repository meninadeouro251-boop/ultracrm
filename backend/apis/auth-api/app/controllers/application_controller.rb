class ApplicationController < ActionController::Base
  skip_before_action :verify_authenticity_token

  private

  def current_user
    @current_user
  end

  def authenticate_user!
    # Override in subclasses
    head :unauthorized unless current_user
    check_account_expiration! if current_user
  end

  def check_account_expiration!
    if current_user&.expired?
      render json: { 
        error: 'account_expired', 
        message: 'Your account has expired. Please contact support to renew your subscription.',
        days_until_expiration: 0
      }, status: :payment_required
    end
  end

  def verify_authenticity_token
    # Skip for API-only app
  end
end
