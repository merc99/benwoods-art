import { compileMDX } from 'next-mdx-remote/rsc'
import type { MDXComponents } from 'mdx/types'

const components: MDXComponents = {
  h2: (props) => <h2 className="t-label mt-12 mb-4 border-t border-rule pt-4 text-fg-3 first:mt-0" {...props} />,
  h3: (props) => <h3 className="t-title mt-8 mb-3 text-xl" {...props} />,
  p: (props) => <p className="mb-5 text-fg" {...props} />,
  ul: (props) => <ul className="mb-5 list-disc space-y-2 pl-5 marker:text-fg-3" {...props} />,
  ol: (props) => <ol className="mb-5 list-decimal space-y-2 pl-5 marker:text-fg-3" {...props} />,
  a: ({ href = '', ...props }) => (
    <a
      href={href}
      {...(href.startsWith('http') && { target: '_blank', rel: 'noreferrer' })}
      className="underline decoration-rule-strong underline-offset-4 hover:decoration-fg"
      {...props}
    />
  ),
  strong: (props) => <strong className="font-semibold" {...props} />,
}

/** Renders a project's MDX body (frontmatter already stripped). */
export async function Prose({ source }: { source: string }) {
  const { content } = await compileMDX({ source, components })
  return <div className="text-[1.0625rem] leading-[1.65] lg:text-[1.125rem]">{content}</div>
}
