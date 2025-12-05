module.exports = {
  apps: [
    {
      name: "Toads-PMS",
      script: "node",
      args: "./node_modules/next/dist/bin/next start",
      cwd: "./",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 30000,
      },
    },
  ],
};
