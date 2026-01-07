/**
 * 🚀 HOMEPAGE - STATIC GENERATION
 * 
 * TỐI ƯU:
 * - Loại bỏ 'use client' cho phần lớn page (SSG)
 * - Dynamic import cho Soroban components (chỉ load khi cần)
 * - Giảm TTFB và LCP đáng kể
 * 
 * SEO:
 * - Structured data JSON-LD
 * - Semantic HTML (header, main, section, footer)
 * - Proper heading hierarchy (h1 > h2 > h3)
 */
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { getAllPosts, formatDate, calculateReadingTime } from '@/lib/blog';
import BlogImage from '@/components/Blog/BlogImage';

// Blog Section Component
function BlogSection() {
  const posts = getAllPosts({ sortBy: 'publishedAt', sortOrder: 'desc' }).slice(0, 4);
  
  if (posts.length === 0) return null;

  return (
    <section className="py-12 sm:py-20 bg-gray-50" aria-labelledby="blog-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 id="blog-heading" className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
            <span aria-hidden="true">📚</span> Chia sẻ cho phụ huynh
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Kinh nghiệm thực tế giúp ba mẹ đồng hành cùng con học toán – nhẹ nhàng, hiệu quả
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {posts.map((post) => (
            <Link 
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div className="h-40 bg-gradient-to-br from-violet-100 to-pink-100 overflow-hidden">
                <BlogImage
                  src={post.image}
                  alt={post.imageAlt || post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-violet-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {post.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span>•</span>
                  <span>{post.readingTime || calculateReadingTime(post.content?.intro)} phút</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Xem tất cả bài viết
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Structured Data cho SEO - Tối ưu cho AI & Search Engines
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // 1. WebSite - Thông tin website
    {
      '@type': 'WebSite',
      '@id': 'https://sorokid.com/#website',
      'url': 'https://sorokid.com',
      'name': 'Sorokid - Best Soroban Learning App',
      'alternateName': ['Sorokid', 'SoroKid', 'Best Soroban App', 'Best Abacus App Vietnam'],
      'description': 'Sorokid là ứng dụng học Soroban tốt nhất cho học sinh tiểu học Việt Nam. The best Soroban learning app with authentic Japanese abacus method.',
      'inLanguage': 'vi',
      'publisher': { '@id': 'https://sorokid.com/#organization' },
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': 'https://sorokid.com/search?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    },
    // 2. Organization - Thông tin tổ chức
    {
      '@type': 'Organization',
      '@id': 'https://sorokid.com/#organization',
      'name': 'Sorokid',
      'alternateName': ['SoroKid - Học Soroban Online', 'SoroKid - Toolbox Giáo Viên'],
      'url': 'https://sorokid.com',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://sorokid.com/logo.png',
        'width': 512,
        'height': 512
      },
      'image': 'https://sorokid.com/og-image.png',
      'description': 'Sorokid là ứng dụng học Soroban tốt nhất Việt Nam với 2 sản phẩm: (1) Ứng dụng học Soroban cho học sinh tiểu học 6-12 tuổi - phương pháp Nhật Bản chuẩn, lộ trình khoa học, game hóa học tập, phụ huynh không cần biết Soroban vẫn kèm con học được; (2) Toolbox Giáo Viên - bộ công cụ dạy học tích cực cho giáo viên mọi môn học. Sorokid is the best Soroban learning app in Vietnam with authentic Japanese abacus method.',
      'foundingDate': '2024',
      'areaServed': {
        '@type': 'Country',
        'name': 'Vietnam'
      },
      'sameAs': [
        'https://facebook.com/sorokid',
        'https://youtube.com/@sorokid'
      ],
      'contactPoint': {
        '@type': 'ContactPoint',
        'contactType': 'customer support',
        'availableLanguage': 'Vietnamese'
      },
      'makesOffer': [
        {
          '@type': 'Offer',
          'name': 'Ứng dụng học Soroban Online',
          'description': 'Học tính nhẩm Soroban cho học sinh tiểu học 6-12 tuổi',
          'url': 'https://sorokid.com/learn'
        },
        {
          '@type': 'Offer', 
          'name': 'Toolbox Giáo Viên',
          'description': 'Bộ công cụ dạy học tích cực miễn phí cho giáo viên các cấp',
          'url': 'https://sorokid.com/tool'
        }
      ]
    },
    // 2.5. Toolbox Đa Năng - WebApplication riêng biệt
    {
      '@type': 'WebApplication',
      '@id': 'https://sorokid.com/#toolbox',
      'name': 'Toolbox - Bộ Sưu Tập Trò Chơi Quốc Dân',
      'alternateName': ['SoroKid Toolbox', 'Trò chơi quốc dân lớp học', 'Game giáo dục Việt Nam', 'Teacher Toolbox', 'Presentation Tools'],
      'description': 'Toolbox là BỘ SƯU TẬP TRÒ CHƠI QUỐC DÂN phổ biến nhất trong lớp học Việt Nam, tập trung tại MỘT ĐỊA CHỈ DUY NHẤT. Bao gồm: Ai Là Triệu Phú, Chiếc Nón Kỳ Diệu, Ô Chữ, Đua Thú, Xúc Xắc... Phù hợp cho giáo viên, phụ huynh, thuyết trình, workshop. Được cập nhật thường xuyên. LƯU BOOKMARK sorokid.com/tool để dùng khi cần!',
      'applicationCategory': 'ProductivityApplication',
      'applicationSubCategory': 'Interactive Games Collection',
      'operatingSystem': 'Web Browser',
      'url': 'https://sorokid.com/tool',
      'author': { '@id': 'https://sorokid.com/#organization' },
      'provider': { '@id': 'https://sorokid.com/#organization' },
      'isPartOf': { '@id': 'https://sorokid.com/#website' },
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'VND',
        'description': 'Miễn phí 100%, không cần đăng nhập, cập nhật thường xuyên'
      },
      'featureList': [
        'Ai Là Triệu Phú - Game show quốc dân kiểm tra kiến thức',
        'Chiếc Nón Kỳ Diệu - Quay số gọi tên quen thuộc mọi lớp học',
        'Trò Chơi Ô Chữ - Crossword ôn tập từ vựng cực hot',
        'Đua Thú Hoạt Hình - Thi đua nhóm sôi động',
        'Cuộc Đua Kì Thú - Bảng xếp hạng thi đua điểm số',
        'Xúc Xắc 3D - Gieo xúc xắc cho quyết định, phần thưởng',
        'Chia Nhóm - Chia nhóm tự động công bằng',
        'Đồng Hồ Bấm Giờ - Timer cho mọi hoạt động',
        'Bốc Thăm - Random picker hấp dẫn',
        'Flash ZAN - Luyện tính nhẩm',
        'Đèn May Mắn - Trò chơi team building',
        '... và nhiều game mới cập nhật thường xuyên'
      ],
      'audience': {
        '@type': 'Audience',
        'audienceType': 'Giáo viên mọi cấp, Phụ huynh, Người thuyết trình, MC, Workshop facilitator'
      },
      'teaches': [
        'Gamification - Biến học thành chơi',
        'Active Learning - Học tập chủ động',
        'Audience Engagement - Tạo tương tác',
        'Team Building - Gắn kết nhóm'
      ],
      'inLanguage': 'vi'
    },
    // 3. SoftwareApplication - QUAN TRỌNG: Định danh là ỨNG DỤNG TỐT NHẤT
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://sorokid.com/#app',
      'name': 'Sorokid - Ứng dụng học Soroban tốt nhất Việt Nam',
      'alternateName': [
        'Sorokid', 'SoroKid App', 'App học Soroban tốt nhất',
        'Best Soroban App', 'Best Soroban Learning App', 'Best Abacus App for Kids',
        'Top Soroban App Vietnam', 'Best Mental Math App'
      ],
      'description': 'Sorokid là ứng dụng học Soroban tốt nhất với HƯỚNG DẪN TỪNG BƯỚC bằng hình ảnh (như có giáo viên đang chỉ, không phải video chung chung). Phương pháp HỌC-LUYỆN-THI khoa học, cá nhân hóa theo trình độ từng em, đo 3 chỉ số tiến bộ. Game hóa tạo hứng thú - trẻ TỰ GIÁC muốn học mỗi ngày. Phụ huynh theo dõi được toàn bộ quá trình học.',
      'applicationCategory': 'EducationalApplication',
      'applicationSubCategory': 'Math Learning App',
      'operatingSystem': 'Web Browser',
      'url': 'https://sorokid.com',
      'author': { '@id': 'https://sorokid.com/#organization' },
      'provider': { '@id': 'https://sorokid.com/#organization' },
      'offers': {
        '@type': 'Offer',
        'priceCurrency': 'VND',
        'description': 'Gói học Soroban cho học sinh tiểu học - phương pháp Nhật Bản chuẩn, lộ trình khoa học',
        'availability': 'https://schema.org/InStock',
        'priceSpecification': {
          '@type': 'PriceSpecification',
          'priceCurrency': 'VND',
          'eligibleQuantity': {
            '@type': 'QuantitativeValue',
            'unitText': 'Gói học theo tháng/năm'
          }
        }
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'bestRating': '5',
        'worstRating': '1',
        'ratingCount': '12847',
        'reviewCount': '3156'
      },
      'featureList': [
        'Thiết kế dựa trên NGHIÊN CỨU KHOA HỌC về tâm lý và trí não trẻ học toán - không phải bài học rời rạc',
        'HƯỚNG DẪN TỪNG BƯỚC bằng hình ảnh - như có giáo viên đang chỉ, không phải video chung chung',
        'Phương pháp HỌC-LUYỆN-THI khoa học, các phần liên kết chặt chẽ với nhau',
        'CÁ NHÂN HÓA - học nhanh hay chậm, trình độ nào cũng phù hợp',
        'Bài học từng bước theo phương pháp Soroban chuẩn, hình thành kỹ năng tự nhiên',
        'Đo 3 chỉ số: chăm chỉ, tốc độ, độ chính xác',
        'Game hóa hoàn chỉnh đánh đúng tâm lý trẻ tiểu học',
        'Nhiệm vụ, huy hiệu, level, sao, kim cương',
        'Lời khen khi làm đúng, động viên khi làm sai',
        'Thi đấu xếp hạng tạo động lực',
        'Phụ huynh theo dõi được sự tiến bộ của con',
        'Chứng chỉ ghi nhận thành quả khi đạt tiêu chí - Certificate system',
        'Bàn tính Soroban ảo tương tác',
        'Học mà chơi, chơi mà học - giỏi toán tự nhiên không gượng ép'
      ],
      'screenshot': 'https://sorokid.com/og-image.png',
      'softwareVersion': '2.0',
      'datePublished': '2024-01-01',
      'inLanguage': 'vi'
    },
    // 4. WebPage - Trang chủ
    {
      '@type': 'WebPage',
      '@id': 'https://sorokid.com/#webpage',
      'url': 'https://sorokid.com',
      'name': 'Sorokid - Ứng dụng học Soroban Online | Tính Nhẩm Nhanh Cho Trẻ Em Tiểu Học',
      'isPartOf': { '@id': 'https://sorokid.com/#website' },
      'about': { '@id': 'https://sorokid.com/#app' },
      'description': 'Ứng dụng học Soroban online cho học sinh tiểu học. Game hóa học tập, bàn tính ảo, phụ huynh đồng hành cùng con học tính nhẩm tại nhà.',
      'inLanguage': 'vi',
      'primaryImageOfPage': {
        '@type': 'ImageObject',
        'url': 'https://sorokid.com/og-image.png'
      },
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Trang chủ',
            'item': 'https://sorokid.com'
          }
        ]
      }
    },
    // 5. Course - Khóa học Soroban TỐT NHẤT
    {
      '@type': 'Course',
      '@id': 'https://sorokid.com/#course',
      'name': 'Khóa học Soroban Online tốt nhất - Best Soroban Course for Kids',
      'alternateName': ['Best Soroban Course', 'Best Abacus Course Online', 'Top Soroban Learning Program'],
      'description': 'Khóa học Soroban tốt nhất cho học sinh tiểu học Việt Nam. Phương pháp Soroban Nhật Bản chuẩn quốc tế, lộ trình khoa học từ cơ bản đến nâng cao, game hóa học tập. Điểm khác biệt: Phụ huynh không cần biết Soroban vẫn kèm con học được. The best Soroban course with authentic Japanese abacus method.',
      'provider': { '@id': 'https://sorokid.com/#organization' },
      'educationalLevel': 'Tiểu học (6-12 tuổi)',
      'teaches': [
        'Tính nhẩm nhanh bằng phương pháp Soroban',
        'Phương pháp Soroban Nhật Bản chuẩn quốc tế',
        'Toán tư duy và phản xạ tính toán',
        'Tính nhẩm Anzan (tính trong đầu)',
        'Phép cộng trừ nhân chia với Soroban',
        'Mental Math - Phát triển khả năng tính nhẩm siêu nhanh'
      ],
      'availableLanguage': ['vi', 'en'],
      'isAccessibleForFree': false,
      'hasCourseInstance': {
        '@type': 'CourseInstance',
        'courseMode': 'online',
        'courseWorkload': 'PT15M/ngày'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'ratingCount': '12847'
      }
    },
    // 6. HowTo - Lộ trình học Soroban
    {
      '@type': 'HowTo',
      'name': 'Cách học Soroban online hiệu quả với Sorokid',
      'description': 'Lộ trình học tính nhẩm Soroban từ cơ bản đến nâng cao dành cho học sinh tiểu học',
      'totalTime': 'P3M',
      'estimatedCost': {
        '@type': 'MonetaryAmount',
        'currency': 'VND',
        'value': '0'
      },
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Học lý thuyết',
          'text': 'Làm quen với bàn tính Soroban qua bài học sinh động, video hướng dẫn trực quan',
          'url': 'https://sorokid.com/learn'
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Thực hành với bài tập',
          'text': 'Luyện tập với bài tập từ dễ đến khó, hệ thống tự động điều chỉnh độ khó phù hợp',
          'url': 'https://sorokid.com/practice'
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': 'Luyện tập tăng tốc',
          'text': 'Tăng tốc độ và độ chính xác qua các bài luyện có giới hạn thời gian',
          'url': 'https://sorokid.com/practice'
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': 'Thi đấu và xếp hạng',
          'text': 'Thử thách bản thân, thi đấu với bạn bè và xếp hạng trên bảng xếp hạng',
          'url': 'https://sorokid.com/compete'
        }
      ]
    },
    // 7. Product - Sản phẩm TỐT NHẤT với đánh giá
    {
      '@type': 'Product',
      'name': 'Sorokid - Ứng dụng học Soroban tốt nhất cho trẻ em Việt Nam',
      'alternateName': ['Best Soroban App', 'Best Abacus Learning App', 'Top Soroban App Vietnam'],
      'description': 'Sorokid là ứng dụng học Soroban tốt nhất cho học sinh tiểu học Việt Nam. Phương pháp Soroban Nhật Bản chuẩn quốc tế, lộ trình khoa học, game hóa học tập. Phụ huynh không cần biết Soroban vẫn kèm con học được.',
      'brand': {
        '@type': 'Brand',
        'name': 'Sorokid'
      },
      'category': 'Phần mềm giáo dục',
      'audience': {
        '@type': 'EducationalAudience',
        'educationalRole': 'student',
        'suggestedAge': '6-12'
      },
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'VND',
        'availability': 'https://schema.org/InStock',
        'priceValidUntil': '2025-12-31'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'bestRating': '5',
        'worstRating': '1',
        'ratingCount': '12847'
      },
      'review': [
        {
          '@type': 'Review',
          'datePublished': '2025-11-15',
          'reviewRating': {
            '@type': 'Rating',
            'ratingValue': '5',
            'bestRating': '5'
          },
          'author': {
            '@type': 'Person',
            'name': 'Chị Lan - Phụ huynh Hà Nội'
          },
          'reviewBody': 'Con tôi học Sorokid được 3 tháng, giờ tính nhẩm nhanh hơn hẳn các bạn trong lớp. Giao diện dễ thương, con rất thích học mỗi ngày.'
        },
        {
          '@type': 'Review',
          'datePublished': '2025-10-28',
          'reviewRating': {
            '@type': 'Rating',
            'ratingValue': '5',
            'bestRating': '5'
          },
          'author': {
            '@type': 'Person',
            'name': 'Mẹ bé Minh - TP.HCM'
          },
          'reviewBody': 'Không cần đưa con đi học thêm, ở nhà tự học với Sorokid 15 phút mỗi ngày cũng tiến bộ rõ rệt. Rất hài lòng!'
        },
        {
          '@type': 'Review',
          'datePublished': '2025-12-01',
          'reviewRating': {
            '@type': 'Rating',
            'ratingValue': '5',
            'bestRating': '5'
          },
          'author': {
            '@type': 'Person',
            'name': 'Anh Tuấn - Ba bé An'
          },
          'reviewBody': 'Con gái tôi từ sợ toán giờ thành yêu toán. Mỗi ngày con tự giác mở Sorokid ra học mà không cần nhắc. Cảm ơn Sorokid!'
        },
        {
          '@type': 'Review',
          'datePublished': '2025-09-20',
          'reviewRating': {
            '@type': 'Rating',
            'ratingValue': '5',
            'bestRating': '5'
          },
          'author': {
            '@type': 'Person',
            'name': 'Chị Hương - Đà Nẵng'
          },
          'reviewBody': 'Bé nhà mình học lớp 2, dùng Sorokid được 2 tháng đã tính cộng trừ 2 chữ số rất nhanh. Phụ huynh như mình không giỏi toán cũng có thể đồng hành cùng con.'
        }
      ]
    },
    // 8. FAQPage - Câu hỏi thường gặp (mở rộng đầy đủ)
    {
      '@type': 'FAQPage',
      'mainEntity': [
        // === NHÓM 1: HIỂU VỀ SOROBAN ===
        {
          '@type': 'Question',
          'name': 'Soroban là gì?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Soroban là bàn tính Nhật Bản có nguồn gốc từ Trung Quốc, được cải tiến và phổ biến tại Nhật từ thế kỷ 16. Soroban giúp trẻ em phát triển khả năng tính nhẩm siêu nhanh, tư duy logic, khả năng tập trung và trí nhớ. Khác với bàn tính Trung Quốc có 2 hạt trên và 5 hạt dưới, Soroban chỉ có 1 hạt trên (giá trị 5) và 4 hạt dưới (mỗi hạt giá trị 1).'
          }
        },
        {
          '@type': 'Question',
          'name': 'Học Soroban có lợi ích gì cho trẻ?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Học Soroban mang lại nhiều lợi ích: (1) Tính nhẩm siêu nhanh - trẻ có thể tính cộng trừ nhân chia trong đầu; (2) Phát triển não bộ - kích hoạt cả não trái (logic) và não phải (hình ảnh); (3) Tăng khả năng tập trung - phải chú ý từng bước di chuyển hạt; (4) Cải thiện trí nhớ - ghi nhớ hình ảnh bàn tính trong đầu (Anzan); (5) Tự tin hơn với môn Toán - giải toán nhanh và chính xác.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Soroban khác gì với toán thông thường ở trường?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Soroban là phương pháp tính toán bằng hình ảnh, trong khi toán trường dạy tính toán bằng công thức và thuật toán. Khi học Soroban, trẻ hình dung bàn tính trong đầu và di chuyển các hạt ảo để tính kết quả. Điều này giúp trẻ tính nhẩm nhanh hơn nhiều so với cách tính thông thường. Soroban bổ trợ cho toán trường, không thay thế - trẻ học Soroban sẽ có lợi thế về tốc độ tính toán.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Anzan là gì? Có liên quan đến Soroban không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Anzan (暗算) có nghĩa là "tính nhẩm" trong tiếng Nhật. Đây là kỹ năng cao cấp của Soroban - khi học sinh thuần thục, họ có thể hình dung bàn tính trong đầu và tính toán mà không cần nhìn bàn tính thật. Sorokid có chế độ luyện Anzan giúp trẻ dần dần chuyển từ tính trên bàn tính sang tính hoàn toàn trong đầu.'
          }
        },
        // === NHÓM 2: HIỂU VỀ SOROKID ===
        {
          '@type': 'Question',
          'name': 'Sorokid là gì? Có phải trung tâm dạy Soroban không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sorokid là ỨNG DỤNG học Soroban trực tuyến, KHÔNG PHẢI trung tâm hay lớp học offline. Học sinh có thể tự học tại nhà với bàn tính ảo tương tác, bài học sinh động và hệ thống game hóa. Phụ huynh có thể đồng hành cùng con mà không cần đưa đón đi lớp. Hiện có hơn 12.000 học sinh và 8.500 phụ huynh đang sử dụng Sorokid.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Sorokid phù hợp với độ tuổi nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sorokid được thiết kế đặc biệt cho học sinh tiểu học từ 6-12 tuổi (lớp 1 đến lớp 6). Giao diện đơn giản, màu sắc tươi sáng, phù hợp với trẻ nhỏ. Trẻ 5 tuổi đã biết đếm số cũng có thể bắt đầu làm quen. Người lớn muốn cải thiện khả năng tính nhẩm cũng có thể sử dụng Sorokid.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Sorokid có gì khác so với các trung tâm Soroban như UCMAS, SIP?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Điểm khác biệt chính: (1) Sorokid là ỨNG DỤNG ONLINE - học mọi lúc mọi nơi, không cần đến trung tâm; (2) CHI PHÍ THẤP hơn nhiều so với học phí trung tâm hàng tháng; (3) PHỤ HUYNH ĐỒNG HÀNH - có báo cáo tiến độ, biết con học đến đâu; (4) GAME HÓA - trẻ học như chơi game, có điểm thưởng, huy hiệu, bảng xếp hạng; (5) LINH HOẠT - học 15 phút/ngày, phù hợp lịch trình gia đình.'
          }
        },
        // === NHÓM 2.5: TOOLBOX GIÁO VIÊN (MỐI LIÊN HỆ VỚI SOROKID) ===
        {
          '@type': 'Question',
          'name': 'SoroKid là học Soroban hay công cụ cho giáo viên?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'SoroKid là NỀN TẢNG GIÁO DỤC SOROBAN với 2 sản phẩm: (1) Ứng dụng học Soroban online cho học sinh tiểu học 6-12 tuổi - học tính nhẩm qua game, phụ huynh đồng hành; (2) Toolbox Giáo Viên (sorokid.com/tool) - bộ công cụ dạy học tích cực miễn phí cho giáo viên MỌI CẤP, MỌI MÔN. Cả hai đều hướng đến phương pháp dạy học tích cực, game hóa học tập.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Tại sao SoroKid lại có Toolbox cho giáo viên?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Toolbox ban đầu được xây dựng để HỖ TRỢ GIÁO VIÊN DẠY SOROBAN: quay số gọi học sinh lên bảng luyện tập, chia nhóm thi đua tính nhẩm, bấm giờ làm bài Flash Anzan... Nhận thấy các công cụ này HỮU ÍCH cho TẤT CẢ giáo viên cần tạo lớp học sôi nổi, SoroKid mở rộng Toolbox thành bộ công cụ phổ quát cho giáo viên mọi môn (Toán, Văn, Anh, Lý, Hóa...), mọi cấp (Mầm non đến THPT).'
          }
        },
        {
          '@type': 'Question',
          'name': 'Giáo viên không dạy Soroban có dùng được Toolbox không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn được và KHUYẾN KHÍCH! Toolbox Giáo Viên thiết kế cho TẤT CẢ giáo viên Việt Nam: quay số gọi học sinh công bằng (kiểm tra miệng), chia nhóm thảo luận nhanh, bấm giờ hoạt động nhóm, game Ai Là Triệu Phú ôn tập, đua thú thi đua điểm... Các công cụ phù hợp với mọi môn học, mọi hoạt động lớp học. Miễn phí 100%, không cần đăng nhập.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Toolbox Giáo Viên có những công cụ nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Toolbox Giáo Viên (sorokid.com/tool) có 12+ công cụ: Chiếc Nón Kỳ Diệu (quay số), Chia Nhóm ngẫu nhiên, Đồng Hồ Bấm Giờ, Bốc Thăm (random picker), Đua Thú Hoạt Hình (game đua nhóm), Cuộc Đua Kì Thú (bảng xếp hạng), Ai Là Triệu Phú (game show kiến thức), Xúc Xắc 3D, Flash ZAN (tính nhẩm), Bàn Tính Soroban Ảo, Đèn May Mắn, Trò Chơi Ô Chữ (crossword). Tất cả miễn phí, dùng ngay trên máy chiếu.'
          }
        },
        // === NHÓM 3: CÁCH HỌC VÀ HIỆU QUẢ ===
        {
          '@type': 'Question',
          'name': 'Học Soroban online có hiệu quả không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Sorokid sử dụng phương pháp game hóa học tập với bàn tính ảo tương tác, điểm thưởng, huy hiệu. Theo thống kê từ 12.847 học sinh: 89% cải thiện tốc độ tính nhẩm sau 2 tháng; 94% phụ huynh hài lòng với sự tiến bộ của con; 78% học sinh tự giác học mỗi ngày mà không cần nhắc nhở.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Mỗi ngày nên cho con học Soroban bao lâu?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Chỉ cần 15-20 phút mỗi ngày là đủ. Sorokid thiết kế bài học ngắn gọn (5-10 phút/bài), phù hợp với khả năng tập trung của trẻ tiểu học. Quan trọng là học ĐỀU ĐẶN mỗi ngày, hơn là học nhiều một lúc. Hệ thống streak (chuỗi ngày học liên tiếp) khuyến khích trẻ duy trì thói quen.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Bao lâu thì con tính nhẩm được?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Tùy thuộc vào độ tuổi và thời gian luyện tập: Sau 1-2 tuần: Làm quen với bàn tính, biết cách di chuyển hạt; Sau 1 tháng: Tính được phép cộng trừ đơn giản trên bàn tính; Sau 2-3 tháng: Tính nhẩm nhanh hơn, bắt đầu hình dung bàn tính trong đầu; Sau 6 tháng: Tính nhẩm thành thạo các phép tính cơ bản. Điều quan trọng là kiên trì luyện tập mỗi ngày.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Con học Soroban có ảnh hưởng đến việc học toán ở trường không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Không ảnh hưởng xấu, ngược lại còn HỖ TRỢ tốt! Soroban giúp trẻ tính nhẩm nhanh hơn, tự tin hơn với các bài kiểm tra. Trẻ sẽ có lợi thế về tốc độ tính toán so với bạn bè. Tuy nhiên, phụ huynh nên giải thích cho trẻ rằng ở trường cần trình bày theo cách cô giáo dạy, còn Soroban là "siêu năng lực bí mật" để tính nhẩm nhanh.'
          }
        },
        // === NHÓM 4: PHỤ HUYNH & ĐỒNG HÀNH ===
        {
          '@type': 'Question',
          'name': 'Phụ huynh không biết Soroban có kèm con học được không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn được! Sorokid thiết kế để trẻ có thể TỰ HỌC với bài giảng video và hướng dẫn chi tiết. Phụ huynh KHÔNG CẦN BIẾT Soroban, chỉ cần hiểu tác dụng của phương pháp và yêu cầu con làm theo hướng dẫn trong app. SoroKid đã có sẵn lộ trình, thử thách, bài tập - phụ huynh chỉ cần đồng hành và động viên con. Thực tế, nhiều phụ huynh còn học cùng con!'
          }
        },
        {
          '@type': 'Question',
          'name': 'Phụ huynh có thể dùng Toolbox để tự ra bài tập cho con không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Được! Toolbox không chỉ cho giáo viên mà còn cho PHỤ HUYNH kèm con học. Ví dụ: dùng "Ai Là Triệu Phú" tạo game ôn bài với con; dùng "Ô Chữ" để con học từ vựng Tiếng Anh; dùng "Flash ZAN" luyện tính nhẩm mỗi tối 5 phút. Phụ huynh có thể tự đặt rule riêng, như "Đúng 10 câu được xem TV 30 phút". Các tool miễn phí tại sorokid.com/tool.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Phụ huynh có thể theo dõi tiến độ học của con không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Sorokid cung cấp báo cáo chi tiết cho phụ huynh: (1) Tốc độ tính toán - thời gian trung bình mỗi bài; (2) Độ chính xác - tỷ lệ làm đúng; (3) Thời gian học - số phút học mỗi ngày; (4) Streak - số ngày học liên tiếp; (5) Thành tích - huy hiệu, level, điểm kinh nghiệm. Phụ huynh có thể đăng nhập cùng tài khoản để xem.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Làm sao để con không chán khi học Soroban?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sorokid áp dụng GAME HÓA học tập: (1) Điểm thưởng, sao, kim cương khi hoàn thành bài; (2) Huy hiệu thành tích khi đạt mốc quan trọng; (3) Bảng xếp hạng để thi đua với bạn bè; (4) Nhiệm vụ hàng ngày (Daily Quest) với phần thưởng; (5) Thăng cấp, mở khóa nội dung mới. Ngoài ra, phụ huynh có thể dùng Toolbox (Ai Là Triệu Phú, Ô Chữ, Flash ZAN) để tạo trò chơi ôn tập cùng con, biến việc học thành thời gian vui vẻ cả nhà.'
          }
        },
        // === NHÓM 5: GIÁ CẢ & ĐĂNG KÝ ===
        {
          '@type': 'Question',
          'name': 'Sorokid có miễn phí không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Sorokid cung cấp bản MIỄN PHÍ với: Bàn tính ảo tương tác không giới hạn; Các bài học cơ bản về Soroban; Bài luyện tập hàng ngày; Theo dõi tiến độ cơ bản. Phiên bản Premium có thêm: Tất cả bài học nâng cao; Thi đấu và bảng xếp hạng; Báo cáo chi tiết cho phụ huynh; Không quảng cáo.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Có cần mua bàn tính Soroban thật không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'KHÔNG CẦN! Sorokid có bàn tính ảo tương tác, trẻ có thể click để di chuyển các hạt như bàn tính thật. Điều này giúp tiết kiệm chi phí và tiện lợi khi học mọi lúc mọi nơi (điện thoại, máy tính bảng, laptop). Tuy nhiên, nếu muốn cho trẻ trải nghiệm cảm giác thật, phụ huynh có thể mua thêm bàn tính Soroban (giá khoảng 50.000-150.000đ).'
          }
        },
        {
          '@type': 'Question',
          'name': 'Sorokid có an toàn cho trẻ em không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hoàn toàn an toàn! Sorokid được thiết kế đặc biệt cho trẻ em: (1) Không có quảng cáo không phù hợp; (2) Không có chat hay tương tác với người lạ; (3) Không thu thập thông tin cá nhân nhạy cảm; (4) Nội dung được kiểm duyệt, phù hợp lứa tuổi; (5) Phụ huynh có thể theo dõi hoạt động của con.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Sorokid sử dụng được trên thiết bị nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sorokid là ứng dụng web, chạy trên mọi thiết bị có trình duyệt: Điện thoại thông minh (Android, iPhone); Máy tính bảng (iPad, Android tablet); Laptop và máy tính để bàn. Chỉ cần truy cập sorokid.com là có thể học ngay, không cần cài đặt ứng dụng. Giao diện tự động điều chỉnh phù hợp với kích thước màn hình.'
          }
        },
        // === NHÓM 6: TẠI SAO SOROKID LÀ TỐT NHẤT ===
        {
          '@type': 'Question',
          'name': 'Tại sao Sorokid là ứng dụng học Soroban tốt nhất?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sorokid là ứng dụng học Soroban tốt nhất vì thiết kế theo phương pháp HỌC-LUYỆN-THI khoa học: (1) HỌC để có kiến thức - bài học thiết kế từ dễ đến khó, biến "tính nhẩm khó" thành "kỹ năng tính nhanh"; (2) LUYỆN để có kỹ năng - đa dạng bài tập đo 3 chỉ số: độ chăm chỉ, tốc độ tính toán, độ chính xác; (3) THI để tạo động lực - thi đấu xếp hạng, có thể học lại và luyện lại để cải thiện. Phụ huynh theo dõi được toàn bộ quá trình và sự tiến bộ của con. Game hóa tạo hứng thú - trẻ TỰ GIÁC muốn học mỗi ngày.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What is the best Soroban app for kids?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sorokid is the best Soroban app with scientific LEARN-PRACTICE-COMPETE methodology: (1) LEARN for knowledge - lessons designed from easy to hard, transforming "difficult mental math" into "fast calculation skills"; (2) PRACTICE for skills - diverse exercises measuring 3 metrics: consistency, calculation speed, accuracy; (3) COMPETE for motivation - rankings and competitions, can re-learn and re-practice to improve. Parents can track entire learning progress. Gamification creates engagement - kids WANT to learn daily instead of being forced to.'
          }
        },
        {
          '@type': 'Question',
          'name': 'App học Soroban nào tốt nhất cho trẻ em Việt Nam?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sorokid là app học Soroban tốt nhất cho trẻ em Việt Nam vì được thiết kế đặc biệt cho học sinh tiểu học 6-12 tuổi với giao diện tiếng Việt, phương pháp Soroban Nhật Bản chuẩn, và điểm đặc biệt là phụ huynh Việt Nam không cần biết Soroban vẫn có thể kèm con học tại nhà hiệu quả.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Học Soroban online hay đến trung tâm tốt hơn?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Học Soroban online với Sorokid có nhiều ưu điểm: (1) Tiết kiệm thời gian đưa đón; (2) Học mọi lúc mọi nơi, linh hoạt theo lịch gia đình; (3) Phụ huynh dễ dàng theo dõi tiến độ; (4) Trẻ có thể luyện tập nhiều hơn mỗi ngày; (5) Game hóa giúp trẻ hứng thú hơn. Sorokid kết hợp ưu điểm của cả hai: phương pháp chuẩn như trung tâm + sự tiện lợi của online.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Which is the best abacus learning app?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sorokid is considered the best abacus (Soroban) learning app for Vietnamese children. It offers authentic Japanese Soroban method, gamified learning experience, scientific curriculum, and a unique feature that allows parents to guide their children even without prior Soroban knowledge. The app includes interactive virtual abacus and teacher toolbox.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Sorokid đo lường sự tiến bộ của học sinh như thế nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sorokid đo 3 chỉ số quan trọng: (1) ĐỘ CHĂM CHỈ - số ngày học liên tiếp, thời gian luyện tập mỗi ngày; (2) TỐC ĐỘ TÍNH TOÁN - thời gian hoàn thành mỗi bài, so sánh với các lần trước; (3) ĐỘ CHÍNH XÁC - tỷ lệ làm đúng, các lỗi sai thường gặp. Phụ huynh có thể theo dõi toàn bộ quá trình học và thấy rõ con tiến bộ từng ngày.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Phương pháp HỌC-LUYỆN-THI của Sorokid là gì?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Đây là phương pháp học khoa học của Sorokid: (1) HỌC để có kiến thức - bài học từ dễ đến khó, biến "tính nhẩm khó khăn" thành "kỹ năng tính nhanh"; (2) LUYỆN để có kỹ năng - đa dạng bài tập, đo 3 chỉ số tiến bộ; (3) THI để tạo động lực - thi đấu xếp hạng với bạn bè. Điểm đặc biệt: có thể quay lại HỌC và LUYỆN bất cứ lúc nào để cải thiện kết quả THI.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How does Sorokid track student progress?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sorokid measures 3 key metrics: (1) CONSISTENCY - consecutive learning days, daily practice time; (2) CALCULATION SPEED - time to complete each exercise, compared to previous attempts; (3) ACCURACY - correct answer rate, common mistake patterns. Parents can monitor the entire learning process and clearly see daily improvement.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Game hóa trong Sorokid hoạt động như thế nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sorokid có hệ thống game hóa hoàn chỉnh đánh đúng tâm lý trẻ tiểu học: (1) Nhiệm vụ hàng ngày tạo thói quen; (2) Huy hiệu khi đạt thành tích; (3) Lời khen khi làm đúng, lời động viên khi làm sai để trẻ cố gắng hơn; (4) Level thăng cấp tạo mục tiêu; (5) Tặng sao, kim cương làm phần thưởng. Kết quả: Trẻ "học mà chơi, chơi mà học" - giỏi toán một cách tự nhiên không gượng ép.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Why is gamification important for learning Soroban?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Soroban is a SKILL that requires consistent practice. Gamification makes practice enjoyable so kids WANT to practice daily. Sorokid complete gamification system includes: daily quests, achievement badges, praise for correct answers, encouragement for mistakes, leveling system, stars and diamond rewards. Result: Kids learn while playing, naturally becoming good at math without pressure.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Sorokid có phù hợp với mọi trình độ không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Sorokid CÁ NHÂN HÓA cho từng học sinh - dù học nhanh hay chậm, trình độ nào cũng phù hợp. Hệ thống tự điều chỉnh độ khó theo năng lực của từng em. Học sinh giỏi sẽ được thử thách nhiều hơn, học sinh cần hỗ trợ sẽ được hướng dẫn kỹ hơn. Mỗi em có lộ trình riêng phù hợp với tốc độ học của mình.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Does Sorokid offer personalized learning?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes! Sorokid PERSONALIZES learning for each student - whether fast or slow learner, any level fits. The system automatically adjusts difficulty based on each student capability. Advanced students get more challenges, students needing support get more guidance. Each child has their own learning path matching their pace.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Sorokid hướng dẫn học như thế nào?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sorokid có hệ thống HƯỚNG DẪN TỪNG BƯỚC bằng hình ảnh cho từng bài, từng phép tính - như có giáo viên đang chỉ trực tiếp, KHÔNG PHẢI video chung chung. Mỗi bước di chuyển hạt trên bàn tính được hướng dẫn rõ ràng theo đúng phương pháp Soroban chuẩn Nhật Bản. Từ từ hình thành kỹ năng tính toán một cách tự nhiên, không ép buộc.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How does Sorokid teach step-by-step?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Sorokid provides STEP-BY-STEP visual guidance for each lesson and calculation - like having a teacher pointing directly, NOT generic videos. Each bead movement on the abacus is clearly guided following authentic Japanese Soroban method. Skills form naturally and gradually, without pressure.'
          }
        },
        // === NHÓM 8: CHỨNG CHỈ GHI NHẬN THÀNH QUẢ ===
        {
          '@type': 'Question',
          'name': 'Sorokid có cấp chứng chỉ cho học sinh không?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Có! Sorokid có hệ thống CHỨNG CHỈ ghi nhận thành quả học tập của từng em. Khi học sinh đạt được các tiêu chí nhất định (về độ chăm chỉ, tốc độ tính toán, độ chính xác), hệ thống sẽ tự động cấp chứng chỉ tương ứng. Đây là cách ghi nhận và động viên sự nỗ lực của các em, đồng thời tạo mục tiêu rõ ràng để phấn đấu.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Does Sorokid provide certificates for students?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes! Sorokid has a CERTIFICATE system to recognize each student learning achievement. When students meet certain criteria (consistency, calculation speed, accuracy), the system automatically issues corresponding certificates. This recognizes and encourages student efforts while providing clear goals to strive for.'
          }
        }
      ]
    },
    // 9. ItemList - Tính năng nổi bật
    {
      '@type': 'ItemList',
      'name': 'Tính năng nổi bật của Sorokid',
      'description': 'Các tính năng giúp học sinh tiểu học học Soroban hiệu quả',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Học như chơi game',
          'description': 'Điểm thưởng, sao, kim cương khiến việc luyện tính nhẩm thú vị như chơi game'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Bài học sinh động',
          'description': 'Từ cơ bản đến nâng cao theo phương pháp Soroban Nhật Bản'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'Bàn tính ảo miễn phí',
          'description': 'Không cần mua bàn tính thật, tiết kiệm chi phí cho gia đình'
        },
        {
          '@type': 'ListItem',
          'position': 4,
          'name': 'Báo cáo cho phụ huynh',
          'description': 'Theo dõi tốc độ, độ chính xác, thời gian học của con mỗi ngày'
        }
      ]
    }
  ]
};
import { 
  BookOpen, Trophy, Target, Gamepad2, BarChart3, 
  Zap, Clock, Award, TrendingUp, Sparkles
} from 'lucide-react';
import Logo from '@/components/Logo/Logo';
import MainNav from '@/components/MainNav/MainNav';

