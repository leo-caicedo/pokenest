export const EnvConfiguration = () => ({
  enviroment: process.env.NODE_ENV || 'dev',
  mongodb: process.env.MONGODB,
  port: process.env.PORT || '0',
  defaultLimit: +process.env.DEFAULT_LIMIT || 10
})