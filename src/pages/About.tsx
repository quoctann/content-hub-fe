import { Layout } from '@/components/layout/Layout';

export default function About() {
  return (
    <Layout>
      <div className="container py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            About Content Hub
          </h1>
          
          <div className="mt-8 space-y-6 text-muted-foreground">
            <p>
              Content Hub is your personal content library designed to help you find, 
              organize, and quickly copy the content you need. Whether it's text snippets, 
              code examples, or images, everything is just a search away.
            </p>
            
            <h2 className="text-xl font-semibold text-foreground">Features</h2>
            <ul className="list-inside list-disc space-y-2">
              <li>Search content using keywords, tags, and type filters</li>
              <li>Copy any content to clipboard with a single click</li>
              <li>Download content for offline use</li>
              <li>Dark and light theme support</li>
              <li>Recent search history for quick access</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">How to Search</h2>
            <ul className="list-inside list-disc space-y-2">
              <li>Use <code className="rounded bg-muted px-1.5 py-0.5">#tag</code> to filter by tags</li>
              <li>Use <code className="rounded bg-muted px-1.5 py-0.5">@text</code> or <code className="rounded bg-muted px-1.5 py-0.5">@image</code> to filter by content type</li>
              <li>Combine filters: <code className="rounded bg-muted px-1.5 py-0.5">react #code @text</code></li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">Contact</h2>
            <p>
              Have questions or feedback? Reach out to us at{' '}
              <a href="mailto:contact@example.com" className="text-foreground underline hover:no-underline">
                contact@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
