class ApplicationController < ActionController::Base
  include RequestExceptionHandler
  include SwitchLocale
  include Pundit::Authorization

  skip_before_action :verify_authenticity_token, raise: false

  around_action :switch_locale
  around_action :handle_with_exception, unless: :skip_exception_handling?
  before_action :check_account_expiration!
  
  def check_account_expiration!
    return unless Current.user
    
    if Current.user.expired?
      render json: { 
        error: 'account_expired', 
        message: 'Your account has expired. Please contact support to renew your subscription.',
        days_until_expiration: 0
      }, status: :payment_required
    end
  end

  private

  def skip_exception_handling?
    # Skip exception handling for specific controllers if needed
    # Originally was checking for devise_controller? but Devise is not installed
    false
  end

  def pundit_user
    {
      user: Current.user,
      service_authenticated: Current.service_authenticated
    }
  end
end
ApplicationController.include_mod_with('Concerns::ApplicationControllerConcern')
