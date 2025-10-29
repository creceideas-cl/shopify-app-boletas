module.exports = {
  apps: [
    {
      name: "boletapp",
      script: "./src/server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
    },
  ],
};
