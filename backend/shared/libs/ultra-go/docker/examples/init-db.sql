-- Script de inicialização dos bancos de dados ultralution GO

-- Criar database para autenticação
CREATE DATABASE ultrago_auth;

-- Criar database para dados de usuários
CREATE DATABASE ultrago_users;

-- Mensagem de confirmação
SELECT 'Databases ultrago_auth e ultrago_users criados com sucesso!' as message;
