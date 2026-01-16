/**
 * 📝 BLOG POST CONTENT COMPONENT
 * 
 * Component dùng chung cho cả VI và EN blog post
 * - Nhận locale để hiển thị đúng ngôn ngữ
 * - Cùng giao diện, chỉ khác nội dung
 */

import LocalizedLink from '@/components/LocalizedLink/LocalizedLink';
import BlogImage from '@/components/Blog/BlogImage';
import {
  formatDate,
  calculateReadingTime,
} from '@/lib/blog';

// ============ I18N STRINGS ============
const i18n = {
  vi: {
    home: 'Trang chủ',
    blog: 'Blog',
    minRead: 'phút đọc',
    toc: '📑 Nội dung bài viết',
    faq: 'Câu hỏi thường gặp',
    related: '📚 Bài viết liên quan',
    backToBlog: 'Quay lại Blog',
    seeMore: 'Xem thêm:',
    ctaTitle: 'Học toán vui với Sorokid',
    ctaDesc: 'Con tự học qua game, phụ huynh đỡ mệt.',
    ctaButton: 'Dùng thử miễn phí',
    categoryPath: '/blog/danh-muc',
  },
  en: {
    home: 'Home',
    blog: 'Blog',
    minRead: 'min read',
    toc: '📑 Table of Contents',
    faq: 'Frequently Asked Questions',
    related: '📚 Related Articles',
    backToBlog: 'Back to Blog',
    seeMore: 'See more:',
    ctaTitle: 'Fun Math Learning with Sorokid',
    ctaDesc: 'Kids learn through games, parents relax.',
    ctaButton: 'Try Free',
    categoryPath: '/en/blog/category',
  },
};

// ============ CONTENT COMPONENTS ============
function Paragraph({ text }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="text-gray-700 text-lg leading-relaxed mb-5">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </p>
  );
}

function Heading({ level, text, id }) {
  const baseClasses = "font-bold text-gray-900 mt-8 mb-4 scroll-mt-20";
  
  if (level === 2) {
    return <h2 id={id} className={`${baseClasses} text-xl sm:text-2xl`}>{text}</h2>;
  }
  if (level === 3) {
    return <h3 id={id} className={`${baseClasses} text-lg sm:text-xl`}>{text}</h3>;
  }
  return <h4 id={id} className={`${baseClasses} text-base sm:text-lg`}>{text}</h4>;
}

