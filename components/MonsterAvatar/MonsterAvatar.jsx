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
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="112" ry="96" fill="#ffc107"/><ellipse cx="256" cy="280" rx="56" ry="48" fill="#ffc107"/><circle cx="256" cy="224" r="80" fill="#ffc107"/><circle cx="224" cy="208" r="16" fill="#263238"/><circle cx="288" cy="208" r="16" fill="#263238"/><path fill="#ff9800" d="M256 240l-32 32h64z"/><path fill="#ff9800" d="M256 272c-17.7 0-32 7.2-32 16s14.3 16 32 16 32-7.2 32-16-14.3-16-32-16z"/></svg>`,
  
  // 16. Mèo xám
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#9e9e9e" d="M320 160H192c-53 0-96 43-96 96v96c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64v-96c0-53-43-96-96-96z"/><path fill="#9e9e9e" d="M144 192l-48-96 64 32v64zm224 0l48-96-64 32v64z"/><circle cx="208" cy="272" r="24" fill="#ffeb3b"/><circle cx="304" cy="272" r="24" fill="#ffeb3b"/><circle cx="208" cy="272" r="12" fill="#263238"/><circle cx="304" cy="272" r="12" fill="#263238"/><ellipse cx="256" cy="320" rx="16" ry="12" fill="#ffcdd2"/></svg>`,
  
  // 17. Cú mèo nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="288" rx="112" ry="128" fill="#795548"/><circle cx="200" cy="256" r="48" fill="#fff"/><circle cx="312" cy="256" r="48" fill="#fff"/><circle cx="200" cy="256" r="24" fill="#263238"/><circle cx="312" cy="256" r="24" fill="#263238"/><path fill="#ff9800" d="M256 304l-16 32h32z"/><path fill="#795548" d="M160 160l-32-64 64 16v48zm192 0l32-64-64 16v48z"/></svg>`,
  
  // 18. Lợn hồng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="128" fill="#f48fb1"/><ellipse cx="256" cy="320" rx="48" ry="32" fill="#f8bbd9"/><circle cx="240" cy="316" r="8" fill="#c2185b"/><circle cx="272" cy="316" r="8" fill="#c2185b"/><circle cx="208" cy="256" r="20" fill="#263238"/><circle cx="304" cy="256" r="20" fill="#263238"/><ellipse cx="176" cy="208" rx="32" ry="48" fill="#f48fb1"/><ellipse cx="336" cy="208" rx="32" ry="48" fill="#f48fb1"/></svg>`,
  
  // 19. Chó corgi
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#ff9800" d="M320 176H192c-53 0-96 43-96 96v80c0 35.3 28.7 64 64 64h192c35.3 0 64-28.7 64-64v-80c0-53-43-96-96-96z"/><path fill="#fff" d="M256 256v160h-64c-35.3 0-64-28.7-64-64v-48l64-48zm0 0v160h64c35.3 0 64-28.7 64-64v-48l-64-48z"/><path fill="#ff9800" d="M160 192l-64-80 48-16 48 64zm192 0l64-80-48-16-48 64z"/><circle cx="208" cy="256" r="16" fill="#263238"/><circle cx="304" cy="256" r="16" fill="#263238"/><ellipse cx="256" cy="296" rx="20" ry="12" fill="#263238"/></svg>`,
  
  // 20. Sóc nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="304" rx="96" ry="112" fill="#8d6e63"/><ellipse cx="256" cy="256" rx="48" ry="40" fill="#8d6e63"/><circle cx="256" cy="224" r="72" fill="#8d6e63"/><circle cx="224" cy="216" r="16" fill="#263238"/><circle cx="288" cy="216" r="16" fill="#263238"/><ellipse cx="256" cy="256" rx="12" ry="8" fill="#5d4037"/><path fill="#8d6e63" d="M176 160l-32-48 48-16v48zm160 0l32-48-48-16v48z"/><ellipse cx="352" cy="352" rx="32" ry="64" fill="#a1887f" transform="rotate(-30 352 352)"/></svg>`,
  
  // 21. Gấu nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="128" fill="#795548"/><circle cx="208" cy="256" r="24" fill="#263238"/><circle cx="304" cy="256" r="24" fill="#263238"/><ellipse cx="256" cy="320" rx="40" ry="28" fill="#a1887f"/><ellipse cx="256" cy="312" rx="16" ry="12" fill="#263238"/><circle cx="176" cy="176" r="40" fill="#795548"/><circle cx="336" cy="176" r="40" fill="#795548"/></svg>`,
  
  // 22. Chuột xám
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="304" rx="112" ry="96" fill="#9e9e9e"/><ellipse cx="256" cy="260" rx="56" ry="44" fill="#9e9e9e"/><circle cx="256" cy="224" r="80" fill="#9e9e9e"/><circle cx="160" cy="176" r="48" fill="#f48fb1"/><circle cx="352" cy="176" r="48" fill="#f48fb1"/><circle cx="160" cy="176" r="32" fill="#9e9e9e"/><circle cx="352" cy="176" r="32" fill="#9e9e9e"/><circle cx="224" cy="216" r="12" fill="#263238"/><circle cx="288" cy="216" r="12" fill="#263238"/><ellipse cx="256" cy="256" rx="8" ry="6" fill="#f48fb1"/></svg>`,
  
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
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="304" r="112" fill="#ffeb3b"/><ellipse cx="256" cy="260" rx="56" ry="44" fill="#ffeb3b"/><circle cx="256" cy="224" r="80" fill="#ffeb3b"/><circle cx="224" cy="208" r="16" fill="#263238"/><circle cx="288" cy="208" r="16" fill="#263238"/><path fill="#ff9800" d="M256 240l-20 24h40z"/><path fill="#f44336" d="M240 144c0-17.7 7.2-32 16-32s16 14.3 16 32c0 8.8-3.6 16.8-9.4 22.6L256 176l-6.6-9.4c-5.8-5.8-9.4-13.8-9.4-22.6z"/><ellipse cx="176" cy="320" rx="24" ry="32" fill="#ffeb3b" transform="rotate(-30 176 320)"/><ellipse cx="336" cy="320" rx="24" ry="32" fill="#ffeb3b" transform="rotate(30 336 320)"/></svg>`,
  
  // 39. Mực tím
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#7e57c2" d="M256 128c-70.7 0-128 57.3-128 128v32h256v-32c0-70.7-57.3-128-128-128z"/><circle cx="208" cy="224" r="24" fill="#fff"/><circle cx="304" cy="224" r="24" fill="#fff"/><circle cx="216" cy="232" r="12" fill="#263238"/><circle cx="312" cy="232" r="12" fill="#263238"/><path fill="#5e35b1" d="M144 288l16 128-32-64zm48 0l16 128-16-80zm48 0v128l-8-96zm32 0v128l8-96zm48 0l-16 128 16-80zm48 0l-16 128 32-64z"/></svg>`,
  
  // 40. Hổ cam
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="128" fill="#ff9800"/><path fill="#263238" d="M176 240c16 0 32 16 32 32M304 272c0-16 16-32 32-32M208 320c16 16 32 16 48 0 16 16 32 16 48 0"/><circle cx="200" cy="256" r="24" fill="#fff"/><circle cx="312" cy="256" r="24" fill="#fff"/><circle cx="208" cy="264" r="12" fill="#263238"/><circle cx="320" cy="264" r="12" fill="#263238"/><ellipse cx="256" cy="320" rx="24" ry="16" fill="#ffccbc"/><path fill="#263238" d="M232 184l-16-48 32 24zm48 0l16-48-32 24z"/><path fill="#ff9800" d="M160 208l-32-64 48 32v32zm192 0l32-64-48 32v32z"/></svg>`,
  
  // 41. Voi xám xanh
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="128" fill="#546e7a"/><ellipse cx="160" cy="288" rx="48" ry="64" fill="#546e7a"/><ellipse cx="352" cy="288" rx="48" ry="64" fill="#546e7a"/><path fill="#546e7a" d="M256 320v96c0 17.7-14.3 32-32 32h-16c-8.8 0-16-7.2-16-16v-48l64-64z"/><circle cx="200" cy="256" r="20" fill="#263238"/><circle cx="312" cy="256" r="20" fill="#263238"/><ellipse cx="256" cy="350" rx="24" ry="16" fill="#78909c"/></svg>`,
  
  // 42. Tê giác xám
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="304" rx="144" ry="112" fill="#757575"/><path fill="#616161" d="M256 176l-16 64h32z"/><path fill="#9e9e9e" d="M256 240l-8 32h16z"/><circle cx="192" cy="272" r="20" fill="#263238"/><circle cx="320" cy="272" r="20" fill="#263238"/><ellipse cx="176" cy="240" rx="32" ry="40" fill="#757575"/><ellipse cx="336" cy="240" rx="32" ry="40" fill="#757575"/></svg>`,
  
  // 43. Hải cẩu xanh biển
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="128" ry="80" fill="#37474f"/><circle cx="256" cy="240" r="96" fill="#37474f"/><circle cx="208" cy="224" r="24" fill="#263238"/><circle cx="304" cy="224" r="24" fill="#263238"/><circle cx="216" cy="216" r="8" fill="#fff"/><circle cx="312" cy="216" r="8" fill="#fff"/><ellipse cx="256" cy="280" rx="32" ry="20" fill="#455a64"/><circle cx="248" cy="276" r="6" fill="#263238"/><circle cx="264" cy="276" r="6" fill="#263238"/><path fill="#37474f" d="M144 320c-32 32-48 64-48 64l32 16 48-48zm224 0c32 32 48 64 48 64l-32 16-48-48z"/></svg>`,
  
  // 44. Cá ngựa tím
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#ab47bc" d="M256 128c-35.3 0-64 28.7-64 64v192c0 35.3 28.7 64 64 64s64-28.7 64-64V192c0-35.3-28.7-64-64-64z"/><circle cx="280" cy="192" r="16" fill="#263238"/><path fill="#ab47bc" d="M288 160c32-32 64-32 64-32l-16 48-32 16z"/><ellipse cx="272" cy="240" rx="24" ry="16" fill="#ce93d8"/><path fill="#7b1fa2" d="M232 256v32l24-16zm0 48v32l24-16zm0 48v32l24-16zm0 48v32l24-16z"/></svg>`,
  
  // 45. Ốc sên xanh lá
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="352" rx="128" ry="48" fill="#8bc34a"/><circle cx="256" cy="272" r="96" fill="#795548"/><circle cx="256" cy="272" r="64" fill="#8d6e63"/><circle cx="256" cy="272" r="32" fill="#a1887f"/><path fill="#8bc34a" d="M176 320c-32-16-48-48-48-48v-32l48 32v48z"/><circle cx="144" cy="232" r="16" fill="#263238"/><circle cx="128" cy="200" r="12" fill="#263238"/><path fill="#8bc34a" d="M112 232v-48l32 16v24zm16-48v-40l24 16v16z"/></svg>`,
  
  // 46. Kiến đỏ
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="352" rx="64" ry="48" fill="#d32f2f"/><ellipse cx="256" cy="272" rx="48" ry="40" fill="#d32f2f"/><circle cx="256" cy="200" r="48" fill="#d32f2f"/><circle cx="232" cy="192" r="12" fill="#263238"/><circle cx="280" cy="192" r="12" fill="#263238"/><path fill="#d32f2f" d="M224 160l-24-48 16-8 24 40zm64 0l24-48-16-8-24 40z"/><path fill="#b71c1c" d="M192 288l-48 64m176-64l48 64m-160-32l-48 48m144-48l48 48m-128-16l-32 48m112-48l32 48"/></svg>`,
  
  // 47. Nhím nâu cam
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="112" ry="80" fill="#8d6e63"/><path fill="#5d4037" d="M160 256l-16-64 32 32zm32-32l-8-72 24 40zm32-16l0-80 16 48zm32-8l8-80 8 48zm32 8l16-80 0 48zm32 16l24-72-8 40zm32 32l32-64-16 32z"/><ellipse cx="256" cy="352" rx="80" ry="48" fill="#ffccbc"/><circle cx="224" cy="320" r="16" fill="#263238"/><circle cx="288" cy="320" r="16" fill="#263238"/><ellipse cx="256" cy="352" rx="16" ry="12" fill="#5d4037"/></svg>`,
  
  // 48. Chuồn chuồn xanh
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="240" rx="48" ry="56" fill="#00bcd4"/><circle cx="232" cy="224" r="20" fill="#263238"/><circle cx="280" cy="224" r="20" fill="#263238"/><circle cx="240" cy="216" r="8" fill="#4dd0e1"/><circle cx="288" cy="216" r="8" fill="#4dd0e1"/><path fill="#00bcd4" d="M256 296v128l8-8v-112zm0 0v128l-8-8v-112z"/><ellipse cx="176" cy="272" rx="72" ry="24" fill="#4dd0e1" transform="rotate(-20 176 272)"/><ellipse cx="336" cy="272" rx="72" ry="24" fill="#4dd0e1" transform="rotate(20 336 272)"/><ellipse cx="160" cy="240" rx="64" ry="20" fill="#4dd0e1" transform="rotate(-30 160 240)"/><ellipse cx="352" cy="240" rx="64" ry="20" fill="#4dd0e1" transform="rotate(30 352 240)"/></svg>`,
  
  // 49. Chồn nâu vàng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="128" ry="80" fill="#8d6e63"/><ellipse cx="256" cy="280" rx="64" ry="48" fill="#8d6e63"/><circle cx="256" cy="240" r="80" fill="#8d6e63"/><path fill="#ffcc80" d="M256 208v112l-40 32v-80zm0 0v112l40 32v-80z"/><circle cx="216" cy="224" r="16" fill="#263238"/><circle cx="296" cy="224" r="16" fill="#263238"/><ellipse cx="256" cy="272" rx="12" ry="8" fill="#5d4037"/><path fill="#8d6e63" d="M192 176l-24-48 40 16v32zm128 0l24-48-40 16v32z"/></svg>`,
  
  // 50. Nai vàng nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="112" ry="96" fill="#d4a056"/><ellipse cx="256" cy="280" rx="72" ry="56" fill="#d4a056"/><circle cx="256" cy="224" r="80" fill="#d4a056"/><path fill="#8b6914" d="M176 176l-32-80 24 8 24 40zm0 0l-48-48 16-8 32 24zm160 0l32-80-24 8-24 40zm0 0l48-48-16-8-32 24z"/><circle cx="216" cy="216" r="20" fill="#263238"/><circle cx="296" cy="216" r="20" fill="#263238"/><ellipse cx="256" cy="272" rx="24" ry="16" fill="#8b6914"/><circle cx="216" cy="208" r="6" fill="#fff"/><circle cx="296" cy="208" r="6" fill="#fff"/></svg>`,
  
  // 51. Gấu Bắc Cực trắng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="128" fill="#eceff1"/><circle cx="176" cy="192" r="40" fill="#eceff1"/><circle cx="336" cy="192" r="40" fill="#eceff1"/><circle cx="208" cy="264" r="24" fill="#263238"/><circle cx="304" cy="264" r="24" fill="#263238"/><circle cx="216" cy="256" r="8" fill="#fff"/><circle cx="312" cy="256" r="8" fill="#fff"/><ellipse cx="256" cy="320" rx="32" ry="24" fill="#cfd8dc"/><ellipse cx="256" cy="312" rx="16" ry="12" fill="#263238"/></svg>`,
  
  // 52. Sò hồng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#f48fb1" d="M256 160c-88.4 0-160 71.6-160 160v32h320v-32c0-88.4-71.6-160-160-160z"/><path fill="#f8bbd9" d="M128 320l128-128 128 128zM160 320l96-96 96 96zM192 320l64-64 64 64z"/><ellipse cx="256" cy="352" rx="160" ry="32" fill="#ec407a"/><circle cx="256" cy="256" r="32" fill="#fff"/><circle cx="256" cy="256" r="16" fill="#f48fb1"/></svg>`,
  
  // 53. Bọ ngựa xanh
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="48" ry="80" fill="#66bb6a"/><ellipse cx="256" cy="208" rx="64" ry="48" fill="#66bb6a"/><circle cx="224" cy="200" r="24" fill="#263238"/><circle cx="288" cy="200" r="24" fill="#263238"/><circle cx="232" cy="192" r="8" fill="#a5d6a7"/><circle cx="296" cy="192" r="8" fill="#a5d6a7"/><path fill="#43a047" d="M192 240l-80 16 48-48 32 32v-32l-32-48 48 16zm128 0l80 16-48-48-32 32v-32l32-48-48 16z"/><path fill="#66bb6a" d="M208 160l-16-48 32 24zm96 0l16-48-32 24z"/></svg>`,
  
  // 54. Cá koi đỏ cam
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="288" rx="144" ry="80" fill="#ff5722"/><path fill="#fff" d="M176 272c0-26.5 35.8-48 80-48s80 21.5 80 48-35.8 48-80 48-80-21.5-80-48z"/><path fill="#ff5722" d="M200 256c16 16 48 16 64 0m-32 32c16 8 32 8 48 0"/><circle cx="320" cy="272" r="16" fill="#263238"/><path fill="#e64a19" d="M112 288l-48-48v96zm144-80l-48-48 32-16 48 48z"/><ellipse cx="144" cy="288" rx="32" ry="48" fill="#ffccbc"/></svg>`,
  
  // 55. Hải ly nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="112" ry="80" fill="#6d4c41"/><circle cx="256" cy="240" r="80" fill="#6d4c41"/><circle cx="216" cy="224" r="20" fill="#263238"/><circle cx="296" cy="224" r="20" fill="#263238"/><rect x="232" y="280" width="48" height="32" rx="8" fill="#fff"/><path fill="#263238" d="M248 280h16v32h-16z"/><ellipse cx="256" cy="264" rx="24" ry="16" fill="#5d4037"/><ellipse cx="320" cy="400" rx="48" ry="16" fill="#4e342e" transform="rotate(-20 320 400)"/></svg>`,
  
  // 56. Đà điểu nâu hồng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="352" rx="96" ry="64" fill="#8d6e63"/><ellipse cx="272" cy="260" rx="32" ry="80" fill="#ffab91"/><circle cx="280" cy="168" r="48" fill="#ffab91"/><circle cx="296" cy="160" r="16" fill="#263238"/><ellipse cx="312" cy="192" rx="32" ry="16" fill="#ff8a65"/><path fill="#5d4037" d="M192 384v48l-16 16 32-16v-48zm128 0v48l16 16-32-16v-48z"/></svg>`,
  
  // 57. Hồng hạc hồng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="288" rx="80" ry="96" fill="#f48fb1"/><path fill="#f48fb1" d="M256 192c0-53 24-96 24-96s24 43 24 96c0 17.7-10.7 32-24 32s-24-14.3-24-32z"/><circle cx="296" cy="144" r="32" fill="#f48fb1"/><circle cx="304" cy="136" r="12" fill="#263238"/><path fill="#263238" d="M296 160l24 16-24 8z"/><path fill="#f06292" d="M208 384v64l-8 16 24-16v-64zm96 0v64l8 16-24-16v-64z"/></svg>`,
  
  // 58. Toucan đen cam
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="304" rx="96" ry="112" fill="#263238"/><circle cx="256" cy="208" r="64" fill="#263238"/><circle cx="280" cy="192" r="20" fill="#fff"/><circle cx="288" cy="192" r="10" fill="#263238"/><path fill="#ff9800" d="M256 240l96-16c0 35.3-43 64-96 64z"/><path fill="#ffc107" d="M256 240l80-8c0 26.5-35.8 48-80 48z"/><path fill="#263238" d="M352 224l-16 32 8 16z"/><ellipse cx="200" cy="352" rx="24" ry="32" fill="#263238" transform="rotate(-20 200 352)"/><ellipse cx="312" cy="352" rx="24" ry="32" fill="#263238" transform="rotate(20 312 352)"/></svg>`,
  
  // 59. Cá hề cam trắng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="288" rx="128" ry="80" fill="#ff5722"/><path fill="#fff" d="M176 288v-48c0-8.8 7.2-16 16-16s16 7.2 16 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-48z"/><path fill="#fff" d="M256 288v-64c0-8.8 7.2-16 16-16s16 7.2 16 16v128c0 8.8-7.2 16-16 16s-16-7.2-16-16v-64z"/><path fill="#fff" d="M320 288v-48c0-8.8 7.2-16 16-16s16 7.2 16 16v96c0 8.8-7.2 16-16 16s-16-7.2-16-16v-48z"/><circle cx="184" cy="264" r="16" fill="#263238"/><path fill="#ff5722" d="M384 288l48-32v64z"/></svg>`,
  
  // 60. Kỳ nhông xanh lá
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="304" rx="128" ry="80" fill="#7cb342"/><circle cx="256" cy="224" r="72" fill="#7cb342"/><circle cx="200" cy="200" r="32" fill="#7cb342"/><circle cx="312" cy="200" r="32" fill="#7cb342"/><circle cx="200" cy="200" r="16" fill="#c5e1a5"/><circle cx="312" cy="200" r="16" fill="#c5e1a5"/><circle cx="200" cy="200" r="8" fill="#263238"/><circle cx="312" cy="200" r="8" fill="#263238"/><path fill="#689f38" d="M128 320l-48 32v-64zm384 0l48 32v-64z"/><ellipse cx="256" cy="280" rx="24" ry="8" fill="#558b2f"/></svg>`,
  
  // 61. Rồng xanh lục
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="112" ry="96" fill="#43a047"/><circle cx="256" cy="224" r="80" fill="#43a047"/><path fill="#2e7d32" d="M176 160l-16-48 32 16zm160 0l16-48-32 16zm-80-48l-24-64 24 32 24-32-24 64z"/><circle cx="208" cy="216" r="24" fill="#ffeb3b"/><circle cx="304" cy="216" r="24" fill="#ffeb3b"/><circle cx="216" cy="224" r="12" fill="#263238"/><circle cx="312" cy="224" r="12" fill="#263238"/><ellipse cx="256" cy="288" rx="32" ry="16" fill="#66bb6a"/><path fill="#388e3c" d="M224 288l-16 24h16zm64 0l16 24h-16z"/></svg>`,
  
  // 62. Phượng hoàng đỏ vàng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="96" ry="80" fill="#ff5722"/><circle cx="256" cy="224" r="72" fill="#ff5722"/><path fill="#ffc107" d="M256 128l-48-80 48 48 48-48z"/><path fill="#ff9800" d="M208 160l-32-48 48 24zm96 0l32-48-48 24z"/><circle cx="224" cy="216" r="16" fill="#263238"/><circle cx="288" cy="216" r="16" fill="#263238"/><path fill="#ffeb3b" d="M256 256l-24 32h48z"/><path fill="#e64a19" d="M160 400l-48 48 32-80zm192 0l48 48-32-80z"/></svg>`,
  
  // 63. Ngựa có cánh tím
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="336" rx="96" ry="72" fill="#ba68c8"/><ellipse cx="256" cy="240" rx="64" ry="80" fill="#ba68c8"/><path fill="#ba68c8" d="M200 176l-24-48 40 24v24zm112 0l24-48-40 24v24z"/><ellipse cx="144" cy="272" rx="64" ry="40" fill="#e1bee7" transform="rotate(-30 144 272)"/><ellipse cx="368" cy="272" rx="64" ry="40" fill="#e1bee7" transform="rotate(30 368 272)"/><circle cx="232" cy="208" r="16" fill="#263238"/><circle cx="280" cy="208" r="16" fill="#263238"/><ellipse cx="256" cy="264" rx="16" ry="12" fill="#9c27b0"/></svg>`,
  
  // 64. Sói xám
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="112" ry="88" fill="#607d8b"/><ellipse cx="256" cy="268" rx="56" ry="48" fill="#607d8b"/><circle cx="256" cy="224" r="80" fill="#607d8b"/><path fill="#607d8b" d="M176 176l-48-80 56 32v48zm160 0l48-80-56 32v48z"/><path fill="#cfd8dc" d="M256 256v128l-48 16v-96zm0 0v128l48 16v-96z"/><circle cx="216" cy="208" r="20" fill="#ffeb3b"/><circle cx="296" cy="208" r="20" fill="#ffeb3b"/><circle cx="216" cy="208" r="10" fill="#263238"/><circle cx="296" cy="208" r="10" fill="#263238"/><ellipse cx="256" cy="280" rx="16" ry="12" fill="#37474f"/></svg>`,
  
  // 65. Cáo tuyết trắng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="112" ry="88" fill="#eceff1"/><ellipse cx="256" cy="268" rx="56" ry="48" fill="#eceff1"/><circle cx="256" cy="224" r="80" fill="#eceff1"/><path fill="#eceff1" d="M176 176l-40-72 48 24v48zm160 0l40-72-48 24v48z"/><circle cx="216" cy="216" r="16" fill="#263238"/><circle cx="296" cy="216" r="16" fill="#263238"/><ellipse cx="256" cy="272" rx="20" ry="16" fill="#263238"/><path fill="#cfd8dc" d="M256 288l-32 32v48h64v-48z"/></svg>`,
  
  // 66. Mèo đen
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="104" ry="88" fill="#263238"/><circle cx="256" cy="232" r="80" fill="#263238"/><path fill="#263238" d="M176 192l-40-80 48 32v48zm160 0l40-80-48 32v48z"/><circle cx="216" cy="224" r="24" fill="#ffc107"/><circle cx="296" cy="224" r="24" fill="#ffc107"/><circle cx="216" cy="224" r="12" fill="#263238"/><circle cx="296" cy="224" r="12" fill="#263238"/><ellipse cx="256" cy="280" rx="12" ry="8" fill="#f48fb1"/></svg>`,
  
  // 67. Mèo tam thể
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="104" ry="88" fill="#fff"/><circle cx="256" cy="232" r="80" fill="#fff"/><path fill="#ff9800" d="M176 232c0-44.2 35.8-80 80-80v80z"/><path fill="#263238" d="M336 232c0-44.2-35.8-80-80-80v80z"/><ellipse cx="280" cy="352" rx="48" ry="32" fill="#ff9800"/><ellipse cx="224" cy="352" rx="32" ry="24" fill="#263238"/><path fill="#fff" d="M176 192l-40-80 48 32v48zm160 0l40-80-48 32v48z"/><circle cx="216" cy="224" r="20" fill="#4caf50"/><circle cx="296" cy="224" r="20" fill="#2196f3"/><circle cx="216" cy="224" r="10" fill="#263238"/><circle cx="296" cy="224" r="10" fill="#263238"/><ellipse cx="256" cy="272" rx="10" ry="8" fill="#f48fb1"/></svg>`,
  
  // 68. Gấu trúc đỏ
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="104" ry="80" fill="#d84315"/><circle cx="256" cy="240" r="80" fill="#d84315"/><circle cx="176" cy="192" r="32" fill="#d84315"/><circle cx="336" cy="192" r="32" fill="#d84315"/><ellipse cx="256" cy="288" rx="56" ry="40" fill="#fff"/><circle cx="224" cy="232" r="20" fill="#263238"/><circle cx="288" cy="232" r="20" fill="#263238"/><circle cx="232" cy="224" r="8" fill="#fff"/><circle cx="296" cy="224" r="8" fill="#fff"/><ellipse cx="256" cy="280" rx="16" ry="12" fill="#263238"/><path fill="#bf360c" d="M200 304l24 24-24 24zm112 0l-24 24 24 24z"/></svg>`,
  
  // 69. Vượn vàng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="120" fill="#ffa726"/><ellipse cx="256" cy="320" rx="72" ry="56" fill="#ffe0b2"/><circle cx="200" cy="256" r="20" fill="#263238"/><circle cx="312" cy="256" r="20" fill="#263238"/><ellipse cx="256" cy="320" rx="24" ry="20" fill="#ffa726"/><circle cx="144" cy="288" r="40" fill="#ffe0b2"/><circle cx="368" cy="288" r="40" fill="#ffe0b2"/><path fill="#ffa726" d="M160 400l-48 48 16-64zm192 0l48 48-16-64z"/></svg>`,
  
  // 70. Khỉ đột đen
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="304" r="128" fill="#37474f"/><ellipse cx="256" cy="336" rx="80" ry="56" fill="#455a64"/><circle cx="200" cy="272" r="24" fill="#263238"/><circle cx="312" cy="272" r="24" fill="#263238"/><circle cx="208" cy="264" r="8" fill="#fff"/><circle cx="320" cy="264" r="8" fill="#fff"/><ellipse cx="256" cy="352" rx="32" ry="24" fill="#37474f"/><circle cx="248" cy="352" r="8" fill="#263238"/><circle cx="264" cy="352" r="8" fill="#263238"/><path fill="#455a64" d="M256 176l-32-48 32 16 32-16z"/></svg>`,
  
  // 71. Báo đốm vàng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="120" ry="88" fill="#ffc107"/><circle cx="256" cy="224" r="80" fill="#ffc107"/><circle cx="200" cy="288" r="16" fill="#ff8f00"/><circle cx="312" cy="288" r="16" fill="#ff8f00"/><circle cx="256" cy="352" r="12" fill="#ff8f00"/><circle cx="200" cy="352" r="10" fill="#ff8f00"/><circle cx="312" cy="352" r="10" fill="#ff8f00"/><path fill="#ffc107" d="M176 176l-32-64 48 32v32zm160 0l32-64-48 32v32z"/><circle cx="216" cy="216" r="20" fill="#263238"/><circle cx="296" cy="216" r="20" fill="#263238"/><circle cx="224" cy="208" r="6" fill="#fff"/><circle cx="304" cy="208" r="6" fill="#fff"/><ellipse cx="256" cy="264" rx="16" ry="12" fill="#5d4037"/></svg>`,
  
  // 72. Hổ trắng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="128" fill="#eceff1"/><path fill="#90a4ae" d="M176 240c16 0 32 16 32 32M304 272c0-16 16-32 32-32M208 320c16 16 32 16 48 0 16 16 32 16 48 0"/><circle cx="200" cy="256" r="24" fill="#90caf9"/><circle cx="312" cy="256" r="24" fill="#90caf9"/><circle cx="208" cy="264" r="12" fill="#263238"/><circle cx="320" cy="264" r="12" fill="#263238"/><ellipse cx="256" cy="320" rx="24" ry="16" fill="#ffcdd2"/><path fill="#90a4ae" d="M232 184l-16-48 32 24zm48 0l16-48-32 24z"/><path fill="#eceff1" d="M160 208l-32-64 48 32v32zm192 0l32-64-48 32v32z"/></svg>`,
  
  // 73. Sư tử biển nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="128" ry="80" fill="#795548"/><circle cx="256" cy="224" r="96" fill="#795548"/><circle cx="200" cy="208" r="24" fill="#263238"/><circle cx="312" cy="208" r="24" fill="#263238"/><circle cx="208" cy="200" r="8" fill="#fff"/><circle cx="320" cy="200" r="8" fill="#fff"/><ellipse cx="256" cy="272" rx="48" ry="32" fill="#a1887f"/><circle cx="240" cy="272" r="8" fill="#263238"/><circle cx="272" cy="272" r="8" fill="#263238"/><path fill="#5d4037" d="M240 304l16 32 16-32z"/><path fill="#795548" d="M144 352l-48 64 32-16 32-48zm224 0l48 64-32-16-32-48z"/></svg>`,
  
  // 74. Rái cá nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="112" ry="80" fill="#6d4c41"/><circle cx="256" cy="240" r="80" fill="#6d4c41"/><ellipse cx="256" cy="304" rx="64" ry="40" fill="#a1887f"/><circle cx="216" cy="224" r="20" fill="#263238"/><circle cx="296" cy="224" r="20" fill="#263238"/><circle cx="224" cy="216" r="6" fill="#fff"/><circle cx="304" cy="216" r="6" fill="#fff"/><ellipse cx="256" cy="280" rx="24" ry="16" fill="#4e342e"/><path fill="#6d4c41" d="M168 192l-24-40 40 16v24zm176 0l24-40-40 16v24z"/><ellipse cx="352" cy="384" rx="40" ry="16" fill="#5d4037" transform="rotate(-30 352 384)"/></svg>`,
  
  // 75. Hải âu xám trắng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="96" ry="72" fill="#fff"/><circle cx="256" cy="224" r="64" fill="#fff"/><ellipse cx="160" cy="288" rx="72" ry="24" fill="#90a4ae" transform="rotate(-20 160 288)"/><ellipse cx="352" cy="288" rx="72" ry="24" fill="#90a4ae" transform="rotate(20 352 288)"/><circle cx="232" cy="216" r="12" fill="#263238"/><circle cx="280" cy="216" r="12" fill="#263238"/><path fill="#ffc107" d="M256 240l-16 24h32z"/></svg>`,
  
  // 76. Vẹt xanh đỏ
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="80" ry="96" fill="#43a047"/><circle cx="256" cy="208" r="72" fill="#e53935"/><ellipse cx="160" cy="304" rx="48" ry="24" fill="#2196f3" transform="rotate(-30 160 304)"/><ellipse cx="352" cy="304" rx="48" ry="24" fill="#ffc107" transform="rotate(30 352 304)"/><circle cx="224" cy="200" r="20" fill="#fff"/><circle cx="288" cy="200" r="20" fill="#fff"/><circle cx="232" cy="200" r="10" fill="#263238"/><circle cx="296" cy="200" r="10" fill="#263238"/><path fill="#37474f" d="M256 240l-24 40 24-8 24 8z"/></svg>`,
  
  // 77. Chim sẻ nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="80" ry="72" fill="#8d6e63"/><circle cx="256" cy="224" r="64" fill="#8d6e63"/><ellipse cx="256" cy="352" rx="48" ry="32" fill="#d7ccc8"/><ellipse cx="168" cy="288" rx="48" ry="20" fill="#6d4c41" transform="rotate(-20 168 288)"/><ellipse cx="344" cy="288" rx="48" ry="20" fill="#6d4c41" transform="rotate(20 344 288)"/><circle cx="232" cy="216" r="12" fill="#263238"/><circle cx="280" cy="216" r="12" fill="#263238"/><path fill="#ff9800" d="M256 240l-12 20h24z"/></svg>`,
  
  // 78. Chim ruồi xanh tím
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="288" rx="48" ry="64" fill="#00bcd4"/><circle cx="256" cy="200" r="48" fill="#7c4dff"/><ellipse cx="176" cy="256" rx="56" ry="16" fill="#b2ebf2" transform="rotate(-30 176 256)"/><ellipse cx="336" cy="256" rx="56" ry="16" fill="#b2ebf2" transform="rotate(30 336 256)"/><circle cx="240" cy="192" r="10" fill="#263238"/><circle cx="272" cy="192" r="10" fill="#263238"/><path fill="#263238" d="M256 216l-32 48h8l24-32z"/></svg>`,
  
  // 79. Quạ đen tím
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="96" ry="88" fill="#263238"/><circle cx="256" cy="216" r="72" fill="#37474f"/><ellipse cx="168" cy="288" rx="64" ry="24" fill="#263238" transform="rotate(-15 168 288)"/><ellipse cx="344" cy="288" rx="64" ry="24" fill="#263238" transform="rotate(15 344 288)"/><circle cx="224" cy="208" r="16" fill="#7c4dff"/><circle cx="288" cy="208" r="16" fill="#7c4dff"/><circle cx="224" cy="208" r="8" fill="#263238"/><circle cx="288" cy="208" r="8" fill="#263238"/><path fill="#37474f" d="M256 240l-24 48 24-16 24 16z"/></svg>`,
  
  // 80. Đại bàng nâu vàng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="104" ry="88" fill="#5d4037"/><circle cx="256" cy="216" r="80" fill="#6d4c41"/><ellipse cx="152" cy="288" rx="80" ry="28" fill="#4e342e" transform="rotate(-15 152 288)"/><ellipse cx="360" cy="288" rx="80" ry="28" fill="#4e342e" transform="rotate(15 360 288)"/><circle cx="216" cy="208" r="20" fill="#ffc107"/><circle cx="296" cy="208" r="20" fill="#ffc107"/><circle cx="216" cy="208" r="10" fill="#263238"/><circle cx="296" cy="208" r="10" fill="#263238"/><path fill="#ff9800" d="M256 240l-20 40 20-16 20 16z"/><path fill="#fff" d="M256 160l-16-32 16 16 16-16z"/></svg>`,
  
  // 81. Cá voi xanh dương
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="304" rx="160" ry="96" fill="#1976d2"/><ellipse cx="256" cy="336" rx="120" ry="56" fill="#bbdefb"/><circle cx="168" cy="272" r="20" fill="#263238"/><circle cx="176" cy="264" r="6" fill="#fff"/><path fill="#1976d2" d="M416 272l64-48v96z"/><ellipse cx="136" cy="368" rx="32" ry="16" fill="#1565c0" transform="rotate(-30 136 368)"/><ellipse cx="200" cy="384" rx="24" ry="12" fill="#1565c0" transform="rotate(-20 200 384)"/><path fill="#64b5f6" d="M256 208l-16-48 16 16 16-16z"/></svg>`,
  
  // 82. Cá mập búa xám
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="128" ry="80" fill="#546e7a"/><path fill="#546e7a" d="M128 256h256v32H128z"/><circle cx="128" cy="272" r="40" fill="#546e7a"/><circle cx="384" cy="272" r="40" fill="#546e7a"/><circle cx="112" cy="264" r="16" fill="#263238"/><circle cx="400" cy="264" r="16" fill="#263238"/><ellipse cx="256" cy="344" rx="80" ry="40" fill="#90a4ae"/><path fill="#455a64" d="M256 240l40-80-40 48-40-48z"/><path fill="#546e7a" d="M384 320l48-24v48z"/></svg>`,
  
  // 83. Cá đuối manta xanh
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="288" rx="176" ry="80" fill="#00695c"/><ellipse cx="256" cy="320" rx="96" ry="48" fill="#e0f2f1"/><path fill="#00695c" d="M80 288l-48 96 80-64zm352 0l48 96-80-64z"/><circle cx="208" cy="272" r="16" fill="#263238"/><circle cx="304" cy="272" r="16" fill="#263238"/><path fill="#00695c" d="M256 368v80l-16-24 16-8 16 8-16 24z"/><ellipse cx="256" cy="304" rx="24" ry="16" fill="#00695c"/></svg>`,
  
  // 84. Bướm đêm tím
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="24" ry="72" fill="#4a148c"/><circle cx="256" cy="224" r="32" fill="#4a148c"/><circle cx="248" cy="216" r="8" fill="#fff"/><circle cx="264" cy="216" r="8" fill="#fff"/><ellipse cx="160" cy="272" rx="88" ry="64" fill="#7b1fa2"/><ellipse cx="352" cy="272" rx="88" ry="64" fill="#7b1fa2"/><ellipse cx="160" cy="272" rx="56" ry="40" fill="#9c27b0"/><ellipse cx="352" cy="272" rx="56" ry="40" fill="#9c27b0"/><circle cx="160" cy="272" r="24" fill="#e1bee7"/><circle cx="352" cy="272" r="24" fill="#e1bee7"/><path fill="#4a148c" d="M240 192c-16-24-32-32-32-32m48 32c16-24 32-32 32-32"/></svg>`,
  
  // 85. Bọ hung nâu đỏ
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="112" ry="80" fill="#5d4037"/><path fill="#4e342e" d="M256 240v160M144 304c48 0 80 32 112 32s64-32 112-32"/><ellipse cx="192" cy="320" rx="40" ry="56" fill="#6d4c41"/><ellipse cx="320" cy="320" rx="40" ry="56" fill="#6d4c41"/><circle cx="256" cy="224" r="56" fill="#5d4037"/><circle cx="232" cy="216" r="12" fill="#263238"/><circle cx="280" cy="216" r="12" fill="#263238"/><path fill="#3e2723" d="M224 168l-32-48 40 24zm64 0l32-48-40 24z"/></svg>`,
  
  // 86. Dế mèn xanh
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="336" rx="80" ry="64" fill="#2e7d32"/><ellipse cx="256" cy="256" rx="56" ry="48" fill="#388e3c"/><circle cx="256" cy="192" r="48" fill="#43a047"/><circle cx="232" cy="184" r="16" fill="#263238"/><circle cx="280" cy="184" r="16" fill="#263238"/><path fill="#1b5e20" d="M208 152l-24-56 32 32zm96 0l24-56-32 32z"/><path fill="#2e7d32" d="M176 288l-64 96 32-48zm160 0l64 96-32-48z"/><ellipse cx="176" cy="304" rx="48" ry="24" fill="#66bb6a" transform="rotate(-30 176 304)"/><ellipse cx="336" cy="304" rx="48" ry="24" fill="#66bb6a" transform="rotate(30 336 304)"/></svg>`,
  
  // 87. Sâu bướm xanh
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="192" cy="320" r="48" fill="#4caf50"/><circle cx="256" cy="336" r="48" fill="#66bb6a"/><circle cx="320" cy="320" r="48" fill="#81c784"/><circle cx="368" cy="288" r="40" fill="#a5d6a7"/><circle cx="144" cy="288" r="56" fill="#388e3c"/><circle cx="120" cy="272" r="16" fill="#263238"/><circle cx="168" cy="272" r="16" fill="#263238"/><path fill="#2e7d32" d="M112 232l-24-40 32 16zm56 0l24-40-32 16z"/><ellipse cx="144" cy="320" rx="24" ry="8" fill="#c8e6c9"/></svg>`,
  
  // 88. Sao biển cam
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#ff7043" d="M256 128l24 80 80-24-56 56 56 56-80-24-24 80-24-80-80 24 56-56-56-56 80 24z"/><circle cx="256" cy="280" r="48" fill="#ffab91"/><circle cx="240" cy="272" r="12" fill="#263238"/><circle cx="272" cy="272" r="12" fill="#263238"/><ellipse cx="256" cy="304" rx="16" ry="8" fill="#e64a19"/></svg>`,
  
  // 89. Cua hoàng đế đỏ
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="128" ry="80" fill="#c62828"/><circle cx="208" cy="288" r="24" fill="#263238"/><circle cx="304" cy="288" r="24" fill="#263238"/><circle cx="216" cy="280" r="8" fill="#fff"/><circle cx="312" cy="280" r="8" fill="#fff"/><path fill="#b71c1c" d="M128 288l-64-32 32-32 48 32zm256 0l64-32-32-32-48 32z"/><path fill="#c62828" d="M96 304l-48 48 32 16 32-48zm320 0l48 48-32 16-32-48z"/><ellipse cx="176" cy="224" rx="24" ry="40" fill="#c62828"/><ellipse cx="336" cy="224" rx="24" ry="40" fill="#c62828"/><circle cx="176" cy="192" r="16" fill="#ef5350"/><circle cx="336" cy="192" r="16" fill="#ef5350"/></svg>`,
  
  // 90. Tôm hồng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#ec407a" d="M256 160c-53 0-96 43-96 96v96c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48v-96c0-53-43-96-96-96z"/><path fill="#f48fb1" d="M192 256c0-35.3 28.7-64 64-64s64 28.7 64 64v80h-128v-80z"/><circle cx="224" cy="256" r="16" fill="#263238"/><circle cx="288" cy="256" r="16" fill="#263238"/><path fill="#ad1457" d="M176 208l-48-48 24-24 48 48zm160 0l48-48-24-24-48 48z"/><path fill="#ec407a" d="M208 400l-16 48 32-16zm96 0l16 48-32-16z"/></svg>`,
  
  // 91. Mực ống hồng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill="#f06292" d="M256 128c-53 0-96 43-96 96v64h192v-64c0-53-43-96-96-96z"/><circle cx="216" cy="208" r="24" fill="#fff"/><circle cx="296" cy="208" r="24" fill="#fff"/><circle cx="224" cy="216" r="12" fill="#263238"/><circle cx="304" cy="216" r="12" fill="#263238"/><path fill="#ec407a" d="M160 288l-16 128 32-96zm32 0l8 144 16-112zm32 0v144l8-112zm32 0v144l-8-112zm32 0l-8 144-16-112zm32 0l16 128-32-96z"/><path fill="#f06292" d="M176 160l-32-48 40 24zm160 0l32-48-40 24z"/></svg>`,
  
  // 92. Cá nóc vàng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="288" r="128" fill="#ffc107"/><circle cx="200" cy="256" r="24" fill="#fff"/><circle cx="312" cy="256" r="24" fill="#fff"/><circle cx="208" cy="264" r="12" fill="#263238"/><circle cx="320" cy="264" r="12" fill="#263238"/><ellipse cx="256" cy="336" rx="48" ry="32" fill="#fff3e0"/><path fill="#ff8f00" d="M256 160l-16-48 16 24 16-24zm-80 48l-48-24 32 32zm160 0l48-24-32 32z"/><ellipse cx="152" cy="320" rx="24" ry="40" fill="#ffca28" transform="rotate(-20 152 320)"/><ellipse cx="360" cy="320" rx="24" ry="40" fill="#ffca28" transform="rotate(20 360 320)"/></svg>`,
  
  // 93. Cá kiếm xanh bạc
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="288" cy="288" rx="128" ry="64" fill="#0097a7"/><path fill="#b2ebf2" d="M208 288c0-26.5 35.8-48 80-48s80 21.5 80 48-35.8 48-80 48-80-21.5-80-48z"/><circle cx="336" cy="272" r="16" fill="#263238"/><path fill="#00838f" d="M160 288l-96-16v32z"/><path fill="#0097a7" d="M416 256l48-32v32zm0 64l48 32v-32z"/><ellipse cx="224" cy="320" rx="32" ry="16" fill="#4dd0e1"/><ellipse cx="288" cy="344" rx="24" ry="12" fill="#4dd0e1"/></svg>`,
  
  // 94. Ngựa nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="336" rx="96" ry="72" fill="#8d6e63"/><ellipse cx="272" cy="260" rx="48" ry="76" fill="#8d6e63"/><circle cx="280" cy="176" r="56" fill="#8d6e63"/><ellipse cx="248" cy="220" rx="12" ry="72" fill="#5d4037"/><circle cx="288" cy="168" r="16" fill="#263238"/><ellipse cx="304" cy="200" rx="24" ry="16" fill="#6d4c41"/><path fill="#5d4037" d="M256 96l32-48v32zm0 0l-32-48v32z"/><path fill="#4e342e" d="M192 384l-16 64 32-32zm128 0l16 64-32-32z"/></svg>`,
  
  // 95. Hươu cao cổ vàng cam
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="360" rx="80" ry="56" fill="#f5a623"/><ellipse cx="288" cy="240" rx="36" ry="120" fill="#f5a623"/><circle cx="300" cy="112" r="48" fill="#f5a623"/><circle cx="280" cy="80" r="6" fill="#8b4513"/><circle cx="320" cy="80" r="6" fill="#8b4513"/><circle cx="312" cy="104" r="14" fill="#263238"/><ellipse cx="324" cy="136" rx="20" ry="12" fill="#d4893a"/><circle cx="288" cy="180" r="12" fill="#8b4513"/><circle cx="272" cy="240" r="10" fill="#8b4513"/><circle cx="304" cy="280" r="14" fill="#8b4513"/><circle cx="268" cy="320" r="10" fill="#8b4513"/><circle cx="240" cy="360" r="12" fill="#8b4513"/><circle cx="280" cy="380" r="8" fill="#8b4513"/><path fill="#d4893a" d="M184 384l-12 64 28-32zm144 0l12 64-28-32z"/></svg>`,
  
  // 96. Dê trắng
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="104" ry="80" fill="#fff"/><circle cx="256" cy="224" r="72" fill="#fff"/><path fill="#bdbdbd" d="M184 176l-48-80 40 32v48zm144 0l48-80-40 32v48z"/><circle cx="216" cy="216" r="16" fill="#263238"/><circle cx="296" cy="216" r="16" fill="#263238"/><ellipse cx="256" cy="272" rx="24" ry="16" fill="#ffccbc"/><path fill="#e0e0e0" d="M240 128l-16-48 24 24zm32 0l16-48-24 24z"/><ellipse cx="256" cy="360" rx="40" ry="24" fill="#f5f5f5"/></svg>`,
  
  // 97. Chuột túi nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="336" rx="96" ry="80" fill="#8d6e63"/><ellipse cx="256" cy="284" rx="56" ry="52" fill="#8d6e63"/><circle cx="256" cy="232" r="72" fill="#8d6e63"/><ellipse cx="256" cy="368" rx="48" ry="40" fill="#d7ccc8"/><circle cx="224" cy="224" r="16" fill="#263238"/><circle cx="288" cy="224" r="16" fill="#263238"/><ellipse cx="256" cy="272" rx="20" ry="12" fill="#5d4037"/><ellipse cx="184" cy="192" rx="32" ry="48" fill="#8d6e63"/><ellipse cx="328" cy="192" rx="32" ry="48" fill="#8d6e63"/><ellipse cx="184" cy="192" rx="20" ry="32" fill="#d7ccc8"/><ellipse cx="328" cy="192" rx="20" ry="32" fill="#d7ccc8"/></svg>`,
  
  // 98. Gấu koala xám xanh
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="304" r="112" fill="#607d8b"/><circle cx="160" cy="224" r="56" fill="#607d8b"/><circle cx="352" cy="224" r="56" fill="#607d8b"/><circle cx="160" cy="224" r="36" fill="#455a64"/><circle cx="352" cy="224" r="36" fill="#455a64"/><ellipse cx="256" cy="336" rx="56" ry="48" fill="#cfd8dc"/><circle cx="216" cy="288" r="16" fill="#263238"/><circle cx="296" cy="288" r="16" fill="#263238"/><ellipse cx="256" cy="336" rx="28" ry="20" fill="#37474f"/></svg>`,
  
  // 99. Thú mỏ vịt nâu cam
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="320" rx="128" ry="72" fill="#6d4c41"/><ellipse cx="256" cy="272" rx="64" ry="48" fill="#6d4c41"/><circle cx="256" cy="232" r="80" fill="#6d4c41"/><circle cx="216" cy="216" r="20" fill="#263238"/><circle cx="296" cy="216" r="20" fill="#263238"/><circle cx="224" cy="208" r="6" fill="#fff"/><circle cx="304" cy="208" r="6" fill="#fff"/><ellipse cx="256" cy="288" rx="64" ry="24" fill="#ff9800"/><ellipse cx="256" cy="280" rx="48" ry="16" fill="#ffb74d"/><ellipse cx="320" cy="376" rx="40" ry="24" fill="#5d4037" transform="rotate(-30 320 376)"/></svg>`,
  
  // 100. Lạc đà vàng nâu
  `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="336" rx="112" ry="72" fill="#d4a056"/><ellipse cx="280" cy="256" rx="40" ry="80" fill="#d4a056"/><circle cx="296" cy="168" r="56" fill="#d4a056"/><circle cx="304" cy="160" r="16" fill="#263238"/><ellipse cx="320" cy="192" rx="24" ry="20" fill="#c49a4b"/><path fill="#a67c00" d="M200 272c0-26.5 21.5-48 48-48v48zm16 0c0-17.7 14.3-32 32-32v32z"/><path fill="#8d6914" d="M184 384l-24 64 40-32zm144 0l24 64-40-32z"/><ellipse cx="256" cy="376" rx="48" ry="24" fill="#e6c47a"/></svg>`
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

