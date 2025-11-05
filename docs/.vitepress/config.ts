import { defineConfig } from "vitepress";

const PAGE_URL = "https://irpc.anchorlib.dev";
const BASE_URL = "";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Isomorphic Remote Procedure Call",
  titleTemplate: "IRPC",
  description: "Isomorphic Remote Procedure Call",
  sitemap: {
    hostname: PAGE_URL,
  },
  head: [
    ["link", { rel: "icon", href: `${BASE_URL}/icons/favicon.ico` }],
    [
      "link",
      {
        rel: "icon",
        href: `${BASE_URL}/icons/favicon-196x196.png`,
        sizes: "196x196",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        href: `${BASE_URL}/icons/favicon-128x128.png`,
        sizes: "128x128",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        href: `${BASE_URL}/icons/favicon-96x96.png`,
        sizes: "96x96",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        href: `${BASE_URL}/icons/favicon-32x32.png`,
        sizes: "32x32",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        href: `${BASE_URL}/icons/favicon-16x16.png`,
        sizes: "16x16",
      },
    ],
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Playfair:ital,opsz,wght@0,5..1200,300..900;1,5..1200,300..900&display=swap",
      },
    ],
    ["meta", { property: "og:site_name", content: "IRPC" }],
    [
      "meta",
      {
        property: "og:image:alt",
        content: "IRPC - Isomorphic Remote Procedure Call",
      },
    ],
    ["meta", { property: "og:image:type", content: "image/png" }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { name: "twitter:site", content: "@irpc" }],
    ["link", { rel: "canonical", href: PAGE_URL }],
  ],
  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "IRPC",

    nav: [
      { text: "Home", link: "/" },
      { text: "Overview", link: "/overview" },
      { text: "Quick Reference", link: "/quick-reference" },
      { text: "Get Started", link: "/typescript/getting-started" },
      { text: "Specification", link: "/specification" },
    ],

    sidebar: [
      { text: "Overview", link: "/overview" },
      { text: "Specification", link: "/specification" },
      // {
      //   text: "API Reference",
      //   items: [
      //     { text: "Overview", link: "/api/" },
      //     { text: "Core Functions", link: "/api/core/create-module" },
      //     { text: "Context Management", link: "/api/core/create-context" },
      //     { text: "HTTP Transport", link: "/api/http/http-transport" },
      //   ],
      // },
      // {
      //   text: "Guides",
      //   items: [
      //     { text: "Performance Optimization", link: "/guides/performance" },
      //     { text: "Troubleshooting", link: "/guides/troubleshooting" },
      //     { text: "Migration from REST", link: "/guides/migration/rest" },
      //     { text: "Comparison", link: "/guides/comparison" },
      //     { text: "FAQ", link: "/guides/faq" },
      //   ],
      // },
      {
        text: "Typescript",
        items: [
          { text: "Overview", link: "/typescript/index.md" },
          { text: "Installation", link: "/typescript/installation" },
          { text: "Getting Started", link: "/typescript/getting-started" },
          { text: "Usage", link: "/typescript/usage" },
        ],
      },
    ],

    footer: {
      message:
        'Made with ❤️ by <a href="https://www.mahdaen.name" target="_blank">Nanang Mahdaen El Agung</a>',
      copyright: "Copyright © 2025 IRPC. All rights reserved.",
    },
    editLink: {
      pattern: "https://github.com/beerush-id/irpc/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
    search: {
      provider: "local",
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/beerush-id/irpc" },
      { icon: "discord", link: "https://discord.gg/aEFgpaghq2" },
    ],
  },
});
