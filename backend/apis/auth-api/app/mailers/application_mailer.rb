class ApplicationMailer < ActionMailer::Base
  layout "mailer"

  default from: ->(*) { GlobalConfigService.load('MAILER_SENDER_EMAIL', 'noreply@ultracrm.com') }

  def self.get_mailer_sender_email
    GlobalConfigService.load('MAILER_SENDER_EMAIL', 'noreply@ultracrm.com')
  end
end