// 30 gradient backgrounds đa dạng - đảm bảo tương phản tốt với avatar
const BG_GRADIENTS = [
  // Pastel tones
  'from-purple-200 to-pink-200',
  'from-blue-200 to-cyan-200',
  'from-green-200 to-emerald-200',
  'from-yellow-200 to-orange-200',
  'from-pink-200 to-rose-200',
  'from-indigo-200 to-purple-200',
  'from-teal-200 to-green-200',
  'from-amber-200 to-yellow-200',
  'from-red-200 to-pink-200',
  'from-cyan-200 to-blue-200',
  
  // Soft neon tones
  'from-fuchsia-200 to-violet-200',
  'from-lime-200 to-teal-200',
  'from-sky-200 to-indigo-200',
  'from-rose-200 to-orange-200',
  'from-emerald-200 to-cyan-200',
  
  // Warm earth tones
  'from-amber-100 to-orange-200',
  'from-yellow-100 to-amber-200',
  'from-orange-100 to-red-200',
  'from-stone-200 to-amber-200',
  'from-neutral-200 to-stone-300',
  
  // Cool jewel tones
  'from-violet-200 to-indigo-300',
  'from-blue-200 to-violet-200',
  'from-teal-200 to-cyan-300',
  'from-cyan-200 to-sky-200',
  'from-indigo-200 to-blue-200',
  
  // Unique combinations
  'from-pink-100 to-purple-200',
  'from-green-100 to-lime-200',
  'from-sky-100 to-blue-200',
  'from-rose-100 to-pink-200',
  'from-amber-200 to-rose-200'
];

