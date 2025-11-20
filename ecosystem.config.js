module.exports = {
  apps: [
    {
      name: "YoungChang-PMS",
      script: "node",
      args: "./node_modules/next/dist/bin/next start",
      cwd: "./",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 30001,
      },
    },
  ],
};
