'use client';

/**
 * MonsterAvatar - Avatar động vật dễ thương
 * Sử dụng bộ sưu tập Cute Animal Vectors từ SVGRepo
 * Cố định cho mỗi user dựa trên userId hoặc email (hash)
 */

// Bộ sưu tập 40 avatar động vật cute
const CUTE_ANIMALS = [
  // 1. Khủng long xanh
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#4caf50" d="M352 128c0-35.3-28.7-64-64-64s-64 28.7-64 64c0 17.7 7.2 33.7 18.8 45.2L208 224l-48-16-48 32-48-16-48 48v128l32 32h64l32-32v-32h64l32 32h64l32-32v-32l48-48 16-64-16-48-48-16zm-64 32c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"/><circle cx="304" cy="112" r="16" fill="#263238"/></svg>`,
  
  // 2. Cua cam
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#ff5722" d="M256 192c-70.7 0-128 57.3-128 128 0 35.3 14.3 67.3 37.5 90.5L128 448l48 32 48-32 32 32 32-32 48 32 48-32-37.5-37.5c23.2-23.2 37.5-55.2 37.5-90.5 0-70.7-57.3-128-128-128z"/><circle cx="208" cy="288" r="24" fill="#263238"/><circle cx="304" cy="288" r="24" fill="#263238"/><path fill="#ff5722" d="M64 256l32-64 48 32-32 64zm384 0l-32-64-48 32 32 64zm-320-128l-32-48 48-16 32 48zm272 0l32-48-48-16-32 48z"/></svg>`,
  
  // 3. Hươu nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#8d6e63" d="M256 160c-53 0-96 43-96 96v128c0 35.3 28.7 64 64 64h64c35.3 0 64-28.7 64-64V256c0-53-43-96-96-96z"/><path fill="#5d4037" d="M160 128l-32-96 48 16 32 48zm192 0l32-96-48 16-32 48z"/><circle cx="224" cy="272" r="16" fill="#263238"/><circle cx="288" cy="272" r="16" fill="#263238"/><ellipse cx="256" cy="320" rx="24" ry="16" fill="#5d4037"/></svg>`,
  
  // 4. Bạch tuộc tím
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#9c27b0" d="M256 96c-88.4 0-160 71.6-160 160v32c0 17.7 14.3 32 32 32h16l-16 96 32 32 16-80 16 80 32-32-16-96 48 32v64l32 32v-96l48-32-16 96 32 32 16-80 16 80 32-32-16-96h16c17.7 0 32-14.3 32-32v-32c0-88.4-71.6-160-160-160z"/><circle cx="208" cy="208" r="24" fill="#fff"/><circle cx="304" cy="208" r="24" fill="#fff"/><circle cx="216" cy="216" r="12" fill="#263238"/><circle cx="312" cy="216" r="12" fill="#263238"/></svg>`,
  
  // 5. Chim xanh
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#2196f3" d="M352 192c0-53-43-96-96-96s-96 43-96 96c0 35.3 19.1 66.1 47.5 82.7L160 320l-48 64 32 32 80-48 32 80 32-80 80 48 32-32-48-64-47.5-45.3c28.4-16.6 47.5-47.4 47.5-82.7z"/><circle cx="224" cy="176" r="20" fill="#263238"/><circle cx="288" cy="176" r="20" fill="#263238"/><path fill="#ff9800" d="M256 224l-24 32h48z"/></svg>`,
  
  // 6. Bò vàng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#ffc107" d="M320 160H192c-53 0-96 43-96 96v96c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64v-96c0-53-43-96-96-96z"/><path fill="#795548" d="M128 192l-48-64 32-16 48 48zm256 0l48-64-32-16-48 48z"/><circle cx="208" cy="272" r="20" fill="#263238"/><circle cx="304" cy="272" r="20" fill="#263238"/><ellipse cx="256" cy="336" rx="40" ry="24" fill="#ffcc80"/><circle cx="240" cy="336" r="8" fill="#5d4037"/><circle cx="272" cy="336" r="8" fill="#5d4037"/></svg>`,
  
  // 7. Ếch xanh lá
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="288" rx="128" ry="96" fill="#8bc34a"/><circle cx="176" cy="208" r="48" fill="#8bc34a"/><circle cx="336" cy="208" r="48" fill="#8bc34a"/><circle cx="176" cy="208" r="24" fill="#fff"/><circle cx="336" cy="208" r="24" fill="#fff"/><circle cx="184" cy="200" r="12" fill="#263238"/><circle cx="344" cy="200" r="12" fill="#263238"/><path fill="#689f38" d="M208 320c0 26.5 21.5 48 48 48s48-21.5 48-48h-96z"/></svg>`,
  
  // 8. Tôm hùm đỏ
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#f44336" d="M256 160c-70.7 0-128 57.3-128 128v64c0 35.3 28.7 64 64 64h128c35.3 0 64-28.7 64-64v-64c0-70.7-57.3-128-128-128z"/><path fill="#d32f2f" d="M96 224l-48-32 16-48 48 16zm320 0l48-32-16-48-48 16zm-256-64l-32-48 48-32 32 48zm192 0l32-48-48-32-32 48z"/><circle cx="208" cy="272" r="20" fill="#263238"/><circle cx="304" cy="272" r="20" fill="#263238"/></svg>`,
  
  // 9. Cáo cam
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#ff9800" d="M256 128c-70.7 0-128 57.3-128 128v96c0 35.3 28.7 64 64 64h128c35.3 0 64-28.7 64-64v-96c0-70.7-57.3-128-128-128z"/><path fill="#ff9800" d="M128 176l-48-80 80 32zm256 0l48-80-80 32z"/><path fill="#fff" d="M256 288l-48 48v64h96v-64z"/><circle cx="208" cy="240" r="20" fill="#263238"/><circle cx="304" cy="240" r="20" fill="#263238"/><ellipse cx="256" cy="300" rx="16" ry="12" fill="#263238"/></svg>`,
  
  // 10. Thỏ trắng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="96" ry="80" fill="#fff"/><ellipse cx="256" cy="256" rx="80" ry="64" fill="#fff"/><path fill="#ffcdd2" d="M192 128l-16-96 48 32v64zm128 0l16-96-48 32v64z"/><path fill="#fff" d="M192 128c-17.7 0-32 28.7-32 64v64h64v-64c0-35.3-14.3-64-32-64zm128 0c17.7 0 32 28.7 32 64v64h-64v-64c0-35.3 14.3-64 32-64z"/><circle cx="224" cy="240" r="16" fill="#263238"/><circle cx="288" cy="240" r="16" fill="#263238"/><ellipse cx="256" cy="280" rx="12" ry="8" fill="#ffcdd2"/></svg>`,
  
  // 11. Gấu trúc
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="128" fill="#fff"/><circle cx="176" cy="240" r="48" fill="#263238"/><circle cx="336" cy="240" r="48" fill="#263238"/><circle cx="176" cy="240" r="24" fill="#fff"/><circle cx="336" cy="240" r="24" fill="#fff"/><circle cx="184" cy="232" r="12" fill="#263238"/><circle cx="344" cy="232" r="12" fill="#263238"/><ellipse cx="256" cy="320" rx="24" ry="16" fill="#263238"/><circle cx="160" cy="160" r="32" fill="#263238"/><circle cx="352" cy="160" r="32" fill="#263238"/></svg>`,
  
  // 12. Ngựa vằn
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M320 160H192c-53 0-96 43-96 96v96c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64v-96c0-53-43-96-96-96z"/><path fill="#263238" d="M160 200h192v24H160zm0 48h192v24H160zm0 48h192v24H160z"/><path fill="#fff" d="M176 96l-32-64 48 16v48zm160 0l32-64-48 16v48z"/><circle cx="208" cy="176" r="16" fill="#263238"/><circle cx="304" cy="176" r="16" fill="#263238"/></svg>`,
  
  // 13. Sư tử vàng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="160" fill="#ff9800"/><circle cx="256" cy="304" r="96" fill="#ffc107"/><circle cx="216" cy="272" r="20" fill="#263238"/><circle cx="296" cy="272" r="20" fill="#263238"/><ellipse cx="256" cy="320" rx="24" ry="16" fill="#5d4037"/><path fill="#5d4037" d="M232 344c0 13.3 10.7 24 24 24s24-10.7 24-24h-48z"/></svg>`,
  
  // 14. Cá heo xanh
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#03a9f4" d="M416 256c0-88.4-71.6-160-160-160S96 167.6 96 256c0 53 25.8 100 65.5 129.2L128 448l64-32 64 32 64-32 64 32-33.5-62.8C390.2 356 416 309 416 256z"/><path fill="#b3e5fc" d="M256 192c-35.3 0-64 28.7-64 64v32h128v-32c0-35.3-28.7-64-64-64z"/><circle cx="208" cy="240" r="16" fill="#263238"/><circle cx="304" cy="240" r="16" fill="#263238"/><path fill="#01579b" d="M256 128l32-64h-64z"/></svg>`,
  
  // 15. Vịt vàng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="112" ry="96" fill="#ffc107"/><circle cx="256" cy="224" r="80" fill="#ffc107"/><circle cx="224" cy="208" r="16" fill="#263238"/><circle cx="288" cy="208" r="16" fill="#263238"/><path fill="#ff9800" d="M256 240l-32 32h64z"/><path fill="#ff9800" d="M256 272c-17.7 0-32 7.2-32 16s14.3 16 32 16 32-7.2 32-16-14.3-16-32-16z"/></svg>`,
  
  // 16. Mèo xám
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#9e9e9e" d="M320 160H192c-53 0-96 43-96 96v96c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64v-96c0-53-43-96-96-96z"/><path fill="#9e9e9e" d="M144 192l-48-96 64 32v64zm224 0l48-96-64 32v64z"/><circle cx="208" cy="272" r="24" fill="#ffeb3b"/><circle cx="304" cy="272" r="24" fill="#ffeb3b"/><circle cx="208" cy="272" r="12" fill="#263238"/><circle cx="304" cy="272" r="12" fill="#263238"/><ellipse cx="256" cy="320" rx="16" ry="12" fill="#ffcdd2"/></svg>`,
  
  // 17. Cú mèo nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="288" rx="112" ry="128" fill="#795548"/><circle cx="200" cy="256" r="48" fill="#fff"/><circle cx="312" cy="256" r="48" fill="#fff"/><circle cx="200" cy="256" r="24" fill="#263238"/><circle cx="312" cy="256" r="24" fill="#263238"/><path fill="#ff9800" d="M256 304l-16 32h32z"/><path fill="#795548" d="M160 160l-32-64 64 16v48zm192 0l32-64-64 16v48z"/></svg>`,
  
  // 18. Lợn hồng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="128" fill="#f48fb1"/><ellipse cx="256" cy="320" rx="48" ry="32" fill="#f8bbd9"/><circle cx="240" cy="316" r="8" fill="#c2185b"/><circle cx="272" cy="316" r="8" fill="#c2185b"/><circle cx="208" cy="256" r="20" fill="#263238"/><circle cx="304" cy="256" r="20" fill="#263238"/><ellipse cx="176" cy="208" rx="32" ry="48" fill="#f48fb1"/><ellipse cx="336" cy="208" rx="32" ry="48" fill="#f48fb1"/></svg>`,
  
  // 19. Chó corgi
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#ff9800" d="M320 176H192c-53 0-96 43-96 96v80c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64v-80c0-53-43-96-96-96z"/><path fill="#fff" d="M256 256v160h-64c-35.3 0-64-28.7-64-64v-48l64-48zm0 0v160h64c35.3 0 64-28.7 64-64v-48l-64-48z"/><path fill="#ff9800" d="M160 192l-64-80 48-16 48 64zm192 0l64-80-48-16-48 64z"/><circle cx="208" cy="256" r="16" fill="#263238"/><circle cx="304" cy="256" r="16" fill="#263238"/><ellipse cx="256" cy="296" rx="20" ry="12" fill="#263238"/></svg>`,
  
  // 20. Sóc nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="304" rx="96" ry="112" fill="#8d6e63"/><circle cx="256" cy="224" r="72" fill="#8d6e63"/><circle cx="224" cy="216" r="16" fill="#263238"/><circle cx="288" cy="216" r="16" fill="#263238"/><ellipse cx="256" cy="256" rx="12" ry="8" fill="#5d4037"/><path fill="#8d6e63" d="M176 160l-32-48 48-16v48zm160 0l32-48-48-16v48z"/><ellipse cx="352" cy="352" rx="32" ry="64" fill="#a1887f" transform="rotate(-30 352 352)"/></svg>`,
  
  // 21. Gấu nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="128" fill="#795548"/><circle cx="208" cy="256" r="24" fill="#263238"/><circle cx="304" cy="256" r="24" fill="#263238"/><ellipse cx="256" cy="320" rx="40" ry="28" fill="#a1887f"/><ellipse cx="256" cy="312" rx="16" ry="12" fill="#263238"/><circle cx="176" cy="176" r="40" fill="#795548"/><circle cx="336" cy="176" r="40" fill="#795548"/></svg>`,
  
  // 22. Chuột xám
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="304" rx="112" ry="96" fill="#9e9e9e"/><circle cx="256" cy="224" r="80" fill="#9e9e9e"/><circle cx="160" cy="176" r="48" fill="#f48fb1"/><circle cx="352" cy="176" r="48" fill="#f48fb1"/><circle cx="160" cy="176" r="32" fill="#9e9e9e"/><circle cx="352" cy="176" r="32" fill="#9e9e9e"/><circle cx="224" cy="216" r="12" fill="#263238"/><circle cx="288" cy="216" r="12" fill="#263238"/><ellipse cx="256" cy="256" rx="8" ry="6" fill="#f48fb1"/></svg>`,
  
  // 23. Khỉ nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="128" fill="#8d6e63"/><ellipse cx="256" cy="320" rx="80" ry="64" fill="#d7ccc8"/><circle cx="208" cy="256" r="20" fill="#263238"/><circle cx="304" cy="256" r="20" fill="#263238"/><ellipse cx="256" cy="340" rx="24" ry="16" fill="#8d6e63"/><circle cx="152" cy="256" r="32" fill="#d7ccc8"/><circle cx="360" cy="256" r="32" fill="#d7ccc8"/></svg>`,
  
  // 24. Chim cánh cụt
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="304" rx="112" ry="128" fill="#263238"/><ellipse cx="256" cy="336" rx="72" ry="80" fill="#fff"/><circle cx="216" cy="240" r="20" fill="#fff"/><circle cx="296" cy="240" r="20" fill="#fff"/><circle cx="216" cy="240" r="10" fill="#263238"/><circle cx="296" cy="240" r="10" fill="#263238"/><path fill="#ff9800" d="M256 280l-20 32h40z"/></svg>`,
  
  // 25. Koala xám
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="120" fill="#78909c"/><circle cx="160" cy="208" r="56" fill="#78909c"/><circle cx="352" cy="208" r="56" fill="#78909c"/><circle cx="160" cy="208" r="32" fill="#455a64"/><circle cx="352" cy="208" r="32" fill="#455a64"/><circle cx="216" cy="272" r="16" fill="#263238"/><circle cx="296" cy="272" r="16" fill="#263238"/><ellipse cx="256" cy="320" rx="32" ry="24" fill="#263238"/></svg>`,
  
  // 26. Hà mã xanh
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="304" rx="144" ry="112" fill="#78909c"/><ellipse cx="256" cy="352" rx="80" ry="48" fill="#90a4ae"/><circle cx="216" cy="256" r="24" fill="#263238"/><circle cx="296" cy="256" r="24" fill="#263238"/><circle cx="232" cy="368" r="12" fill="#455a64"/><circle cx="280" cy="368" r="12" fill="#455a64"/><ellipse cx="176" cy="240" rx="24" ry="32" fill="#78909c"/><ellipse cx="336" cy="240" rx="24" ry="32" fill="#78909c"/></svg>`,
  
  // 27. Cừu trắng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="112" fill="#fff"/><circle cx="176" cy="240" r="40" fill="#fff"/><circle cx="336" cy="240" r="40" fill="#fff"/><circle cx="200" cy="320" r="32" fill="#fff"/><circle cx="312" cy="320" r="32" fill="#fff"/><ellipse cx="256" cy="304" rx="64" ry="56" fill="#ffccbc"/><circle cx="232" cy="288" r="12" fill="#263238"/><circle cx="280" cy="288" r="12" fill="#263238"/><ellipse cx="256" cy="320" rx="16" ry="12" fill="#263238"/></svg>`,
  
  // 28. Sứa hồng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="224" rx="112" ry="96" fill="#f48fb1"/><circle cx="216" cy="208" r="20" fill="#263238"/><circle cx="296" cy="208" r="20" fill="#263238"/><path fill="#ec407a" d="M176 304v112l24-24 24 24v-112zm80 0v112l24-24 24 24v-112zm80 0v112l24-24 24 24v-112z"/></svg>`,
  
  // 29. Rùa xanh
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="304" rx="144" ry="96" fill="#4caf50"/><ellipse cx="256" cy="288" rx="112" ry="72" fill="#81c784"/><path fill="#388e3c" d="M200 256l56 32 56-32-56-32zM200 320l56 32 56-32-56-32z"/><circle cx="160" cy="240" r="32" fill="#8bc34a"/><circle cx="352" cy="240" r="32" fill="#8bc34a"/><circle cx="256" cy="200" r="40" fill="#8bc34a"/><circle cx="240" cy="192" r="8" fill="#263238"/><circle cx="272" cy="192" r="8" fill="#263238"/></svg>`,
  
  // 30. Kỳ lân tím
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#e1bee7" d="M320 192H192c-53 0-96 43-96 96v64c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64v-64c0-53-43-96-96-96z"/><path fill="#9c27b0" d="M256 96l-24 96h48z"/><path fill="#e1bee7" d="M168 208l-48-80 64 24v56zm176 0l48-80-64 24v56z"/><circle cx="208" cy="288" r="20" fill="#263238"/><circle cx="304" cy="288" r="20" fill="#263238"/><ellipse cx="256" cy="336" rx="16" ry="12" fill="#ce93d8"/><path fill="#ff80ab" d="M320 400c0-35.3-28.7-64-64-64s-64 28.7-64 64"/></svg>`,
  
  // 31. Robot cute
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><rect x="144" y="176" width="224" height="192" rx="32" fill="#90caf9"/><rect x="176" y="208" width="160" height="128" rx="16" fill="#e3f2fd"/><circle cx="216" cy="272" r="24" fill="#1976d2"/><circle cx="296" cy="272" r="24" fill="#1976d2"/><rect x="208" y="312" width="96" height="16" rx="8" fill="#1976d2"/><rect x="232" y="112" width="48" height="64" fill="#90caf9"/><circle cx="256" cy="112" r="24" fill="#ffc107"/><rect x="112" y="240" width="32" height="64" rx="16" fill="#90caf9"/><rect x="368" y="240" width="32" height="64" rx="16" fill="#90caf9"/></svg>`,
  
  // 32. Alien xanh
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="288" rx="128" ry="144" fill="#69f0ae"/><ellipse cx="192" cy="240" rx="48" ry="64" fill="#263238"/><ellipse cx="320" cy="240" rx="48" ry="64" fill="#263238"/><ellipse cx="192" cy="240" rx="24" ry="32" fill="#b9f6ca"/><ellipse cx="320" cy="240" rx="24" ry="32" fill="#b9f6ca"/><ellipse cx="256" cy="352" rx="32" ry="16" fill="#00e676"/></svg>`,
  
  // 33. Bướm hồng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="24" ry="80" fill="#795548"/><circle cx="256" cy="224" r="32" fill="#795548"/><circle cx="248" cy="216" r="8" fill="#263238"/><circle cx="264" cy="216" r="8" fill="#263238"/><ellipse cx="160" cy="256" rx="80" ry="96" fill="#f48fb1"/><ellipse cx="352" cy="256" rx="80" ry="96" fill="#f48fb1"/><ellipse cx="160" cy="256" rx="48" ry="64" fill="#f8bbd9"/><ellipse cx="352" cy="256" rx="48" ry="64" fill="#f8bbd9"/><path fill="#795548" d="M240 192c-16-32-32-48-32-48m48 48c16-32 32-48 32-48"/></svg>`,
  
  // 34. Ong vàng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="288" rx="112" ry="96" fill="#ffc107"/><path fill="#263238" d="M176 248h160v32H176zm0 56h160v32H176z"/><circle cx="256" cy="208" r="56" fill="#ffc107"/><circle cx="232" cy="200" r="12" fill="#263238"/><circle cx="280" cy="200" r="12" fill="#263238"/><ellipse cx="176" cy="224" rx="48" ry="24" fill="#e3f2fd" transform="rotate(-30 176 224)"/><ellipse cx="336" cy="224" rx="48" ry="24" fill="#e3f2fd" transform="rotate(30 336 224)"/><path fill="#263238" d="M240 168c-8-24-24-32-24-32m32 32c8-24 24-32 24-32"/></svg>`,
  
  // 35. Cá vàng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="288" rx="128" ry="80" fill="#ff9800"/><path fill="#ff9800" d="M384 288l80-64v128z"/><path fill="#ffc107" d="M192 288c0-44.2 28.7-80 64-80s64 35.8 64 80-28.7 80-64 80-64-35.8-64-80z"/><circle cx="216" cy="272" r="20" fill="#fff"/><circle cx="224" cy="272" r="10" fill="#263238"/><path fill="#ff9800" d="M256 208l-32-48h64zm0 160l-32 48h64z"/></svg>`,
  
  // 36. Bọ rùa đỏ
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="304" rx="128" ry="96" fill="#f44336"/><path fill="#263238" d="M256 208v192M160 256c32 0 64 32 96 32s64-32 96-32"/><circle cx="192" cy="288" r="24" fill="#263238"/><circle cx="320" cy="288" r="24" fill="#263238"/><circle cx="224" cy="352" r="20" fill="#263238"/><circle cx="288" cy="352" r="20" fill="#263238"/><circle cx="256" cy="208" r="48" fill="#263238"/><circle cx="240" cy="200" r="12" fill="#fff"/><circle cx="272" cy="200" r="12" fill="#fff"/></svg>`,
  
  // 37. Cá mập xanh
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="288" rx="144" ry="96" fill="#607d8b"/><path fill="#607d8b" d="M256 192l48-80-48 32-48-32z"/><path fill="#cfd8dc" d="M160 288c0-35.3 43-64 96-64s96 28.7 96 64-43 64-96 64-96-28.7-96-64z"/><circle cx="200" cy="256" r="16" fill="#263238"/><circle cx="312" cy="256" r="16" fill="#263238"/><path fill="#607d8b" d="M224 320c0 17.7 14.3 32 32 32s32-14.3 32-32h-16l-16 16-16-16z"/></svg>`,
  
  // 38. Gà con vàng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="304" r="112" fill="#ffeb3b"/><circle cx="256" cy="224" r="80" fill="#ffeb3b"/><circle cx="224" cy="208" r="16" fill="#263238"/><circle cx="288" cy="208" r="16" fill="#263238"/><path fill="#ff9800" d="M256 240l-20 24h40z"/><path fill="#f44336" d="M240 144c0-17.7 7.2-32 16-32s16 14.3 16 32c0 8.8-3.6 16.8-9.4 22.6L256 176l-6.6-9.4c-5.8-5.8-9.4-13.8-9.4-22.6z"/><ellipse cx="176" cy="320" rx="24" ry="32" fill="#ffeb3b" transform="rotate(-30 176 320)"/><ellipse cx="336" cy="320" rx="24" ry="32" fill="#ffeb3b" transform="rotate(30 336 320)"/></svg>`,
  
  // 39. Mực tím
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#7e57c2" d="M256 128c-70.7 0-128 57.3-128 128v32h256v-32c0-70.7-57.3-128-128-128z"/><circle cx="208" cy="224" r="24" fill="#fff"/><circle cx="304" cy="224" r="24" fill="#fff"/><circle cx="216" cy="232" r="12" fill="#263238"/><circle cx="312" cy="232" r="12" fill="#263238"/><path fill="#5e35b1" d="M144 288l16 128-32-64zm48 0l16 128-16-80zm48 0v128l-8-96zm32 0v128l8-96zm48 0l-16 128 16-80zm48 0l-16 128 32-64z"/></svg>`,
  
  // 40. Hổ cam
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="128" fill="#ff9800"/><path fill="#263238" d="M176 240c16 0 32 16 32 32M304 272c0-16 16-32 32-32M208 320c16 16 32 16 48 0 16 16 32 16 48 0"/><circle cx="200" cy="256" r="24" fill="#fff"/><circle cx="312" cy="256" r="24" fill="#fff"/><circle cx="208" cy="264" r="12" fill="#263238"/><circle cx="320" cy="264" r="12" fill="#263238"/><ellipse cx="256" cy="320" rx="24" ry="16" fill="#ffccbc"/><path fill="#263238" d="M232 184l-16-48 32 24zm48 0l16-48-32 24z"/><path fill="#ff9800" d="M160 208l-32-64 48 32v32zm192 0l32-64-48 32v32z"/></svg>`
];

// Hàm hash đơn giản để tạo số từ string (seed)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Chọn avatar cố định dựa trên seed
function getAvatarIndex(seed) {
  const hash = simpleHash(seed || 'default');
  return hash % CUTE_ANIMALS.length;
}

// Tạo màu nền gradient ngẫu nhiên nhưng cố định
const BG_GRADIENTS = [
  'from-purple-200 to-pink-200',
  'from-blue-200 to-cyan-200',
  'from-green-200 to-emerald-200',
  'from-yellow-200 to-orange-200',
  'from-pink-200 to-rose-200',
  'from-indigo-200 to-purple-200',
  'from-teal-200 to-green-200',
  'from-amber-200 to-yellow-200',
  'from-red-200 to-pink-200',
  'from-cyan-200 to-blue-200'
];

function getBgGradient(seed) {
  const hash = simpleHash((seed || 'default') + '_bg');
  return BG_GRADIENTS[hash % BG_GRADIENTS.length];
}

export default function MonsterAvatar({ 
  seed, // userId hoặc email để tạo avatar cố định
  size = 40, 
  className = '',
  showBorder = true
}) {
  const avatarIndex = getAvatarIndex(seed);
  const svgContent = CUTE_ANIMALS[avatarIndex];
  const bgGradient = getBgGradient(seed);
  
  const borderClass = showBorder ? 'border-2 border-white shadow-md' : '';
  
  // Tạo data URI từ SVG
  const svgBase64 = typeof window !== 'undefined' 
    ? btoa(unescape(encodeURIComponent(svgContent)))
    : Buffer.from(svgContent).toString('base64');
  const dataUri = `data:image/svg+xml;base64,${svgBase64}`;
  
  return (
    <div 
      className={`rounded-full overflow-hidden bg-gradient-to-br ${bgGradient} ${borderClass} ${className} flex items-center justify-center`}
      style={{ width: size, height: size, padding: size * 0.1 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={dataUri}
        alt="Avatar"
        width={size * 0.8}
        height={size * 0.8}
        className="w-full h-full object-contain"
        style={{ maxWidth: '80%', maxHeight: '80%' }}
      />
    </div>
  );
}

// Export helper function để sử dụng bên ngoài nếu cần
export const generateAvatarSeed = (userId, email) => {
  return userId || email || 'default';
};

// Export danh sách avatars để có thể preview
export const AVATAR_COUNT = CUTE_ANIMALS.length;