// Màu chính của mỗi avatar (để tránh trùng với background)
const AVATAR_PRIMARY_COLORS = [
  'green', 'orange', 'brown', 'purple', 'blue', 'yellow', 'green', 'red', 'orange', 'white', // 1-10
  'white', 'white', 'orange', 'blue', 'yellow', 'gray', 'brown', 'pink', 'orange', 'brown', // 11-20
  'brown', 'gray', 'brown', 'black', 'gray', 'gray', 'white', 'pink', 'green', 'purple', // 21-30
  'blue', 'green', 'pink', 'yellow', 'orange', 'red', 'gray', 'yellow', 'purple', 'orange', // 31-40
  'gray', 'gray', 'gray', 'purple', 'green', 'red', 'brown', 'cyan', 'brown', 'brown', // 41-50
  'white', 'pink', 'green', 'orange', 'brown', 'pink', 'pink', 'black', 'orange', 'green', // 51-60
  'green', 'red', 'purple', 'gray', 'white', 'black', 'white', 'red', 'yellow', 'gray', // 61-70
  'yellow', 'white', 'brown', 'brown', 'white', 'green', 'brown', 'cyan', 'black', 'brown', // 71-80
  'blue', 'gray', 'teal', 'purple', 'brown', 'green', 'green', 'orange', 'red', 'pink', // 81-90
  'pink', 'yellow', 'teal', 'brown', 'gray', 'white', 'brown', 'gray', 'brown', 'brown' // 91-100
];

