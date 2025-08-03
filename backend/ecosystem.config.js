module.exports = {
  apps: [
    {
      name: 'xeption-backend',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3000
      }
    },
    {
      name: 'xeption-backend-staging',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'staging',
        PORT: 3001
      }
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'xeptionetwork.shop',
      ref: 'origin/main',
      repo: 'git@github.com:xeption/backend.git',
      path: '/var/www/xeption-backend',
      'post-deploy': 'npm install && npm run db:migrate:prod && npm run build:prod && pm2 reload ecosystem.config.js --env production'
    },
    staging: {
      user: 'deploy',
      host: 'staging.xeptionetwork.shop',
      ref: 'origin/develop',
      repo: 'git@github.com:xeption/backend.git',
      path: '/var/www/xeption-backend-staging',
      'post-deploy': 'npm install && npm run db:migrate:deploy && npm run build && pm2 reload ecosystem.config.js --env staging'
    }
  }
};