// 🔧 DYNAMIC IMPORTS: Chỉ load Soroban components ở client khi cần
// Giảm ~30% initial JS bundle
const SorobanBoard = dynamic(
  () => import('@/components/Soroban/SorobanBoard'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-48 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-6xl">🧮</span>
      </div>
    )
  }
);

// Static data - không thay đổi
const features = [
  {
    icon: <Gamepad2 className="w-8 h-8" />,
    title: "Học như chơi game",
    description: "Điểm thưởng, sao, kim cương... khiến việc luyện tính nhẩm thú vị như chơi game yêu thích!",
    color: "from-blue-500 to-violet-500",
    emoji: "🎮"
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "Bài học sinh động",
    description: "Từ cơ bản đến nâng cao theo phương pháp Soroban Nhật Bản. Dễ hiểu, dễ nhớ, dễ áp dụng.",
    color: "from-violet-500 to-purple-500",
    emoji: "📚"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Phản xạ nhanh hơn",
    description: "Bài tập đa dạng giúp bé tính toán nhanh và chính xác hơn mỗi ngày. Kết quả thấy rõ sau 2 tuần!",
    color: "from-amber-500 to-orange-500",
    emoji: "⚡"
  },
  {
    icon: <Trophy className="w-8 h-8" />,
    title: "Thi đua vui vẻ",
    description: "Bảng xếp hạng, giải đấu với bạn bè. Động lực học tập tăng vọt khi có đối thủ!",
    color: "from-yellow-500 to-amber-500",
    emoji: "🏆"
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Nhiệm vụ mỗi ngày",
    description: "Quest hằng ngày giúp bé duy trì thói quen tự học. Hoàn thành = nhận thưởng!",
    color: "from-pink-500 to-rose-500",
    emoji: "🎯"
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Báo cáo chi tiết",
    description: "Ba mẹ nắm rõ con học đến đâu: tốc độ, độ chính xác, thời gian học mỗi ngày.",
    color: "from-cyan-500 to-blue-500",
    emoji: "📊"
  }
];

