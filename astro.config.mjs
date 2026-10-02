import { defineConfig } from 'astro/config';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const isUserSite = repoName?.endsWith('.github.io');

export default defineConfig({
  site: process.env.SITE_URL || 'https://example.github.io',
  base: isGitHubPages && repoName && !isUserSite ? `/${repoName}/` : '/',
});
