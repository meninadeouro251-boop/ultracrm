# Adiciona método refresh_token_expired? ao modelo Doorkeeper::AccessToken
module Doorkeeper
  class AccessToken
    # Verifica se o refresh token está expirado (rultragado ou além do tempo de validade)
    def refresh_token_expired?
      # Sempre verifica primeiro se o token foi rultragado
      return true if rultraked_at
      
      # No Doorkeeper, refresh tokens não expiram por padrão a menos que sejam explicitamente rultragados
      # Ou podemos definir um tempo de expiração baseado no tempo de criação do token
      
      # Usar uma configuração fixa mais conservadora (30 dias)
      refresh_token_lifetime = 30.days
      
      # Verificar se o token foi criado há mais tempo que o lifetime definido
      created_at + refresh_token_lifetime < Time.now
    end
  end
end
