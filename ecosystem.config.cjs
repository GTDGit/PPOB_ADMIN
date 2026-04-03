module.exports = {
  apps: [
    {
      name: "ppob_admin",
      cwd: "/home/ubuntu/admin",
      script: ".next/standalone/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