// Chọn background tương phản với avatar
function getBgGradient(seed, avatarIndex) {
  const avatarColor = AVATAR_PRIMARY_COLORS[avatarIndex] || 'gray';
  
  // Lọc các gradient tương phản tốt với màu avatar
  const contrastingGradients = BG_GRADIENTS.filter((gradient, idx) => {
    // Tránh nền cùng tone màu với avatar
    if (avatarColor === 'green' && (gradient.includes('green') || gradient.includes('emerald') || gradient.includes('lime'))) return false;
    if (avatarColor === 'blue' && (gradient.includes('blue') || gradient.includes('sky') || gradient.includes('cyan'))) return false;
    if (avatarColor === 'red' && (gradient.includes('red') || gradient.includes('rose'))) return false;
    if (avatarColor === 'orange' && (gradient.includes('orange') || gradient.includes('amber'))) return false;
    if (avatarColor === 'yellow' && (gradient.includes('yellow') || gradient.includes('amber'))) return false;
    if (avatarColor === 'purple' && (gradient.includes('purple') || gradient.includes('violet') || gradient.includes('fuchsia'))) return false;
    if (avatarColor === 'pink' && (gradient.includes('pink') || gradient.includes('rose') || gradient.includes('fuchsia'))) return false;
    if (avatarColor === 'brown' && (gradient.includes('amber') || gradient.includes('orange') || gradient.includes('stone'))) return false;
    if (avatarColor === 'gray' && (gradient.includes('neutral') || gradient.includes('stone'))) return false;
    if (avatarColor === 'white' && (gradient.includes('neutral') || gradient.includes('stone'))) return false;
    if (avatarColor === 'black' && (gradient.includes('indigo') || gradient.includes('violet'))) return false;
    if (avatarColor === 'teal' && (gradient.includes('teal') || gradient.includes('cyan'))) return false;
    if (avatarColor === 'cyan' && (gradient.includes('cyan') || gradient.includes('teal') || gradient.includes('sky'))) return false;
    return true;
  });
  
  // Sử dụng hash để chọn gradient từ danh sách đã lọc
  const hash = simpleHash((seed || 'default') + '_bg');
  const gradientList = contrastingGradients.length > 0 ? contrastingGradients : BG_GRADIENTS;
  return gradientList[hash % gradientList.length];
}

