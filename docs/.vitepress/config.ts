import { defineConfig } from 'vitepress';

const PAGE_URL = 'https://irpc.anchorlib.dev';
const BASE_URL = '';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Isomorphic Remote Procedure Call',
  titleTemplate: 'IRPC',
  description: 'Isomorphic Remote Procedure Call',
  head: [
    ['link', { rel: 'canonical', href: PAGE_URL }],
    ['link', { rel: 'icon', href: `${BASE_URL}/icons/favicon.ico` }],
    ['link', { rel: 'icon', href: `${BASE_URL}/icons/favicon-196x196.png`, sizes: '196x196' }],
    ['link', { rel: 'icon', href: `${BASE_URL}/icons/favicon-128x128.png`, sizes: '128x128' }],
    ['link', { rel: 'icon', href: `${BASE_URL}/icons/favicon-96x96.png`, sizes: '96x96' }],
    ['link', { rel: 'icon', href: `${BASE_URL}/icons/favicon-32x32.png`, sizes: '32x32' }],
    ['link', { rel: 'icon', href: `${BASE_URL}/icons/favicon-16x16.png`, sizes: '16x16' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Playfair:ital,opsz,wght@0,5..1200,300..900;1,5..1200,300..900&display=swap',
      },
    ],
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'IRPC',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Overview', link: '/overview' },
      { text: 'Get Started', link: '/typescript/getting-started' },
      { text: 'Specification', link: '/specification' },
    ],

    sidebar: [
      { text: 'Overview', link: '/overview' },
      { text: 'Specification', link: '/specification' },
      {
        text: 'Typescript',
        items: [
          { text: 'Overview', link: '/typescript/index.md' },
          { text: 'Installation', link: '/typescript/installation' },
          { text: 'Getting Started', link: '/typescript/getting-started' },
          { text: 'Usage', link: '/typescript/usage' },
        ],
      },
    ],

    footer: {
      message: 'Made with ❤️ by <a href="https://www.mahdaen.name" target="_blank">Nanang Mahdaen El Agung</a>',
      copyright: 'Copyright © 2025 IRPC. All rights reserved.',
    },
    editLink: {
      pattern: 'https://github.com/beerush-id/irpc/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/beerush-id/irpc' },
      { icon: 'discord', link: 'https://discord.gg/aEFgpaghq2' },
    ],
  },
});
