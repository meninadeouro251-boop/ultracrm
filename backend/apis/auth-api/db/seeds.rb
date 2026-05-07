# This file seeds RBAC roles and permissions required by the application.

puts "🌱 Seeding Ultra CRM Auth Service..."

# Seed RBAC system
puts "📋 Seeding RBAC system..."
require_relative 'seeds/rbac'
puts "✅ Seeded RBAC system with roles, actions and permissions"
puts "   - Roles: #{Role.count}"
puts "   - Role Permission Actions: #{RolePermissionsAction.count}"

puts "🏢 Seeding account config..."
unless RuntimeConfig.account
  RuntimeConfig.set('account', {
    id: SecureRandom.uuid,
    name: 'Ultra CRM',
    domain: 'localhost',
    support_email: 'support@ultracrm.com',
    locale: 'en',
    status: 'active',
    features: {},
    settings: {},
    custom_attributes: {}
  })
end
puts "✅ Account config: #{RuntimeConfig.account['name']} (ID: #{RuntimeConfig.account['id']})"

puts ""
# Auto-bootstrap if no users exist
if User.count == 0
  puts "🚀 Auto-bootstrapping default admin user..."
  begin
    SetupBootstrapService.call(
      first_name: 'Ultra',
      last_name: 'Admin',
      email: 'admin@ultracrm.com',
      password: 'Ultra@123456'
    )
    puts "✅ Default admin created: admin@ultracrm.com / Ultra@123456"
  rescue => e
    puts "❌ Auto-bootstrap failed: #{e.message}"
  end
else
  puts "✅ System already bootstrapped."
end