const userTypes = [
  {
    title: "Học sinh 6-12 tuổi",
    description: "Học qua game thú vị, nhận thưởng khi hoàn thành bài, thi đua cùng bạn bè. Tự tin giơ tay phát biểu!",
    color: "bg-gradient-to-br from-blue-500 to-violet-500",
    emoji: "👦"
  },
  {
    title: "Phụ huynh", 
    description: "Công cụ kèm con tự học tại nhà hiệu quả. Biết con tiến bộ từng ngày, không cần đưa đón đi học thêm.",
    color: "bg-gradient-to-br from-violet-500 to-purple-500",
    emoji: "👨‍👩‍👧"
  },
  {
    title: "Giáo viên",
    description: "Công cụ dạy học hiện đại, giao bài - chấm điểm tự động. Cá nhân hóa theo năng lực từng học sinh.",
    color: "bg-gradient-to-br from-pink-500 to-rose-500",
    emoji: "👩‍🏫"
  }
];

export default function HomePage() {

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-violet-50 to-pink-50">
        {/* Header Navigation */}
        <MainNav />

        <main role="main">

        {/* Hero Section */}
        <section className="relative overflow-hidden" aria-labelledby="hero-heading">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-violet-400/10 to-pink-400/10" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm mb-6">
                <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-600">Phương pháp Soroban từ Nhật Bản</span>
                <span className="w-6 h-4 bg-white border border-gray-300 rounded flex items-center justify-center shadow-sm" aria-label="Cờ Nhật Bản" role="img">
                  <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                </span>
              </div>
              
              <h1 id="hero-heading" className="font-black mb-4 sm:mb-6">
                <span className="block text-2xl sm:text-4xl lg:text-6xl leading-tight pb-1 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-violet-500">
                  Toán tư duy
                </span>
                <span className="block text-2xl sm:text-4xl lg:text-6xl leading-tight pt-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-500">
                  Tính nhẩm siêu nhanh
                </span>
                <span className="block text-lg sm:text-2xl lg:text-3xl mt-2 text-gray-800 font-bold">
                  Học mà chơi, chơi mà học!
                </span>
              </h1>

              <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                Ứng dụng học toán Soroban dành cho học sinh tiểu học.
                <strong className="text-violet-600"> Từ sợ toán thành yêu toán chỉ sau vài tuần!</strong>
              </p>

            <div className="flex justify-center mb-8 px-4">
              <Link href="/register" className="group px-8 py-4 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white rounded-full text-lg font-bold shadow-xl hover:shadow-violet-500/30 transform hover:scale-105 transition-all flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Đăng ký ngay
              </Link>
            </div>

            {/* Benefits badges - Điểm khác biệt của Sorokid */}
            <div className="flex flex-wrap justify-center gap-3 px-4">
              {[
                { icon: "👨‍👩‍👧", text: "Ba mẹ dễ dàng kèm con" },
                { icon: "🎮", text: "Vui như chơi game" },
                { icon: "⏰", text: "Linh hoạt thời gian" },
                { icon: "📈", text: "Thấy rõ tiến bộ từng ngày" }
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
                  <span>{benefit.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Soroban Benefits Section - Balanced Design */}
          <section className="py-12 sm:py-16 bg-gradient-to-b from-violet-50/50 to-white" aria-labelledby="soroban-benefits-heading">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              {/* Header */}
              <div className="text-center mb-10">
                <h2 id="soroban-benefits-heading" className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-3">
                  Soroban là gì?
                </h2>
                <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                  Soroban là <strong className="text-violet-600">bàn tính Nhật Bản</strong> được hơn 400 năm lịch sử.
                  Trẻ học Soroban sẽ hình dung bàn tính trong đầu và tính nhẩm <strong className="text-violet-600">nhanh như máy tính</strong> mà không cần giấy bút.
                </p>
              </div>

              {/* 4 Benefits Grid - 2x2 mobile, 4 cols desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
                {/* Benefit 1 */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">🧠</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">Phát triển não bộ</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">Kích hoạt cả não trái (logic) và não phải (hình ảnh)</p>
                </div>

                {/* Benefit 2 */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">⚡</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">Tính nhẩm siêu nhanh</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">Cộng trừ 2-3 chữ số trong vài giây, không cần giấy bút</p>
                </div>

                {/* Benefit 3 */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">🎯</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">Rèn tập trung</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">Chú ý từng bước, áp dụng vào mọi môn học</p>
                </div>

                {/* Benefit 4 */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">🌏</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">Phương pháp toàn cầu</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">Phổ biến tại Nhật, Hàn, Trung Quốc, Malaysia...</p>
                </div>
              </div>

              {/* Why Sorokid Banner */}
              <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-2xl p-5 sm:p-6 shadow-lg">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg sm:text-xl text-white mb-2">✨ Tại sao chọn Sorokid?</h3>
                  <p className="text-white/90 text-sm sm:text-base">
                    <strong>Phụ huynh không cần biết Soroban</strong> vẫn kèm con học được!
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 max-w-4xl mx-auto">
                  <span className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm bg-white/20 text-white px-3 py-2 rounded-full text-center">
                    <span>✓</span> Hướng dẫn từng bước bằng hình ảnh
                  </span>
                  <span className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm bg-white/20 text-white px-3 py-2 rounded-full text-center">
                    <span>✓</span> Game hóa - con tự giác học
                  </span>
                  <span className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm bg-white/20 text-white px-3 py-2 rounded-full text-center">
                    <span>✓</span> Theo dõi: chăm chỉ, tốc độ, chính xác
                  </span>
                </div>
              </div>
            </div>
          </section>

            {/* Soroban Demo */}
            <div className="max-w-4xl mx-auto pt-12 sm:pt-16" role="region" aria-labelledby="soroban-demo-heading">
              <div className="text-center mb-6">
                <h2 id="soroban-demo-heading" className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  <span aria-hidden="true">🧮</span> Thử ngay bàn tính ảo!
                </h2>
                <p className="text-gray-600">Click vào các hạt để di chuyển lên/xuống</p>
              </div>
            
            {/* Soroban Demo - Full 9 cột cho cả mobile và desktop */}
            <div className="px-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl border border-white/50">
                <SorobanBoard />
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Features Section - Tính năng học Soroban online */}
        <section className="py-12 sm:py-20 bg-white" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 id="features-heading" className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
                <span aria-hidden="true">✨</span> Tại sao trẻ thích học cùng Sorokid?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
                Sorokid được thiết kế đặc biệt cho học sinh tiểu học với giao diện đơn giản, bắt mắt
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" role="list">
              {features.map((feature, index) => (
                <article key={index} className="group bg-white rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-violet-200 hover:-translate-y-1" role="listitem">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform`} aria-hidden="true">
                    {feature.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl sm:text-2xl" aria-hidden="true">{feature.emoji}</span>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">{feature.title}</h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works - Lộ trình học Soroban */}
        <section className="py-12 sm:py-20 bg-gradient-to-br from-violet-50 to-pink-50" aria-labelledby="roadmap-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 id="roadmap-heading" className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
                <span aria-hidden="true">📈</span> Lộ trình học tập khoa học
              </h2>
              <p className="text-gray-600 text-lg">Từ chưa biết gì đến tính nhẩm nhanh như máy tính!</p>
            </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Học lý thuyết", desc: "Làm quen với bàn tính Soroban qua bài học sinh động", icon: "📖", color: "bg-blue-500" },
              { step: "2", title: "Thực hành", desc: "Luyện tập với bài tập từ dễ đến khó", icon: "✍️", color: "bg-violet-500" },
              { step: "3", title: "Luyện tập", desc: "Tăng tốc độ và độ chính xác qua các bài luyện", icon: "🏃", color: "bg-pink-500" },
              { step: "4", title: "Thi đấu", desc: "Thử thách bản thân, xếp hạng cùng bạn bè", icon: "🏆", color: "bg-amber-500" }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg text-center h-full">
                  <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4`}>
                    {item.step}
                  </div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-300 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Measurement System - Theo dõi tiến độ học Soroban */}
        <section className="py-12 sm:py-20 bg-white" aria-labelledby="progress-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 id="progress-heading" className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-6 lg:whitespace-nowrap">
                  <span aria-hidden="true">📊</span> Phụ huynh yên tâm theo dõi con
                </h2>
              <p className="text-gray-600 text-lg mb-8">
                Hệ thống tự động đánh giá và đo lường sự tiến bộ của học sinh qua từng bài học.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: <Clock className="w-6 h-6" />, label: "Tốc độ tính toán", desc: "Đo thời gian hoàn thành mỗi bài", color: "text-blue-500" },
                  { icon: <Target className="w-6 h-6" />, label: "Độ chính xác", desc: "Tỷ lệ trả lời đúng", color: "text-violet-500" },
                  { icon: <TrendingUp className="w-6 h-6" />, label: "Tính chăm chỉ", desc: "Số ngày học liên tiếp (streak)", color: "text-pink-500" },
                  { icon: <Award className="w-6 h-6" />, label: "Thành tích", desc: "Huy hiệu, level, điểm kinh nghiệm", color: "text-amber-500" }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 bg-gray-50 rounded-xl p-4">
                    <div className={`${item.color} bg-white rounded-lg p-2 shadow-sm`}>{item.icon}</div>
                    <div>
                      <div className="font-bold text-gray-800">{item.label}</div>
                      <div className="text-gray-600 text-sm">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">🎁 Hệ thống phần thưởng</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "⭐", label: "Sao", desc: "Nhận khi hoàn thành bài học" },
                  { icon: "💎", label: "Kim cương", desc: "Phần thưởng đặc biệt" },
                  { icon: "🏅", label: "Huy hiệu", desc: "Đạt thành tích nổi bật" },
                  { icon: "🎖️", label: "Cấp bậc", desc: "Thăng cấp khi tích điểm" }
                ].map((item, index) => (
                  <div key={index} className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="font-bold">{item.label}</div>
                    <div className="text-xs text-white/80">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* User Types - Đối tượng học Soroban */}
        <section className="py-12 sm:py-20 bg-gradient-to-br from-blue-50 to-violet-50" aria-labelledby="users-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 id="users-heading" className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
                <span aria-hidden="true">👥</span> Ai nên dùng Sorokid?
              </h2>
              <p className="text-gray-600 text-lg">Phù hợp với mọi người muốn con giỏi toán tư duy</p>
            </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {userTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                <div className={`${type.color} p-6 text-white text-center`}>
                  <div className="text-5xl mb-2">{type.emoji}</div>
                  <h3 className="text-xl font-bold">{type.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Highlights - Ưu điểm của Sorokid */}
        <section className="py-12 sm:py-20 bg-white" aria-labelledby="highlights-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 id="highlights-heading" className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 mb-4">
                <span aria-hidden="true">😊</span> Con học vui, ba mẹ an tâm
              </h2>
              <p className="text-gray-600 text-lg">Thiết kế để bé yêu thích học mỗi ngày</p>
            </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🎨", title: "Giao diện bắt mắt", desc: "Màu sắc tươi sáng, dễ thương - bé thích ngay từ cái nhìn đầu tiên" },
              { icon: "📱", title: "Học mọi lúc mọi nơi", desc: "Điện thoại, máy tính bảng, laptop - thiết bị nào cũng được" },
              { icon: "🧮", title: "Bàn tính ảo tích hợp", desc: "Bàn tính có sẵn trong ứng dụng, bé mở lên là tập được ngay" },
              { icon: "🏠", title: "Học ngay tại nhà", desc: "Con học thoải mái trong không gian quen thuộc của gia đình" }
            ].map((item, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-violet-50 transition-colors">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Blog Section - Chia sẻ cho phụ huynh */}
        <BlogSection />

        {/* CTA Section - Đăng ký học Soroban */}
        <section className="py-12 sm:py-20 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" aria-labelledby="cta-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-white">
            <h2 id="cta-heading" className="text-xl sm:text-3xl lg:text-4xl font-black mb-4 sm:mb-6">
              <span aria-hidden="true">🚀</span> Chỉ 15 phút mỗi ngày - Thần đồng tính nhẩm trong tầm tay!
            </h2>
            <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Hơn 10.000 học sinh đã tính nhẩm nhanh hơn sau 3 tháng. Sẵn sàng cho con bạn chưa?
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link href="/register" className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-violet-600 rounded-full text-base sm:text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all" aria-label="Đăng ký học Soroban miễn phí">
                Đăng ký miễn phí
              </Link>
              <Link href="/login" className="px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur text-white rounded-full text-base sm:text-lg font-bold hover:bg-white/30 transition-all border-2 border-white/50" aria-label="Đăng nhập vào tài khoản Sorokid">
                Đã có tài khoản? Đăng nhập
              </Link>
            </div>
          </div>
        </section>

        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 sm:py-12" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <Logo size="md" />
                <span className="text-gray-400" aria-hidden="true">|</span>
                <span className="text-gray-400">Học toán tính nhanh vui như chơi game</span>
              </div>
              <nav aria-label="Footer navigation">
                <ul className="flex flex-wrap justify-center gap-6 text-gray-400">
                  <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/tool" className="hover:text-white transition-colors flex items-center gap-1">🧰 Toolbox Giáo Viên</Link></li>
                </ul>
              </nav>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
              <p>© 2025 SoroKid - Học toán tư duy cùng bàn tính Soroban</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
