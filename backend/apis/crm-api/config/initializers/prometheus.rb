# frozen_string_literal: true

require 'prometheus/client'
require 'prometheus/client/formats/text'

# Initialize Prometheus registry with default metrics
Prometheus::Client.registry

unless defined?(ULTRA_AI_CRM_CONCURRENT_USERS_GAUGE)
  ULTRA_AI_CRM_CONCURRENT_USERS_GAUGE = Prometheus::Client.registry.gauge(
    :ultra_ai_crm_concurrent_users,
    docstring: 'Concurrent CRM users in the current presence window'
  )
end
