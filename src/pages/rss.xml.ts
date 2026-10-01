import rss, { type RSSFeedItem } from '@astrojs/rss';
import type { APIContext } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getCollection, render } from 'astro:content';
import { transform, walk } from 'ultrahtml';
import sanitize from 'ultrahtml/transformers/sanitize';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context: APIContext) {
  // Determine site URL including base path (e.g. for GitHub Pages with a repository subpath)
  const siteUrl = context.site
    ? new URL(import.meta.env.BASE_URL, context.site)
    : new URL('https://pdbartlett.github.io');

  let baseUrl = siteUrl.href;
  if (baseUrl.at(-1) === '/') baseUrl = baseUrl.slice(0, -1);

  // Create a new Astro container that we can render components with.
  // See https://docs.astro.build/en/reference/container-reference/
  // Note: renderers (e.g. MDX or UI frameworks) can be passed here via loadRenderers if needed.
  const container = await AstroContainer.create();

  // Load the content collection entries to add to our RSS feed, sorted descending by date.
  const posts = (await getCollection('posts')).sort((a, b) =>
    b.data.date.getTime() - a.data.date.getTime()
  );

  // Loop over posts to create feed items for each, including full content.
  const feedItems: RSSFeedItem[] = [];
  for (const post of posts) {
    const isEvent = post.data.tags.map((t: string) => t.toLowerCase()).includes('events');

    // Get the <Content/> component for the current post.
    const { Content } = await render(post);

    // Use the Astro container to render the content to a string.
    const rawContent = await container.renderToString(Content);

    // Process and sanitize the raw content:
    // - Removes `<!DOCTYPE html>` preamble
    // - Makes link `href` and image `src` attributes absolute instead of relative
    // - Strips any `<script>` and `<style>` tags
    // Thanks @Princesseuh — https://github.com/Princesseuh/erika.florist/blob/1827288c14681490fa301400bfd815acb53463e9/src/middleware.ts
    let content = await transform(rawContent.replace(/^<!DOCTYPE html>/, ''), [
      async (node) => {
        await walk(node, (node) => {
          if (node.name === 'a' && node.attributes.href) {
            const href = node.attributes.href;
            if (href.startsWith('/')) {
              const path = siteUrl.pathname !== '/' && href.startsWith(siteUrl.pathname)
                ? href
                : `${siteUrl.pathname.replace(/\/$/, '')}${href}`;
              node.attributes.href = `${siteUrl.origin}${path}`;
            }
          }
          if (node.name === 'img' && node.attributes.src) {
            const src = node.attributes.src;
            if (src.startsWith('/')) {
              const path = siteUrl.pathname !== '/' && src.startsWith(siteUrl.pathname)
                ? src
                : `${siteUrl.pathname.replace(/\/$/, '')}${src}`;
              node.attributes.src = `${siteUrl.origin}${path}`;
            }
          }
        });
        return node;
      },
      sanitize({ dropElements: ['script', 'style'] }),
    ]);

    // Prepend location if defined and not already in content
    const locationPrefix = post.data.location ? `<p><strong>Location:</strong> ${post.data.location}</p>` : '';

    if (content.trim()) {
      content = locationPrefix + content;
    } else if (post.data.description) {
      content = `${locationPrefix}<p>${post.data.description}</p>`;
    } else {
      content = `${locationPrefix}<p>Further details for this ${isEvent ? 'event' : 'post'} will be announced soon.</p>`;
    }

    feedItems.push({
      title: post.data.title,
      description: post.data.description || `${post.data.title} - ${SITE_TITLE}`,
      pubDate: post.data.date,
      categories: post.data.tags,
      link: `${baseUrl}/posts/${post.id}/`,
      content,
    });
  }

  // Return our RSS feed XML response.
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: baseUrl,
    items: feedItems,
    customData: '<language>en-gb</language>',
  });
}