function List({ items }) {
  return (
    <ul className="space-y-3 mb-6 ml-1">
      {items.map((item, index) => {
        const parts = (item || '').split(/(\*\*[^*]+\*\*)/g);
        return (
          <li key={index} className="flex gap-3 text-gray-700 text-lg leading-relaxed">
            <span className="text-blue-500 mt-1.5 flex-shrink-0">•</span>
            <span>
              {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Callout({ style, text }) {
  const styles = {
    empathy: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '💛', iconBg: 'bg-amber-100' },
    reassurance: { bg: 'bg-green-50', border: 'border-green-200', icon: '💚', iconBg: 'bg-green-100' },
  };
  const currentStyle = styles[style] || styles.empathy;

  return (
    <div className={`${currentStyle.bg} ${currentStyle.border} border rounded-xl p-5 my-6`}>
      <div className="flex gap-4">
        <div className={`${currentStyle.iconBg} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl`}>
          {currentStyle.icon}
        </div>
        <p className="text-gray-700 text-base leading-relaxed pt-1.5">{text}</p>
      </div>
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers?.map((header, i) => (
              <th key={i} className="bg-gray-100 text-left text-gray-900 font-semibold p-3 border border-gray-200 text-sm">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, j) => (
                <td key={j} className="p-3 border border-gray-200 text-gray-700 text-sm">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContentSection({ section, index }) {
  // Format mới: có title và content (string)
  if (section.title && section.content) {
    const headingId = `section-${index}-${section.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').slice(0, 50)}`;
    const paragraphs = section.content.split('\n\n').filter(p => p.trim());
    
    return (
      <div className="mb-8">
        <Heading level={2} text={section.title} id={headingId} />
        {paragraphs.map((para, pIndex) => {
          const lines = para.split('\n');
          const isListBlock = lines.every(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim() === '');
          
          if (isListBlock && lines.filter(l => l.trim()).length > 0) {
            const items = lines.filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, '').trim());
            return <List key={pIndex} items={items} />;
          }
          
          if (para.includes('\n-') || para.includes('\n*')) {
            const parts = para.split(/\n(?=[-*])/);
            return (
              <div key={pIndex}>
                {parts.map((part, partIndex) => {
                  if (part.trim().startsWith('-') || part.trim().startsWith('*')) {
                    const listLines = part.split('\n').filter(l => l.trim());
                    const items = listLines.map(line => line.replace(/^[-*]\s*/, '').trim());
                    return <List key={partIndex} items={items} />;
                  }
                  return part.trim() ? <Paragraph key={partIndex} text={part.trim()} /> : null;
                })}
              </div>
            );
          }
          
          return <Paragraph key={pIndex} text={para} />;
        })}
      </div>
    );
  }
  
  // Format cũ: có type
  switch (section.type) {
    case 'paragraph':
      return <Paragraph text={section.text} />;
    case 'heading':
      const headingId = section.text ? `section-${index}-${section.text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').slice(0, 50)}` : `section-${index}`;
      return <Heading level={section.level} text={section.text} id={headingId} />;
    case 'list':
      return <List items={section.items} />;
    case 'callout':
      return <Callout style={section.style} text={section.text} />;
    case 'table':
      return <Table headers={section.headers} rows={section.rows} />;
    default:
      return null;
  }
}

function TableOfContents({ sections, locale }) {
  if (!sections || sections.length === 0) return null;
  const t = i18n[locale] || i18n.vi;
  
  const headings = sections
    .map((s, index) => {
      if (s.title) return { text: s.title, index };
      if (s.type === 'heading' && s.level === 2) return { text: s.text, index };
      return null;
    })
    .filter(Boolean);
  
  if (headings.length < 2) return null;

  return (
    <nav className="bg-gray-50 rounded-xl p-5 mb-8">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">{t.toc}</h2>
      <ul className="space-y-2">
        {headings.map((heading, i) => {
          const headingId = `section-${heading.index}-${heading.text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').slice(0, 50)}`;
          return (
            <li key={i}>
              <a href={`#${headingId}`} className="text-gray-600 hover:text-violet-600 text-sm leading-relaxed transition-colors block py-0.5">
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function FAQSection({ faqs, locale }) {
  if (!faqs || faqs.length === 0) return null;
  const t = i18n[locale] || i18n.vi;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{t.faq}</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details key={index} className="group bg-gray-50 rounded-xl overflow-hidden">
            <summary className="flex items-center justify-between cursor-pointer p-5 text-gray-900 font-medium hover:bg-gray-100 transition-colors">
              <span className="pr-4">{faq.question}</span>
              <svg className="w-5 h-5 flex-shrink-0 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-5 text-gray-600 leading-relaxed">{faq.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

function CTASection({ cta, locale }) {
  if (!cta) return null;
  const ctaText = cta.text || cta.description || '';
  const ctaTitle = cta.title || null;

  return (
    <section className="mt-12 bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl p-6 sm:p-8 border border-violet-100">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">💡</div>
        <div className="flex-1">
          {ctaTitle && <h3 className="text-lg font-bold text-gray-900 mb-2">{ctaTitle}</h3>}
          {ctaText && <p className="text-gray-700 text-lg mb-5 leading-relaxed">{ctaText}</p>}
          <LocalizedLink 
            href={cta.buttonLink || '/register'}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
          >
            {cta.buttonText || (locale === 'en' ? 'Try Free' : 'Dùng thử miễn phí')}
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}

function RelatedPosts({ posts, categories, locale }) {
  if (!posts || posts.length === 0) return null;
  const t = i18n[locale] || i18n.vi;
  const blogPath = locale === 'en' ? '/en/blog' : '/blog';

  return (
    <section className="lg:border-0 lg:pt-0">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{t.related}</h2>
      <div className="space-y-3">
        {posts.map(post => {
          const category = categories.find(c => c.slug === post.category);
          return (
            <LocalizedLink 
              key={post.slug}
              href={`${blogPath}/${post.slug}`}
              className="block bg-white rounded-xl p-4 hover:bg-gray-50 transition-colors border border-gray-100 hover:border-violet-200 group"
            >
              {category && (
                <span 
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2"
                  style={{ backgroundColor: `${category.color}15`, color: category.color }}
                >
                  {category.name}
                </span>
              )}
              <h3 className="font-semibold text-gray-900 leading-snug text-sm group-hover:text-violet-600 transition-colors line-clamp-2">{post.title}</h3>
            </LocalizedLink>
          );
        })}
      </div>
    </section>
  );
}

// ============ MAIN COMPONENT ============
export default function BlogPostContent({ 
  post, 
  category, 
  relatedPosts, 
  categories,
  locale = 'vi',
  articleSchema,
  faqSchema,
  breadcrumbSchema,
}) {
  const t = i18n[locale] || i18n.vi;
  const blogPath = locale === 'en' ? '/en/blog' : '/blog';
  const homePath = locale === 'en' ? '/en' : '/';
  
  // Get sections - handle both formats
  const sections = Array.isArray(post.content) ? post.content : post.content?.sections || [];

  return (
    <>
      {/* JSON-LD Schema */}
      {articleSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      )}
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      )}

      <article className="min-h-screen bg-white">
        {/* Featured Image */}
        <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-violet-100 to-pink-100">
          <BlogImage src={post.image} alt={post.imageAlt || post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Header */}
        <header className="bg-gradient-to-br from-violet-50 via-white to-pink-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
              <LocalizedLink href={homePath} className="hover:text-violet-600 transition-colors">{t.home}</LocalizedLink>
              <span className="text-gray-300">/</span>
              <LocalizedLink href={blogPath} className="hover:text-violet-600 transition-colors">{t.blog}</LocalizedLink>
              {category && (
                <>
                  <span className="text-gray-300">/</span>
                  <LocalizedLink 
                    href={`${t.categoryPath}/${category.slug}`}
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: category.color }}
                  >
                    {category.name}
                  </LocalizedLink>
                </>
              )}
            </nav>

            <div className="max-w-4xl">
              {/* Category Badge */}
              {category && (
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mb-4"
                  style={{ backgroundColor: `${category.color}15`, color: category.color }}
                >
                  {category.name}
                </span>
              )}

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h1>

              {/* Description */}
              <p className="text-lg lg:text-xl text-gray-600 mb-6 leading-relaxed">
                {post.description}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <time dateTime={post.publishedAt} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(post.publishedAt, locale)}
                </time>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {post.readingTime || calculateReadingTime(JSON.stringify(post.content), locale)} {t.minRead}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content with Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="lg:flex lg:gap-12">
            {/* Main Content */}
            <div className="lg:flex-1 lg:max-w-3xl">
              {/* Table of Contents */}
              <TableOfContents sections={sections} locale={locale} />

              {/* Intro */}
              {post.content?.intro && (
                <div className="text-xl text-gray-700 leading-relaxed mb-8">
                  <Paragraph text={post.content.intro} />
                </div>
              )}

              {/* Sections */}
              {sections.map((section, index) => (
                <ContentSection key={index} section={section} index={index} />
              ))}

              {/* CTA */}
              <CTASection cta={post.cta} locale={locale} />

              {/* FAQ */}
              <FAQSection faqs={post.faq || post.faqs} locale={locale} />
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 lg:flex-shrink-0 mt-12 lg:mt-0">
              <div className="lg:sticky lg:top-28">
                <RelatedPosts posts={relatedPosts} categories={categories} locale={locale} />
                
                {/* CTA Card */}
                <div className="mt-8 bg-gradient-to-br from-violet-50 to-pink-50 rounded-xl p-6 border border-violet-100">
                  <h3 className="font-bold text-gray-900 mb-2">{t.ctaTitle}</h3>
                  <p className="text-sm text-gray-600 mb-4">{t.ctaDesc}</p>
                  <LocalizedLink 
                    href="/register"
                    className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {t.ctaButton}
                  </LocalizedLink>
                </div>
              </div>
            </aside>
          </div>

          {/* Back to Blog */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4 lg:max-w-3xl">
            <LocalizedLink 
              href={blogPath}
              className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.backToBlog}
            </LocalizedLink>
            {category && (
              <LocalizedLink 
                href={`${t.categoryPath}/${category.slug}`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm transition-colors"
              >
                {t.seeMore} {category.name}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </LocalizedLink>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