export default function MonsterAvatar({ 
  seed, // userId hoặc email để tạo avatar cố định
  avatarIndex: forcedAvatarIndex = null, // Cho phép chọn avatar trực tiếp bằng index
  size = 40, 
  className = '',
  showBorder = true
}) {
  // Nếu có avatarIndex được truyền vào, sử dụng nó, nếu không thì hash từ seed
  const avatarIndex = forcedAvatarIndex !== null && forcedAvatarIndex >= 0 && forcedAvatarIndex < CUTE_ANIMALS.length
    ? forcedAvatarIndex 
    : getAvatarIndex(seed);
  const svgContent = CUTE_ANIMALS[avatarIndex];
  const bgGradient = getBgGradient(seed || `avatar_${avatarIndex}`, avatarIndex);
  
  const borderClass = showBorder ? 'border-2 border-white shadow-md' : '';
  
  // Tạo data URI từ SVG
  const svgBase64 = typeof window !== 'undefined' 
    ? btoa(unescape(encodeURIComponent(svgContent)))
    : Buffer.from(svgContent).toString('base64');
  const dataUri = `data:image/svg+xml;base64,${svgBase64}`;
  
  return (
    <div 
      className={`rounded-full overflow-hidden bg-gradient-to-br ${bgGradient} ${borderClass} ${className} flex items-center justify-center`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUri}
        alt="Avatar"
        width={size}
        height={size}
        className="w-[85%] h-[85%] object-contain"
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
