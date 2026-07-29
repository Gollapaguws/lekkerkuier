import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: './test/setup.js',
    // Run tests sequentially since SQLite is single-writer
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['*.js'],
      exclude: ['vitest.config.js', 'test/**', 'node_modules/**'],
      thresholds: {
        lines: 80,
        branches: 55,
        functions: 90,
        statements: 80,
      },
    },
  },
});
