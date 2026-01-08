'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import ToolLayout from '@/components/ToolLayout/ToolLayout';
import { LogoIcon } from '@/components/Logo/Logo';

// Các loài vật có thể đua - emoji hướng đầu về đích (phải)
// flipX: true = cần lật ngang để quay đầu sang phải
const ANIMAL_TYPES = {
  duck: {
    emoji: '🦆',
    name: 'Vịt',
    sound: 'Quạc quạc!',
    goSound: 'QUÁC!', // Tiếng kêu khi xuất phát
    action: 'bơi',
    habitat: 'sông',
    plural: 'vịt',
    flipX: true,
    moveVerb: 'bơi',
    speedBase: 1.0,
  },
  turtle: {
    emoji: '🐢',
    name: 'Rùa', 
    sound: 'Chậm mà chắc!',
    goSound: 'ỤP!',
    action: 'bò',
    habitat: 'sông',
    plural: 'rùa',
    flipX: true,
    moveVerb: 'bò',
    speedBase: 1.0,
  },
  crab: {
    emoji: '🦀',
    name: 'Cua',
    sound: 'Kẹp kẹp!',
    goSound: 'KẸP!',
    action: 'bò ngang',
    habitat: 'biển',
    plural: 'cua',
    flipX: false,
    moveVerb: 'bò',
    speedBase: 1.0,
  },
  fish: {
    emoji: '🐡',
    name: 'Cá nóc',
    sound: 'Phù phù!',
    goSound: 'PHÙ!',
    action: 'bơi',
    habitat: 'biển',
    plural: 'cá nóc',
    flipX: true,
    moveVerb: 'bơi',
    speedBase: 1.0,
  },
  snail: {
    emoji: '🐌',
    name: 'Ốc sên',
    sound: 'Từ từ thôi...',
    goSound: 'RÙ!',
    action: 'trườn',
    habitat: 'đường',
    plural: 'ốc',
    flipX: true,
    moveVerb: 'trườn',
    speedBase: 1.0,
  },
};

// Helper function để render animal (component hoặc emoji)
const renderAnimal = (animalType, size = '1em') => {
  const animal = ANIMAL_TYPES[animalType];
  if (!animal) return null;
  if (animal.component) {
    const Comp = animal.component;
    return <Comp size={size} />;
  }
  return animal.emoji;
};

// Hàm tạo bình luận động theo loài vật - ĐA DẠNG KỸ THUẬT HÀI HƯỚC
const getCommentaries = (animalType) => {
  const animal = ANIMAL_TYPES[animalType];
  const animalName = animal.name.toLowerCase(); // Đổi tên để tránh trùng với placeholder {name}
  const plural = animal.plural;
  const action = animal.moveVerb;
  
  return {
    start: [
      // So sánh hài hước
      `🎙️ Xuất phát! Các ${plural} lao đi vun vút!`,
      `🎙️ Và họ đi! Nhanh như wifi nhà hàng xóm vậy!`,
      // Phóng đại
      `🎙️ BOOOM! Cuộc đua thế kỷ bắt đầu! Cả vũ trụ đang theo dõi!`,
      `🎙️ ${animal.sound} Xuất phát rồi! Trái đất rung chuyển!`,
      // Tự sự hài
      `🎙️ Tim tôi đập loạn rồi bà con ơi! Đua thôi nào!`,
      `🎙️ Tôi hồi hộp quá! Các ${plural} ơi, đừng làm tôi thất vọng!`,
      // Câu hỏi tu từ
      `🎙️ Ai sẽ về đích? Ai sẽ khóc? Ai sẽ cười? Xem ngay!`,
      `🎙️ ${animal.name} nào sẽ thành huyền thoại hôm nay?`,
      // Chơi chữ
      `🎙️ Đua đi đua đi! Đua mà không về là... lạc đường!`,
      `🎙️ ${animal.name} ơi là ${animalName}! ${action.charAt(0).toUpperCase() + action.slice(1)} thôi!`,
      // Nhân hóa
      `🎙️ Các ${plural} đang nghĩ: "Hôm nay tao phải thắng!"`,
      `🎙️ Mặt ${animalName} nào cũng quyết tâm! Máu lửa quá!`,
      // Tình huống bất ngờ
      `🎙️ 3... 2... 1... Ủa đợi chút... À xong rồi! PHÓNG!`,
      `🎙️ Ủa tưởng chưa bắt đầu mà mọi người phóng rồi!`,
    ],
    leading: [
      // So sánh hài hước
      `🔥 {name} dẫn đầu! ${action.charAt(0).toUpperCase() + action.slice(1)} nhanh quá xá!`,
      `👑 {name} đang bay! làm tim tôi lung lay!`,
      `🚀 {name} phóng nhanh vượt ẩu!`,
      // Phóng đại
      `⚡ {name} nhanh đến nỗi tôi không thấy chân đâu luôn!`,
      `💪 {name} dẫn đầu cách xa... khoảng 300 năm ánh sáng!`,
      `🌟 {name} sáng chói mà hơi sói trán!`,
      // Tự sự hài - BLV hồi hộp
      `😎 {name} số 1! number one!`,
      `🏃 {name} rất ngầu, như đang đi tàu!`,
      `🦸 {name} ơi, cho em xin chữ ký được không?`,
      // Câu hỏi tu từ
      `💨 {name} đang dẫn đầu! bỏ xa 5 vạn 9 ngàn cây?`,
      `🤩 {name} đang lao vút! Có ai dám cản không?`,
      // Nhân hóa - vịt có suy nghĩ
      `🎯 {name} đang nghĩ: "Các em đuổi đi, anh đợi!"`,
      `😏 {name} quay lại nhìn: "Sao đi chậm thế các bạn?"`,
      // Chơi chữ
      `🔥 {name} dẫn đầu! thì ai dẫn đuôi!`,
      `👑 {name} nhìn lên không có đối thủ, á vấp cục đá!`,
      // Bất ngờ
      `⚡ Ủa {name} đâu rồi? À đằng trước kia! Nhanh quá!`,
      `🌟 {name} phóng nhanh quá tôi tưởng gắn động cơ!`,
    ],
    overtake: [
      // So sánh hài hước
      '😱 {name} vượt lên! Nhanh như tia chớp vậy!',
      '🔄 {name} lật kèo! dù hơi bèo nhèo!',
      '💨 {name} tóc mượt như sunsil bồ kết!',
      // Phóng đại
      '🎯 {name} bật turbo! Tưởng đang xem Fast & Furious!',
      '⚡ {name} vượt! Tốc độ này phải đo bằng vận tốc ánh sáng!',
      '🚀 {name} phóng! Quá nhanh quá nguy hiểm!',
      // Tự sự hài
      '😤 {name} vượt rồi! lêu lêu bà già!',
      '🌪️ {name} như cơn lốc! làm tôi bị sốc!',
      // Câu hỏi tu từ
      '🔥 {name} bứt tốc! ai chơi lại?',
      '⚔️ {name} vượt mặt! Có chơi hack không vậy?',
      // Nhân hóa - đối thoại
      '💥 {name} vượt! Đối thủ: "Ủa bạn đi đâu vậy?"',
      '🎪 {name} lên top! Các bạn khác: "Không công bằng!"',
      // Bất ngờ
      '🏆 Ai ngờ là {name}! Bất ngờ chưa bà già!',
      '⚡ {name} vượt lên! trên mọi đối thủ?',
      // Chơi chữ
      '💨 {name} tăng ga! Ga nào? Ga Hà Nội!',
      '🔥 {name} bứt phá! Phá kỷ lục hay phá tim tôi?',
    ],
    tired: [
      // So sánh hài hước
      '😓 {name} đuối! Mệt như mới chạy 10 vòng trái đất!',
      '💦 {name} thở hổn hển! Như vừa leo núi!',
      '🥵 {name} kiệt sức! Như điện thoại 1% pin vậy!',
      // Phóng đại
      '😴 {name} muốn ngủ! Chắc tối qua thức chơi game!',
      '🥱 {name} mệt xỉu! Cần nghỉ ngơi ngay!',
      '😩 {name} hết xăng! Đổ đầy bình đi anh zai!',
      // Tự sự hài
      '💤 {name} mệt quá! Tôi nhìn cũng thấy mệt lây!',
      '😵 {name} sắp xỉu! Gọi xe cứu thương chưa?',
      // Câu hỏi tu từ
      `🐌 {name} sao chậm vậy? Có ăn sáng chưa?`,
      '🫠 {name} đang tan chảy! Ai bật máy lạnh đi!',
      // Nhân hóa
      '📉 {name} nghĩ: "Thôi kệ, về nhì cũng được!"',
      '🪫 {name} than: "Chân ơi đừng bỏ tao!"',
      // Bất ngờ
      '😓 Ủa {name} đâu rồi? À kia! Sao đi chậm vậy?',
      '💀 {name} kiệt! Phải chi mang theo Red Bull!',
      // Chơi chữ
      '🥵 {name} đuối! Đuối như con cá chuối!',
    ],
    collision: [
      // So sánh hài hước
      '💥 {name} đụng đá! làm trái tim băng giá!',
      '😵 {name} đụng là chạm! chưa ngán ai!',
      '🤕 {name} văng! Bay xa như bóng bay tuột tay!',
      // Phóng đại
      '💫 {name} thấy sao bay! lên xe ngay!',
      '🤯 {name} đâm sầm! Tiếng vang cả vũ trụ!',
      // Tự sự hài
      '😵‍💫 {name} chóng mặt! Tôi nhìn cũng muốn xỉu!',
      '🪨 Ối! {name} ăn đá! Đá cứng hay mặt cứng?',
      // Câu hỏi tu từ
      '😅 {name} tưởng đá là bạn thân hả? Ôm ghê vậy?',
      '🫨 {name} rung lắc! Có bị động đất không vậy?',
      // Nhân hóa - đối thoại
      '😬 Đá: "Chào bạn!" - {name}: "Đau quá trời ơi!"',
      '🤦 {name} đâm! Đá: "Tui nằm yên mà bạn tự lao vô!"',
      '🎯 Đá: "Hôm nay có khách!" - {name}: "..."',
      // Bất ngờ
      '💥 Tưởng tránh được ai ngờ {name} đụng ngay!',
      '😵 {name} va chạm! Không ai ngờ luôn!',
      // Chơi chữ
      '🤕 {name} ăn đá! Ăn ngon không? Có cần thêm muối?',
    ],
    close: [
      // So sánh hài hước
      '😰 Căng quá! Căng hơn cả dây thun quần!',
      '🔥 Sát nút! Sát như hai đội bóng chung kết!',
      '⚔️ Nảy lửa! Nóng hơn cả bếp gas đang xào!',
      // Phóng đại
      '😱 Sát sàn sạt! Không lọt được sợi tóc!',
      '🥶 Lạnh giá! tưởng tôi là con cá!',
      '🎢 Hồi hộp! Tim tôi đập như trống trận!',
      // Tự sự hài
      '💓 Đua từng milimet! Tôi không dám thở luôn!',
      '🤯 Không tin nổi! Tay tôi run cầm không được mic!',
      '😤 Tôi muốn khóc lên cho thoả nỗi nhớ!',
      // Câu hỏi tu từ
      '🫣 Ai thắng đây? Thần cũng không đoán được!',
      '🎬 Kịch tính quá! Đạo diễn nào viết kịch bản?',
      // Nhân hóa
      '💀 Tim tôi hỏi: "Chịu nổi không ông?"',
      '🔥 Các bạn đua đang nghĩ: "Phải thắng! Phải thắng!"',
      // Bất ngờ
      '⚡ Tưởng xong rồi ai ngờ vẫn còn căng!',
      '😱 Sát nút! Tôi tưởng TV bị lag!',
    ],
    halfway: [
      // So sánh hài hước
      '🏁 Qua nửa đường! Ai tỏ tường!',
      '⏰ Mới 50%! Mà ngỡ như đã 100% chia đôi',
      // Phóng đại
      '🎯 Nửa chặng! Nửa còn lại sẽ BÙNG NỔ!',
      '🔥 Qua nửa! Drama chưa bắt đầu đâu!',
      // Tự sự hài
      '📍 Mới nửa đường thôi à!',
      '⚡ 50% done! Tôi đã hết cạn 90% pin rồi!',
      // Câu hỏi tu từ
      '🏁 Nửa đường rồi! Ai sẽ bung sức đây?',
      '🔥 Qua nửa! Bao giờ mới có drama?',
      // Bất ngờ
      '⏰ Ủa qua nửa rồi hả? Nhanh thế!',
      '🎯 50%! Tưởng mới bắt đầu!',
    ],
    final: [
      // So sánh hài hước
      '🏆 {name} VÔ ĐỊCH! Xứng đáng như phim Marvel!',
      '🎉 {name} thắng! Đẹp như giấc mơ hồi nhỏ!',
      '👑 {name} lên ngôi! Oai như vua sư tử!',
      // Phóng đại
      '🥇 {name} số 1! Cả thế giới phải ngả mũ!',
      '🌟 {name} vô địch! Vinh quang muôn đời!',
      '🎊 {name} về đích! Lịch sử sẽ ghi nhận!',
      // Tự sự hài
      '🤴 {name} vô địch! Tôi muốn khóc vì vui!',
      '💎 {name} huyền thoại! Fan cứng từ bây giờ!',
      '🏆 {name} thắng rồi! Tôi mãn nguyện rồi!',
      // Câu hỏi tu từ
      '👑 {name} VÔ ĐỊCH! Có ai xứng đáng hơn không?',
      '🎉 {name} best! Ai dám phản đối?',
      // Nhân hóa
      '🥇 {name} nghĩ: "Tao nói rồi mà, tao thắng!"',
      '🌟 Các bạn thua: "Hẹn gặp lại match sau!"',
      // Bất ngờ
      '🏆 {name} thắng! Tưởng ai ngờ là {name}!',
      '💎 {name} vô địch! Kịch bản không ai ngờ!',
    ],
    boost: [
      // So sánh hài hước
      '🚀 {name} bật chế độ tăng động!',
      '⚡ {name} tăng tốc! Giống xe đua F1 vậy!',
      '💨 {name} bay! Máy bay cũng phải gọi bằng cụ!',
      // Phóng đại
      '🔋 {name} full pin! Năng lượng vô hạn!',
      '🚀 {name} phóng! Vượt qua cả tốc độ ánh sáng!',
      // Tự sự hài
      '⚡ {name} bứt tốc! Mắt tôi không theo kịp!',
      '💨 {name} tăng ga! Wow! Amazing! gút chóp!',
      // Nhân hóa
      '🔥 {name} nghĩ: "Giờ mới show sức mạnh!"',
      '🚀 {name}: "Các bạn, tạm biệt nhé!"',
      // Bất ngờ
      '⚡ Ủa {name} mất tiêu đâu? á đăng trước kìa',
    ],
    slowdown: [
      // So sánh hài hước
      '🌊 {name} Chậm quá! Chậm như wifi nhà tôi vậy!',
      '😓 {name} slow motion! Giống phim cô dâu 8 tuổi!',
      '🐌 {name} mất đà! ô là la!',
      // Tự sự hài
      '📉 {name} giảm tốc! Ôi không! Sao lại thế!',
      '🐢 {name} chậm lại! Tôi muốn khóc!',
      // Nhân hóa
      '😓 {name} nghĩ: "Chân ơi sao bỏ tao!"',
      '🌊 {name} than: "Sóng gì mà dữ vậy!"',
      // Bất ngờ
      '📉 {name} chậm! Ai bấm nút pause vậy?',
    ],
    comeback: [
      // So sánh hài hước
      '🔥 {name} hồi sinh! từ vũng sình!',
      '💪 {name} comeback! quá xác oách!',
      '😤 {name} quay lại! "chờ đã, chưa xong đâu"!',
      // Phóng đại
      '⚡ {name} phục hận! như con rận!',
      '🎯 {name} sẽ trở lại! dù có thất bại!',
      // Tự sự hài
      '🔥 {name} hồi phục! tăng tốc thôi',
      '💪 {name} bùng nổ! Nước mắt tôi rơi!',
      // Nhân hóa
      '😤 {name} nghĩ: "Tui sẽ thắng!"',
      '⚡ {name}: "Quá xá đã!"',
      // Bất ngờ
      '🔥 Tưởng hết hy vọng! Ai ngờ {name} quay lại!',
      '💪 {name} comeback! không ai ngờ!',
      // Chơi chữ
      '😤 {name} trở lại! Come back hay back come? Kệ!',
    ],
    lucky: [
      // So sánh hài hước
      '🍀 {name} may quá! Như trúng số vậy!',
      '✨ {name} thoát nạn! May như có bùa!',
      '😅 {name} né được! Phản xạ như như chớp!',
      // Tự sự hài
      '🙏 {name} may! Ông bà phù hộ chắc luôn!',
      '🍀 {name} thoát! Tim tôi rớt rồi nhặt lại!',
      // Nhân hóa - đối thoại
      '✨ Đá: "Ủa sao né được?" - {name}: "Hehe!"',
      '😅 {name} nghĩ: "Suýt xong đời!"',
      // Bất ngờ
      '🙏 Tưởng đụng rồi! Ai ngờ {name} né ngon!',
    ],
    // Bình luận ngẫu nhiên giữa trận - MIX đa dạng kỹ thuật hài + slang mạng xã hội
    random: [
      // === SLANG MẠNG XÃ HỘI VIỆT NAM ===
      '🔥 CÒN CÁI NỊT! Cuộc đua căng đét!',
      '💀 ĐỈNH NÓC KỊch TRẦN BAY PHẤP PHỚI!',
      '😱 XỊN XÒ NHƯ CON BÒ! Hay quá!',
      '⚡ REAL G KHÔNG BAO GIỜ BỎ CUỘC!',
      '🎯 CÁI NÀY CHÁY LẮM NHA! Quá hot!',
      '💥 NGÁO NGƠ LUÔN! Sao hay dữ vậy?',
      '🌟 BIẾT GÌ KHÔNG? Cuộc đua đỉnh cao!',
      '😤 Ê KHÔNG ĐÙA ĐƯỢC ĐÂU! Căng thật!',
      '🏆 AI MÀ CHỊU NỔI cuộc đua này!',
      '🎪 HẾT NƯỚC CHẤM với drama này!',
      '😵 CÁI NÀY HƠI LÚ! Ai thắng đây?',
      '🤯 NHÌN MÀ XỈU NGANG! Kịch tính!',
      '💯 ỔN ÁP LUÔN! Đua tiếp thôi!',
      '🔥 CĂNG NHẸ THÔI nha bà con!',
      '😰 CŨNG HƠI MỆT À NHA theo dõi!',
      '🤔 ĐÚNG LÀ KHÔNG ĐÙA ĐƯỢC!',
      // === SLANG MỚI - TỪ LÓNG VIRAL ===
      '🚀 TỚI CÔNG CHUYỆN! Cuộc đua bắt đầu nóng lên!',
      '😎 E LÀ KHÔNG THỂ thua cuộc đua này!',
      '💯 10 ĐIỂM KHÔNG CÓ NHƯNG cho pha đua này!',
      '🏆 THẮNG ĐỜI 1-0! Ai về nhất là vô địch!',
      '😅 THUA ĐỜI 1-0! Ai về chót cũng không sao!',
      '🧠 Thua Gia Cát Lượng mỗi cây quạt! Ai thắng là thiên tài!',
      '🎬 TUYỆT ĐỐI ĐIỆN ẢNH! Như phim Hollywood!',
      '🎯 BỐC TRÚNG SÍT RỊT! Đoán đúng ai thắng không?',
      '😱 VỀ KỂ KHÔNG AI TIN! Cuộc đua này quá sức tưởng tượng!',
      '💅 CƠM NƯỚC GÌ CHƯA NGƯỜI ĐẸP? À mà đua tiếp đi!',
      '😭 TÔI LÀ NẠN NHÂN CỦA cuộc đua căng thẳng này!',
      // === SO SÁNH HÀI HƯỚC ===
      '🎙️ Cuộc đua nóng hơn cả bếp gas đang nấu!',
      '🔥 Drama căng hơn phim hoạt hình!',
      '⚡ Tốc độ nhanh như wifi nhà người ta!',
      '🏃 Các bạn đua như shipper giao hàng nhanh!',
      // === PHÓNG ĐẠI SIÊU HÀI (dễ hiểu cho mọi lứa tuổi) ===
      '💨 Kịch tính! Cả vũ trụ đang theo dõi!',
      '🎯 Căng thẳng! Tim tôi đập nhanh như trống trường!',
      '🌊 Nước sông dậy sóng như biển lớn!',
      '🚀 Nhanh quá! Bay vèo như tên lửa!',
      '🏃 Chạy nhanh hơn cả gió!',
      '💥 Hay quá! Hay hơn cả 100 bộ phim hoạt hình!',
      '🏔️ Vượt qua 99 ngọn núi và 100 con sông!',
      '🔥 Nóng! Nóng hơn cả trời mùa hè!',
      '💪 Mạnh quá! Mạnh như siêu nhân!',
      '🌈 Đẹp quá! Đẹp như cầu vồng sau mưa!',
      '🎪 Vui hơn cả ngày sinh nhật!',
      '😱 Hồi hộp quá! Tóc tôi dựng đứng hết rồi!',
      '🧊 Căng! Căng như dây đàn guitar!',
      '👀 Mắt tôi mở to như hai quả trứng!',
      '🍕 Cuộc đua ngon lành như pizza vừa ra lò!',
      '🎈 Bay cao! Bay cao hơn cả bong bóng!',
      '🐘 To! Tiếng hò reo to như voi gầm!',
      '⭐ Sáng! Tỏa sáng như ngôi sao!',
      '🍦 Mát! Mát hơn cả 10 cây kem!',
      // === TỰ SỰ HÀI - BLV hài ===
      '🔥 Ôi trời ơi! Tôi không chịu nổi!',
      '⚔️ Tôi muốn hét lên! Hay quá!',
      '💥 Máu lửa! Tôi đổ mồ hôi hột!',
      '🎪 Drama liên tục! Tôi cần nghỉ giải lao!',
      // === CÂU HỎI TU TỪ ===
      '🏆 Ai sẽ thắng? Tôi cũng không biết!',
      '😄 Vui quá! Sao có thể vui như vậy?',
      '🥰 Các bạn đua dễ thương ghê! Ai đồng ý?',
      '😍 Cuộc đua này có gì hot không nhỉ?',
      // === BẤT NGỜ ===
      '😂 Ủa chuyện gì đang xảy ra vậy?',
      '😆 Tưởng bình thường ai ngờ hay quá!',
      // === CHƠI CHỮ ===
      '🔥 Đua tiếp thôi! Đua mà không mệt là... robot!',
      '😅 Căng quá! Căng nhưng không đứt đâu!',
      '😰 Mệt quá! Mệt người xem chứ người đua thì không!',
      '🤔 Đúng là cuộc đua! Không đua thì gọi là gì?',
      '😱 Nhìn mà muốn xỉu! Xỉu vì vui đó!',
      '💀 Hết hồn! Hồn ở đâu? Đây nè!',
      '⚡ Ổn! Rất ổn! Ổn như cơm nguội!',
      // === CHƠI CHỮ VẦN NGỘ NGHĨNH ===
      '🐄 Xịn xò như con bò! Moo moo!',
      '🌪️ Tăng tốc như cơn lốc! Vèo vèo!',
      '🏛️ Phi nhanh tới chùa bà đanh!',
      '🐚 Tăng tốc để đi ăn ốc! Slurp!',
      '🦊 Nhanh như sóc, tóc bay phấp phới!',
      '🎯 Đi như tên, chen lên hàng đầu!',
      '🐦 Bay như chim, tim đập thình thịch!',
      '⭐ Lao như sao băng, căng như dây đàn!',
      '💨 Bay vèo vèo, nghe tiếng reo!',
      '🚀 Vút như tên, lên như diều gặp gió!',
      '🌊 Bơi ào ào, vào top ngay!',
      '🥁 Chạy rầm rầm, ầm ĩ cả sông!',
      '🎵 Đua như mơ, ai ngờ hay quá!',
      '🔥 Lao như pháo, náo động cả trận!',
      '💎 Chậm mà chắc, khắc ghi chiến thắng!',
      '☁️ Bay như mây, hay không thể tả!',
      '⚡ Đua như sấm, ầm ầm vang dội!',
      '🎈 Phăng phăng tiến, hiện ngay top 1!',
      '🐢 Tuy hơi chậm nhưng không lẩm cẩm!',
      '🎪 Đi như bay, hay như phim!',
      '🦅 Phi như điên, liền về đích!',
      '🍜 Bơi như măng, băng băng về đích!',
      '🐝 Vù vù bay, hay không chịu được!',
      '🎸 Đua rộn ràng, vang khắp nơi!',
      '🌻 Tươi như hoa, ta về nhất nha!',
      '🍉 Ngọt như dưa, vừa đẹp vừa hay!',
      '🐸 Nhảy như ếch, rẹt rẹt về đích!',
      '🦋 Lượn như bướm, đượm sắc màu!',
      '🌙 Sáng như trăng, căng không chịu nổi!',
      '🍀 May như cỏ, rõ ràng số một!',
      '🎁 Bất ngờ như quà, à hay quá!',
      '🥕 Khỏe như thỏ, rõ là vô địch!',
      '🐠 Lội như cá, nhà vô địch đây!',
      '🎂 Ngọt như bánh, mạnh như sư tử!',
      '🌞 Sáng như trời, ơi ơi hay quá!',
      '🎀 Xinh như nơ, mơ về nhất!',
      '🍭 Vui như Tết, hết ý luôn!',
      '🐰 Nhanh như thỏ, rõ là pro!',
      '🎤 Hay như hát, chắc chắn thắng!',
      '🧁 Ngọt như kẹo, véo má luôn!',
      '🎠 Quay như đu, vù vù tiến!',
      '🎡 Vòng vòng quay, hay hay hay!',
      '🛸 Bay như UFO, pro không đối thủ!',
      '🎯 Trúng như tên, lên top liền!',
      '🌈 Đẹp như mộng, bổng bay cao!',
      // === CHƠI CHỮ VẦN BẤT NGỜ HÀI HƯỚC (chuẩn bằng-trắc) ===
      '🧚 Đẹp như tiên mà kiên cường bất khuất!',
      '👻 Xấu như ma mà la cà quán xá!',
      '💨 Bay như gió mà nói có nói không!',
      '🪁 Bay như diều nên hay làm liều!',
      '🐌 Tuy hơi chậm nhưng không lẩm cẩm!',
      '🏛️ Phi nhanh tới chùa bà đanh!',
      '🐚 Tăng tốc để đi ăn ốc!',
      '🦁 Dữ như hổ, đổ bộ về đích!',
      '🐱 Hiền như mèo, mà trèo lên top!',
      '🦆 Bơi như vịt, rích rích tiến lên!',
      '🐷 Tròn như heo, mà leo rất nhanh!',
      '🦀 Đi như cua, mà vua về đích!',
      '🐢 Chậm như rùa, mà vua tốc độ!',
      '🦜 Nói như vẹt, mà hét rất vang!',
      '🐵 Nhảy như khỉ, mà chỉ biết thắng!',
      '🦉 Khôn như cú, mà vù vù bay!',
      '🐔 Gáy như gà, mà ta về nhất!',
      '🦢 Đẹp như nga, mà ta dẫn đầu!',
      '🐝 Chăm như ong, mà trong top hoài!',
      '🦩 Điệu như hạc, mà cạch luôn top!',
      '🐊 Dữ như sấu, mà cháu về nhất!',
      '🦈 Hung như cá, mà ta chiến thắng!',
      '🐳 To như voi, ôi ôi dẫn đầu!',
      '🦋 Nhẹ như bướm, mà đượm vinh quang!',
      '🐻 Khỏe như gấu, mà đâu ai bằng!',
      '🦊 Ranh như cáo, mà náo loạn luôn!',
    ],
  };
};

// 50 màu sắc đa dạng cho vịt
const DUCK_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', 
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#fb7185', '#fda4af', '#fbbf24', '#a3e635',
  '#4ade80', '#2dd4bf', '#22d3ee', '#38bdf8', '#818cf8',
  '#c084fc', '#e879f9', '#f472b6', '#fb923c', '#facc15',
  '#a78bfa', '#c4b5fd', '#7dd3fc', '#67e8f9', '#5eead4',
  '#6ee7b7', '#86efac', '#bef264', '#fde047', '#fcd34d',
  '#fdba74', '#fca5a5', '#f9a8d4', '#f0abfc', '#d8b4fe',
  '#a5b4fc', '#93c5fd', '#7dd3fc', '#a7f3d0', '#d9f99d',
];

// Mẫu vật cản - sẽ được random vị trí mỗi lần đua
const OBSTACLE_TEMPLATES = [
  { emoji: '🪨', size: 'large' },
  { emoji: '🪨', size: 'medium' },
  { emoji: '🪨', size: 'large' },
  { emoji: '🪵', size: 'medium' },
  { emoji: '🪵', size: 'large' },
  { emoji: '🪵', size: 'medium' },
  { emoji: '🌿', size: 'small' },
  { emoji: '🌾', size: 'small' },
  { emoji: '🌿', size: 'small' },
  { emoji: '🌀', size: 'medium' },
  { emoji: '🐟', size: 'small' },
  { emoji: '🦀', size: 'small' },
];

// Hàm tạo vật cản với vị trí ngẫu nhiên - đảm bảo công bằng cho tất cả lane
const generateRandomObstacles = () => {
  const obstacles = [];
  const numObstacles = OBSTACLE_TEMPLATES.length;
  
  // Chia map thành lưới để phân bố đều
  // X: 15-85% (tránh start/finish)
  // Y: 10-90% (toàn bộ chiều cao)
  const gridCols = 4; // 4 cột theo chiều ngang
  const gridRows = 3; // 3 hàng theo chiều dọc
  
  OBSTACLE_TEMPLATES.forEach((template, index) => {
    // Phân bố vào các ô lưới
    const col = index % gridCols;
    const row = Math.floor(index / gridCols) % gridRows;
    
    // Tính vùng của ô lưới
    const xMin = 15 + col * (70 / gridCols);
    const xMax = 15 + (col + 1) * (70 / gridCols);
    const yMin = 10 + row * (80 / gridRows);
    const yMax = 10 + (row + 1) * (80 / gridRows);
    
    // Random vị trí trong ô lưới
    obstacles.push({
      id: `obs-${index}`,
      emoji: template.emoji,
      size: template.size,
      x: xMin + Math.random() * (xMax - xMin),
      y: yMin + Math.random() * (yMax - yMin),
    });
  });
  
  return obstacles;
};

// Helper: Extract short name (tên) from full Vietnamese name
const getShortName = (fullName) => {
  const parts = fullName.trim().split(/\s+/);
  // Vietnamese: last word is the "tên" (first name)
  return parts[parts.length - 1];
};

export default function DuaThuHoatHinh() {
  // Input state
  const [inputText, setInputText] = useState('');
  const [racers, setRacers] = useState([]);
  
  // Race state
  const [positions, setPositions] = useState({});
  const [verticalPos, setVerticalPos] = useState({});
  const [racerEffects, setRacerEffects] = useState({}); // Hiệu ứng hiện tại của mỗi vịt
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState(null);
  const [topRacers, setTopRacers] = useState([]);
  const [events, setEvents] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [raceTime, setRaceTime] = useState(0);
  const [raceSpeed, setRaceSpeed] = useState('normal'); // 'slow', 'normal', 'fast'
  const [animalType, setAnimalType] = useState('duck'); // 'duck', 'turtle', 'crab', 'fish', 'snail'
  const [commentary, setCommentary] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastLeader, setLastLeader] = useState(null);
  const [duplicateNames, setDuplicateNames] = useState([]); // Tên trùng
  const [isPortrait, setIsPortrait] = useState(false); // Track orientation for mobile
  const [obstacles, setObstacles] = useState(() => generateRandomObstacles()); // Random obstacles mỗi lần đua
  
  const animationRef = useRef(null);
  const containerRef = useRef(null);
  const commentaryTimeoutRef = useRef(null);
  const raceStartTimeRef = useRef(null);
  const racerStatesRef = useRef({});
  const bgMusicRef = useRef(null);
  const bgMusicIntervalRef = useRef(null);
  const soundEnabledRef = useRef(true); // Ref to track current soundEnabled value

  // Keep soundEnabledRef in sync with soundEnabled state
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Parse input to racers - support up to 200 racers
  const parseInput = useCallback(() => {
    const names = inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 200); // Max 200 racers
    
    // Detect duplicate names (case-insensitive)
    const nameCounts = {};
    const originalNames = {}; // Store original casing
    names.forEach(name => {
      const lowerName = name.toLowerCase();
      nameCounts[lowerName] = (nameCounts[lowerName] || 0) + 1;
      if (!originalNames[lowerName]) {
        originalNames[lowerName] = name; // Keep first occurrence's casing
      }
    });
    const duplicates = Object.entries(nameCounts)
      .filter(([_, count]) => count > 1)
      .map(([lowerName, count]) => ({ name: originalNames[lowerName], count }));
    setDuplicateNames(duplicates);
    
    const newRacers = names.map((name, index) => ({
      id: `racer-${index}`,
      name: name, // Full name for results
      shortName: getShortName(name), // Short name for racing display
      color: DUCK_COLORS[index % DUCK_COLORS.length],
      index: index,
    }));
    
    setRacers(newRacers);
    
    // Initialize positions - better distribution for many racers
    const initialPos = {};
    const initialVertical = {};
    const initialEffects = {};
    const totalRacers = newRacers.length;
    
    newRacers.forEach((r, i) => {
      initialPos[r.id] = 0;
      // Smart vertical distribution - USE FULL RIVER WIDTH (5%-95%)
      if (totalRacers <= 10) {
        // Few racers - spread out evenly across full width
        initialVertical[r.id] = 5 + (i * 90 / Math.max(totalRacers - 1, 1));
      } else if (totalRacers <= 50) {
        // Medium - use rows across full width
        const row = i % 8;
        const jitter = Math.random() * 3 - 1.5;
        initialVertical[r.id] = 5 + row * 11.5 + jitter;
      } else {
        // Many racers (50-200) - dense packing across full width
        const row = i % 12;
        const jitter = Math.random() * 2 - 1;
        initialVertical[r.id] = 5 + row * 7.5 + jitter;
      }
      initialEffects[r.id] = null;
    });
    setPositions(initialPos);
    setVerticalPos(initialVertical);
    setRacerEffects(initialEffects);
    setWinner(null);
    setTopRacers([]);
    setEvents([]);
    setRaceTime(0);
  }, [inputText]);

  // Auto parse when input changes
  useEffect(() => {
    parseInput();
  }, [inputText, parseInput]);

  // Check orientation on mount and resize (for mobile portrait warning)
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 768);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    // Try to lock to landscape on mobile when racing
    if (isFullscreen && screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    };
  }, [isFullscreen]);

  // Play sound - LOUDER and more impactful
  const playSound = useCallback((type) => {
    // Use ref to get current value (not stale closure)
    if (!soundEnabledRef.current) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      
      switch (type) {
        case 'countdown': {
          // Epic countdown beep - như đồng hồ đếm ngược
          masterGain.gain.value = 0.5;
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(masterGain);
          osc.frequency.value = 800;
          osc.type = 'square';
          gain.gain.setValueAtTime(0.8, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          osc.start();
          osc.stop(audioContext.currentTime + 0.2);
          break;
        }
        case 'start': {
          // XUẤT PHÁT! - fanfare dồn dập
          masterGain.gain.value = 0.6;
          const notes = [523, 659, 784, 1047]; // C5-E5-G5-C6
          notes.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(masterGain);
            osc.frequency.value = freq;
            osc.type = 'sawtooth';
            const startTime = audioContext.currentTime + i * 0.08;
            gain.gain.setValueAtTime(0.7, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
            osc.start(startTime);
            osc.stop(startTime + 0.15);
          });
          // Add bass punch
          const bass = audioContext.createOscillator();
          const bassGain = audioContext.createGain();
          bass.connect(bassGain);
          bassGain.connect(masterGain);
          bass.frequency.value = 130;
          bass.type = 'sine';
          bassGain.gain.setValueAtTime(0.9, audioContext.currentTime);
          bassGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          bass.start();
          bass.stop(audioContext.currentTime + 0.4);
          break;
        }
        case 'event': {
          // Sự kiện xảy ra - attention grabbing
          masterGain.gain.value = 0.4;
          const osc1 = audioContext.createOscillator();
          const osc2 = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(masterGain);
          osc1.frequency.value = 880;
          osc2.frequency.value = 1100;
          osc1.type = 'triangle';
          osc2.type = 'sine';
          gain.gain.setValueAtTime(0.6, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          osc1.start();
          osc2.start();
          osc1.stop(audioContext.currentTime + 0.15);
          osc2.stop(audioContext.currentTime + 0.15);
          break;
        }
        case 'win': {
          // CHIẾN THẮNG! - Epic victory fanfare
          masterGain.gain.value = 0.7;
          const melody = [523, 659, 784, 880, 1047, 1319, 1568]; // C-E-G-A-C-E-G
          melody.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(masterGain);
            osc.frequency.value = freq;
            osc.type = i < 4 ? 'sawtooth' : 'square';
            const startTime = audioContext.currentTime + i * 0.1;
            gain.gain.setValueAtTime(0.6, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
            osc.start(startTime);
            osc.stop(startTime + 0.3);
          });
          // Add triumphant bass
          [131, 165, 196].forEach((freq, i) => {
            const bass = audioContext.createOscillator();
            const bassGain = audioContext.createGain();
            bass.connect(bassGain);
            bassGain.connect(masterGain);
            bass.frequency.value = freq;
            bass.type = 'sine';
            const startTime = audioContext.currentTime + i * 0.2;
            bassGain.gain.setValueAtTime(0.8, startTime);
            bassGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
            bass.start(startTime);
            bass.stop(startTime + 0.4);
          });
          break;
        }
      }
    } catch (e) {
      // Audio not supported
    }
  }, []); // Removed soundEnabled since we use ref

  // Preload background music - start playing muted during countdown
  // Use crossfade technique for smooth looping
  // Background music - TWO audios for crossfade loop
  const preloadBgMusic = useCallback(() => {
    try {
      // Stop any existing music first
      if (bgMusicRef.current) {
        if (bgMusicRef.current.audios) {
          bgMusicRef.current.audios.forEach(a => { if (a) { a.pause(); a.src = ''; } });
        } else if (bgMusicRef.current instanceof Audio) {
          bgMusicRef.current.pause();
          bgMusicRef.current.src = '';
        }
        bgMusicRef.current = null;
      }
      
      // Create TWO audio elements for crossfade
      const audio1 = new Audio('/tool/duavit/dua_vit.mp3');
      const audio2 = new Audio('/tool/duavit/dua_vit.mp3');
      audio1.preload = 'auto';
      audio2.preload = 'auto';
      
      bgMusicRef.current = {
        audios: [audio1, audio2],
        active: 0,
        fading: false
      };
      
      // Play audio1 immediately to unlock AND start buffering
      // Nếu sound bị tắt trong setup → volume = 0 (chạy ngầm)
      // Nếu sound bật → volume = 0.65
      audio1.volume = soundEnabledRef.current ? 0.65 : 0;
      audio1.play().catch(() => {});
      
      // Load audio2 for crossfade later
      audio2.load();
      
    } catch (e) {
      // Preload failed silently
    }
  }, []);

  // Crossfade to next audio - smoother 3 second transition
  const doCrossfade = useCallback(() => {
    const ref = bgMusicRef.current;
    if (!ref || !ref.audios || ref.fading) return;
    if (!soundEnabledRef.current) return;
    
    ref.fading = true;
    const { audios, active } = ref;
    const next = active === 0 ? 1 : 0;
    const curr = audios[active];
    const nextAudio = audios[next];
    
    // Start next from beginning
    nextAudio.currentTime = 0;
    nextAudio.volume = 0;
    nextAudio.play().catch(() => {});
    
    // Crossfade 3 seconds (30 steps x 100ms) - smoother equal power crossfade
    let step = 0;
    const totalSteps = 30;
    const interval = setInterval(() => {
      step++;
      const p = step / totalSteps;
      // Equal power crossfade for smoother transition
      curr.volume = 0.65 * Math.cos(p * Math.PI / 2);
      nextAudio.volume = 0.65 * Math.sin(p * Math.PI / 2);
      
      if (step >= totalSteps) {
        clearInterval(interval);
        curr.pause();
        curr.currentTime = 0;
        nextAudio.volume = 0.65;
        ref.active = next;
        ref.fading = false;
      }
    }, 100);
  }, []);

  // Start background music - audio already playing from preload, just setup crossfade checker
  const startBgMusic = useCallback(() => {
    if (!soundEnabledRef.current) return;
    
    const ref = bgMusicRef.current;
    
    // If no audio ref exists (e.g., sound was disabled during preload), create new
    if (!ref || !ref.audios) {
      const audio1 = new Audio('/tool/duavit/dua_vit.mp3');
      const audio2 = new Audio('/tool/duavit/dua_vit.mp3');
      audio1.preload = 'auto';
      audio2.preload = 'auto';
      
      bgMusicRef.current = {
        audios: [audio1, audio2],
        active: 0,
        fading: false
      };
      
      audio1.volume = 0.65;
      audio1.play().catch(() => {});
      
      audio2.load();
    } else {
      // Audio already exists, ensure volume and play if paused
      const activeAudio = ref.audios[ref.active];
      activeAudio.volume = 0.65;
      if (activeAudio.paused) {
        activeAudio.play().catch(() => {});
      }
    }
    
    // Setup crossfade checker - check 4 seconds before end for smoother loop
    if (bgMusicIntervalRef.current) clearInterval(bgMusicIntervalRef.current);
    
    bgMusicIntervalRef.current = setInterval(() => {
      const r = bgMusicRef.current;
      if (!r || !r.audios) return;
      
      const curr = r.audios[r.active];
      // Only crossfade if:
      // 1. Duration is valid (> 10 seconds to ensure file loaded properly)
      // 2. We're 4 seconds from the end
      // 3. Not already fading
      const duration = curr.duration;
      if (duration && !isNaN(duration) && duration > 10 && curr.currentTime >= duration - 4 && !r.fading) {
        doCrossfade();
      }
    }, 500); // Check every 500ms
    
  }, [doCrossfade]);

  // Stop background music with smooth fade out
  const stopBgMusic = useCallback((fadeOut = true, fadeDuration = 1500) => {
    if (bgMusicIntervalRef.current) {
      clearInterval(bgMusicIntervalRef.current);
      bgMusicIntervalRef.current = null;
    }
    
    const ref = bgMusicRef.current;
    if (!ref) return;
    
    // Calculate fade step based on duration (updates every 50ms)
    const fadeSteps = fadeDuration / 50;
    
    // Handle format: { audios: [audio1, audio2], activeIndex }
    if (ref.audios && Array.isArray(ref.audios)) {
      const activeAudio = ref.audios[ref.active || ref.activeIndex || 0];
      if (fadeOut && activeAudio && activeAudio.volume > 0) {
        const startVol = activeAudio.volume;
        let step = 0;
        const fade = setInterval(() => {
          step++;
          // Use exponential curve for more natural fade out
          const progress = step / fadeSteps;
          activeAudio.volume = startVol * Math.pow(1 - progress, 2);
          
          if (step >= fadeSteps || activeAudio.volume <= 0.01) {
            clearInterval(fade);
            ref.audios.forEach(a => { 
              if (a) { a.pause(); a.currentTime = 0; a.src = ''; }
            });
            bgMusicRef.current = null;
          }
        }, 50);
      } else {
        ref.audios.forEach(a => { 
          if (a) { a.pause(); a.currentTime = 0; a.src = ''; }
        });
        bgMusicRef.current = null;
      }
    } 
    // Handle single Audio element
    else if (ref instanceof Audio) {
      if (fadeOut && ref.volume > 0) {
        const startVol = ref.volume;
        let step = 0;
        const fade = setInterval(() => {
          step++;
          const progress = step / fadeSteps;
          ref.volume = startVol * Math.pow(1 - progress, 2);
          
          if (step >= fadeSteps || ref.volume <= 0.01) {
            clearInterval(fade);
            ref.pause();
            ref.currentTime = 0;
            ref.src = '';
            bgMusicRef.current = null;
          }
        }, 50);
      } else {
        ref.pause();
        ref.currentTime = 0;
        ref.src = '';
        bgMusicRef.current = null;
      }
    }
  }, []);

  // Stop/Start background music when sound toggle changes
  useEffect(() => {
    const ref = bgMusicRef.current;
    
    if (!soundEnabled) {
      // Tắt âm thanh: chỉ giảm volume về 0, không dừng audio
      // Audio vẫn tiếp tục chạy ngầm để khi bật lại sẽ tiếp tục từ vị trí hiện tại
      if (ref && ref.audios) {
        ref.audios.forEach(a => {
          if (a) a.volume = 0;
        });
      }
    } else if (isRacing) {
      // Bật âm thanh trong game
      if (ref && ref.audios) {
        // Audio đang chạy ngầm, chỉ cần tăng volume lên
        const activeAudio = ref.audios[ref.active || 0];
        if (activeAudio) {
          activeAudio.volume = 0.65;
          // Nếu audio bị pause (trường hợp lỗi), play lại
          if (activeAudio.paused) {
            activeAudio.play().catch(() => {});
          }
        }
      } else {
        // Chưa có audio (sound bị tắt từ setup), tạo mới
        startBgMusic();
      }
    }
  }, [soundEnabled, isRacing, startBgMusic]);

  // Show commentary - dynamic based on animal type với hệ thống chống lặp
  const usedCommentariesRef = useRef({});
  
  // Số lượng câu slang trong mỗi type (các câu slang nằm ở đầu array)
  const SLANG_COUNT = {
    random: 27, // Số câu slang mạng xã hội trong random array
  };
  
  const showCommentary = useCallback((type, name = '') => {
    const commentaries = getCommentaries(animalType);
    const messages = commentaries[type];
    if (!messages || messages.length === 0) return;
    
    // Khởi tạo danh sách đã dùng cho type này nếu chưa có
    if (!usedCommentariesRef.current[type]) {
      usedCommentariesRef.current[type] = [];
    }
    
    // Lọc ra các câu chưa dùng
    let availableMessages = messages.filter((_, idx) => 
      !usedCommentariesRef.current[type].includes(idx)
    );
    
    // Nếu đã dùng hết, reset lại danh sách (giữ lại 2 câu cuối để không lặp ngay)
    if (availableMessages.length === 0) {
      const keepLast = usedCommentariesRef.current[type].slice(-2);
      usedCommentariesRef.current[type] = keepLast;
      availableMessages = messages.filter((_, idx) => !keepLast.includes(idx));
      if (availableMessages.length === 0) availableMessages = messages; // fallback
    }
    
    // Ưu tiên slang 60% cho type 'random'
    let selectedMessage;
    const slangCount = SLANG_COUNT[type] || 0;
    
    if (type === 'random' && slangCount > 0 && Math.random() < 0.6) {
      // 60% cơ hội chọn từ các câu slang (đầu array)
      const slangMessages = availableMessages.filter((msg, idx) => {
        const originalIdx = messages.indexOf(msg);
        return originalIdx < slangCount;
      });
      if (slangMessages.length > 0) {
        selectedMessage = slangMessages[Math.floor(Math.random() * slangMessages.length)];
      }
    }
    
    // Nếu chưa chọn được (không phải random hoặc không có slang available), chọn bình thường
    if (!selectedMessage) {
      selectedMessage = availableMessages[Math.floor(Math.random() * availableMessages.length)];
    }
    
    const originalIdx = messages.indexOf(selectedMessage);
    usedCommentariesRef.current[type].push(originalIdx);
    
    // Use shortName if available
    const displayName = name.includes(' ') ? getShortName(name) : name;
    // Wrap name with markers for highlighting: [[name]]
    const msg = selectedMessage
      .replace('{name}', displayName ? `[[${displayName}]]` : '');
    setCommentary(msg);
    
    if (commentaryTimeoutRef.current) {
      clearTimeout(commentaryTimeoutRef.current);
    }
    // Display time 4.5s - đủ thời gian để đọc và cảm nhận sự hài hước
    commentaryTimeoutRef.current = setTimeout(() => setCommentary(''), 4500);
  }, [animalType]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Start race with countdown
  const startRace = useCallback(() => {
    if (isRacing || racers.length < 2) return;
    
    // Speed multiplier based on raceSpeed setting (5 levels) - GIẢM TỐC ĐỘ
    const speedMultipliers = {
      'very-slow': 0.35,
      'slow': 0.6,
      'normal': 1.0,
      'fast': 1.8,
      'very-fast': 2.8
    };
    const speedMultiplier = speedMultipliers[raceSpeed] || 1;
    
    // Animal speed modifier
    const animalSpeedBase = ANIMAL_TYPES[animalType].speedBase || 1;
    const finalSpeedMultiplier = speedMultiplier * animalSpeedBase;
    
    const totalRacers = racers.length;
    
    // Reset states
    const initialPos = {};
    const initialVertical = {};
    const initialEffects = {};
    racers.forEach((r, i) => {
      initialPos[r.id] = 0;
      // Smart vertical distribution - USE FULL RIVER WIDTH (5%-95%)
      if (totalRacers <= 10) {
        // Spread evenly from 5% to 95%
        initialVertical[r.id] = 5 + (i * 90 / Math.max(totalRacers - 1, 1));
      } else if (totalRacers <= 30) {
        // Use full height with proper spacing
        const row = i % totalRacers;
        initialVertical[r.id] = 5 + (row * 90 / Math.max(totalRacers - 1, 1));
      } else if (totalRacers <= 50) {
        // Stack in columns if needed
        const row = i % 20;
        const col = Math.floor(i / 20);
        const jitter = col * 2;
        initialVertical[r.id] = 5 + row * 4.5 + jitter;
      } else {
        // Many racers - tight packing
        const row = i % 25;
        const col = Math.floor(i / 25);
        const jitter = col * 1.5;
        initialVertical[r.id] = 5 + row * 3.6 + jitter;
      }
      initialEffects[r.id] = null;
      racerStatesRef.current[r.id] = {
        baseSpeed: (0.12 + Math.random() * 0.04) * finalSpeedMultiplier,
        currentSpeed: 0.12 * finalSpeedMultiplier,
        targetSpeed: 0.12 * finalSpeedMultiplier,
        stamina: 100,
        fatigue: 0,
        wobble: Math.random() * Math.PI * 2,
        isStunned: false,
        stunnedUntil: 0,
        lastObstacleHit: 0,
        speedVariation: Math.random() * 0.02 - 0.01,
        variationPhase: Math.random() * Math.PI * 2,
      };
    });
    setPositions(initialPos);
    setVerticalPos(initialVertical);
    setRacerEffects(initialEffects);
    setWinner(null);
    setTopRacers([]);
    setEvents([]);
    setRaceTime(0);
    raceStartTimeRef.current = null;
    
    // Reset used commentaries for new race - đảm bảo không lặp từ đầu
    usedCommentariesRef.current = {};
    
    // Generate new random obstacles for this race - đảm bảo công bằng
    setObstacles(generateRandomObstacles());
    
    // Preload background music during countdown for instant playback
    preloadBgMusic();
    
    // Countdown
    setCountdown(3);
    playSound('countdown');
    
    setTimeout(() => {
      setCountdown(2);
      playSound('countdown');
    }, 1000);
    
    setTimeout(() => {
      setCountdown(1);
      playSound('countdown');
    }, 2000);
    
    setTimeout(() => {
      setCountdown(ANIMAL_TYPES[animalType].goSound);
      playSound('start');
    }, 3000);
    
    setTimeout(() => {
      setCountdown(null);
      setIsRacing(true);
      raceStartTimeRef.current = Date.now();
      setLastLeader(null);
      showCommentary('start');
      startBgMusic(); // Start background music
      // runRace will be called via useEffect when isRacing becomes true
    }, 3500);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [racers, isRacing, playSound, raceSpeed, showCommentary, startBgMusic]);

  // Main race logic - realistic with fatigue and obstacles
  const runRace = useCallback(() => {
    let raceFinished = false;
    let frameCount = 0;
    let lastFrameTime = performance.now();
    const TARGET_FRAME_TIME = 16.67; // 60fps baseline

    const animate = (currentTime) => {
      if (raceFinished) return;
      frameCount++;
      const now = Date.now();

      // Calculate delta time for frame-rate independent movement
      const deltaTime = currentTime - lastFrameTime;
      lastFrameTime = currentTime;
      const timeScale = Math.min(deltaTime / TARGET_FRAME_TIME, 3); // Cap at 3x to prevent huge jumps
      
      // Update race time
      if (raceStartTimeRef.current) {
        setRaceTime(Math.floor((now - raceStartTimeRef.current) / 1000));
      }
      
      setPositions(prevPos => {
        const newPositions = { ...prevPos };
        const newEffects = {};
        
        // Sort to find rankings
        const sorted = Object.entries(newPositions)
          .sort(([,a], [,b]) => b - a);
        const topIds = sorted.slice(0, 5).map(([id]) => id);
        const maxPos = sorted[0]?.[1] || 0;
        const leaderId = sorted[0]?.[0];
        const leaderRacer = racers.find(r => r.id === leaderId);
        
        // Update top racers every 10 frames
        if (frameCount % 10 === 0) {
          setTopRacers(topIds.map(id => racers.find(r => r.id === id)).filter(Boolean));
        }
        
        // Commentary for leader change - tăng tần suất (mỗi 12 frames)
        if (frameCount % 12 === 0 && leaderRacer) {
          setLastLeader(prev => {
            if (prev && prev !== leaderId && maxPos > 15) {
              showCommentary('overtake', leaderRacer.name);
            } else if (!prev || (frameCount % 48 === 0 && maxPos > 10 && maxPos < 90)) {
              showCommentary('leading', leaderRacer.name);
            }
            return leaderId;
          });
        }
        
        // Commentary for halfway
        if (frameCount === 1 || (maxPos >= 48 && maxPos <= 52 && frameCount % 40 === 0)) {
          if (maxPos >= 48 && maxPos <= 52) showCommentary('halfway');
        }
        
        // Commentary for close race - tăng tần suất (mỗi 35 frames)
        if (frameCount % 35 === 0 && sorted.length >= 2) {
          const gap = sorted[0][1] - sorted[1][1];
          if (gap < 6 && maxPos > 25) {
            showCommentary('close');
          }
        }
        
        // Random commentary (slang + hài) - TĂNG TẦN SUẤT MẠNH
        // Mỗi 45 frames (~0.75s) với 55% cơ hội để bình luận dày và vui hơn
        if (frameCount % 45 === 0 && maxPos > 5 && maxPos < 95) {
          if (Math.random() < 0.55) {
            showCommentary('random');
          }
        }
        
        racers.forEach((racer, idx) => {
          if (raceFinished) return;
          
          const state = racerStatesRef.current[racer.id];
          const currentPos = newPositions[racer.id];
          const currentV = verticalPos[racer.id] || 50;
          
          // Check if stunned
          if (state.isStunned && now < state.stunnedUntil) {
            newEffects[racer.id] = { type: 'stunned', emoji: '💫' };
            return;
          } else if (state.isStunned) {
            state.isStunned = false;
          }
          
          // Find current rank
          const rank = sorted.findIndex(([id]) => id === racer.id) + 1;
          const isLeader = rank === 1;
          const isTop3 = rank <= 3;
          const isTop5 = rank <= 5;
          const isTop10 = rank <= 10;
          
          // === FATIGUE SYSTEM - smoother ===
          if (isLeader && currentPos > 20) {
            state.fatigue += 0.015;
            state.stamina = Math.max(0, state.stamina - 0.025);
          } else if (isTop3 && currentPos > 30) {
            state.fatigue += 0.008;
            state.stamina = Math.max(20, state.stamina - 0.008);
          } else {
            state.fatigue = Math.max(0, state.fatigue - 0.004);
            state.stamina = Math.min(100, state.stamina + 0.015);
          }
          
          // === CALCULATE TARGET SPEED (smoother) ===
          let targetSpeed = state.baseSpeed;
          
          // Fatigue reduces speed more gradually
          const fatigueMultiplier = 1 - (state.fatigue * 0.2);
          targetSpeed *= Math.max(0.65, fatigueMultiplier);
          
          // Stamina affects speed
          const staminaMultiplier = 0.85 + (state.stamina / 100) * 0.15;
          targetSpeed *= staminaMultiplier;
          
          // Smoother sine wave variation
          state.variationPhase += 0.02;
          const smoothVariation = 1 + Math.sin(state.variationPhase) * 0.02 + state.speedVariation * 0.5;
          targetSpeed *= smoothVariation;
          
          // Gentler catch-up
          if (currentPos < maxPos - 30) {
            targetSpeed *= 1.02;
          }
          
          // LERP with much smoother factor for fluid motion
          state.targetSpeed = targetSpeed;
          state.currentSpeed = state.currentSpeed + (targetSpeed - state.currentSpeed) * 0.15;
          
          // Ensure minimum speed to prevent stuttering
          const speed = Math.max(state.currentSpeed, 0.05);
          
          // === OBSTACLE COLLISION - XÁC SUẤT CÔNG BẰNG CHO TẤT CẢ ===
          // Thay vì dựa vào vị trí thực, dùng random chance như nhau cho mọi vịt
          // Điều này đảm bảo không lane nào có lợi thế hơn
          const obstacleChance = 0.003; // ~0.3% mỗi frame - tăng tần suất
          const inObstacleZone = currentPos > 15 && currentPos < 85;
          const shouldHitObstacle = inObstacleZone && Math.random() < obstacleChance && now - state.lastObstacleHit > 2500;
          
          if (shouldHitObstacle) {
            // Random chọn loại vật cản để hiển thị
            const obstacleTypes = [
              { emoji: '🪨', size: 'large', name: 'đá' },
              { emoji: '🪨', size: 'medium', name: 'đá' },
              { emoji: '🪵', size: 'medium', name: 'gỗ' },
              { emoji: '🪵', size: 'large', name: 'gỗ' },
              { emoji: '🌿', size: 'small', name: 'rong' },
              { emoji: '🌀', size: 'medium', name: 'xoáy nước' },
              { emoji: '🦐', size: 'small', name: 'tôm' },
              { emoji: '🐚', size: 'small', name: 'sò' },
            ];
            const obstacle = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            
            state.lastObstacleHit = now;
            state.isStunned = true;
            state.stunnedUntil = now + (obstacle.size === 'large' ? 1200 : obstacle.size === 'medium' ? 800 : 400);
            state.fatigue += obstacle.size === 'large' ? 12 : obstacle.size === 'medium' ? 8 : 4;
            
            newEffects[racer.id] = { 
              type: 'collision', 
              emoji: obstacle.emoji,
              text: obstacle.emoji === '🪨' ? 'Đụng đá!' : obstacle.emoji === '🪵' ? 'Vướng gỗ!' : obstacle.emoji === '🦐' ? 'Tôm kẹp!' : obstacle.emoji === '🐚' ? 'Đạp sò!' : 'Vướng!'
            };
            
            if (isTop5) {
              showCommentary('collision', racer.name);
              const funnyComments = obstacle.emoji === '🪨' 
                ? [
                    'BẤT NGỜ CHƯA BÀ GIÀ! Đá từ đâu ra vậy?! 💫',
                    'KHÓ CHỊU VÔ CÙNG! Đá cứng quá trời!',
                    'E LÀ KHÔNG THỂ né được! Đá to quá!',
                    'CÒN CÁI NỊT sau cú đụng này!',
                    'ĐỈNH NÓC... đụng đá! Đau điếng!',
                    'MỜI XUỐNG HỒ nghỉ sau cú va này! 🤕',
                    'SIÊU TO KHỔNG LỒ cú đụng! Au!',
                    'AI SỢ ĐÁ THÌ ĐI VỀ! Muộn rồi!',
                  ]
                : obstacle.emoji === '🪵' 
                ? [
                    'TUYỆT ĐỐI... vướng gỗ! Xui ghê!',
                    'BẤT NGỜ CHƯA! Gỗ nổi lên đột ngột!',
                    'KHÓ CHỊU VÔ CÙNG với khúc gỗ này!',
                    'E LÀ KHÔNG THỂ tránh được gỗ!',
                    'CÒN CÁI NỊT tốc độ sau vụ này!',
                    'MỜI XUỐNG HỒ gỡ gỗ nào!',
                    'ĐỈNH NÓC... mắc gỗ! Drama!',
                    'XỊN XÒ cú va gỗ này! 🪵',
                  ]
                : obstacle.emoji === '🦐'
                ? [
                    'BẤT NGỜ CHƯA! Tôm càng xanh tấn công!',
                    'KHÓ CHỊU VÔ CÙNG! Tôm kẹp đau quá!',
                    'AI SỢ TÔM THÌ ĐI VỀ! 🦐',
                    'E LÀ KHÔNG THỂ né con tôm hung dữ!',
                  ]
                : obstacle.emoji === '🐚'
                ? [
                    'BẤT NGỜ CHƯA! Sò nằm im mà đạp trúng!',
                    'KHÓ CHỊU VÔ CÙNG! Vỏ sò sắc quá!',
                    'CÒN CÁI NỊT sau khi đạp sò!',
                    'MỜI XUỐNG HỒ băng bó! Đau xót! 🐚',
                  ]
                : [
                    'BẤT NGỜ CHƯA BÀ GIÀ! Đụng cái gì vậy?!',
                    'KHÓ CHỊU VÔ CÙNG! Va phải rồi!',
                    'E LÀ KHÔNG THỂ né được chướng ngại!',
                    'ĐỈNH NÓC... va chạm! Đau điếng! 😭',
                  ];
              setEvents(prev => [
                ...prev.slice(-4),
                { 
                  id: now, 
                  racerName: racer.shortName, 
                  color: racer.color, 
                  emoji: obstacle.emoji,
                  text: obstacle.emoji === '🪨' ? 'ĐỤNG ĐÁ!' : obstacle.emoji === '🪵' ? 'VƯỚNG GỖ!' : obstacle.emoji === '🦐' ? 'TÔM KẸP!' : obstacle.emoji === '🐚' ? 'ĐẠP SÒ!' : 'VA CHẠM!',
                  comment: funnyComments[Math.floor(Math.random() * funnyComments.length)],
                  effect: 'slow'
                }
              ]);
              playSound('event');
            }
            return;
          }
          
          // === RANDOM FATIGUE SPIKE (more frequent) ===
          if (isLeader && currentPos > 40 && Math.random() < 0.002) {
            state.fatigue += 15;
            const animal = ANIMAL_TYPES[animalType];
            newEffects[racer.id] = { type: 'tired', emoji: '😓', text: 'Mệt quá!' };
            showCommentary('tired', racer.name);
            const tiredComments = [
              `SIÊU TO KHỔNG LỒ mệt! ${animal.moveVerb.charAt(0).toUpperCase() + animal.moveVerb.slice(1)} nhanh quá nên hụt hơi! 😮‍💨`,
              'E LÀ KHÔNG THỂ duy trì tốc độ! Dẫn đầu áp lực quá!',
              'Chân mỏi như chạy marathon! Cần massage!',
              'Hết pin rồi! Ai có sạc dự phòng không? 🔋',
              `${animal.name} đang thở oxy! Đuối quá!`,
              `Đuối sức! Ai dẫn đầu người đó mệt!`,
              'KHÓ CHỊU VÔ CÙNG! Hụt hơi rồi! Phổi muốn nổ! 💨',
              'MỜI XUỐNG HỒ nghỉ! Mệt muốn xỉu!',
              'CÒN CÁI NỊT sức lực! Chân như đeo tạ!',
              'TUYỆT ĐỐI... kiệt sức! Cần năng lượng!',
              `BẤT NGỜ mệt quá! ${animal.name} cần nghỉ!`,
              'AI MỆT THÌ ĐI VỀ! Bơi nhiều quá rồi!',
            ];
            setEvents(prev => [
              ...prev.slice(-4),
              { id: now, racerName: racer.shortName, color: racer.color, emoji: '😓', text: 'MỆT QUÁ!', comment: tiredComments[Math.floor(Math.random() * tiredComments.length)], effect: 'slow' }
            ]);
          }
          
          // === RANDOM BOOST - Sudden burst of energy! ===
          if (currentPos > 20 && currentPos < 80 && Math.random() < 0.0015 && state.fatigue < 20) {
            state.fatigue = Math.max(0, state.fatigue - 10);
            state.stamina = Math.min(100, state.stamina + 20);
            state.baseSpeed *= 1.08; // Temporary speed boost
            const animal = ANIMAL_TYPES[animalType];
            newEffects[racer.id] = { type: 'boost', emoji: '🚀', text: 'TURBO!' };
            const boostComments = [
              `SIÊU TO KHỔNG LỒ tốc độ! ${animal.moveVerb.charAt(0).toUpperCase() + animal.moveVerb.slice(1)} nhanh như SpaceX! 🚀`,
              'ĐỈNH NÓC KỊCH TRẦN! Bỗng có sức mạnh bí ẩn!',
              'XỊN XÒ NHƯ CON BÒ! Chân như rocket!',
              'BẤT NGỜ CHƯA! Tăng tốc không ai cản nổi!',
              'E LÀ KHÔNG THỂ đuổi kịp tốc độ này!',
              'TUYỆT ĐỐI được gió thổi! Phê ghê!',
              `AI SỢ THÌ ĐI VỀ! ${animal.name} đang bay! 🦸`,
              "KHÓ CHỊU VÔ CÙNG cho đối thủ! Let's gooo! 🔥",
              'MỜI ĐOÀN MÌNH CỔ VŨ! Turbo mode ON!',
              'CÒN CÁI NỊT cho ai đuổi! Phóng như rocket!',
              'SIÊU tốc độ! Bật chế độ siêu nhanh!',
            ];
            if (isTop10) {
              showCommentary('boost', racer.name);
              setEvents(prev => [
                ...prev.slice(-4),
                { id: now, racerName: racer.shortName, color: racer.color, emoji: '🚀', text: 'TĂNG TỐC!', comment: boostComments[Math.floor(Math.random() * boostComments.length)], effect: 'fast' }
              ]);
              playSound('event');
            }
          }
          
          // === SUDDEN SLOWDOWN - Something happened! ===
          if (isTop5 && currentPos > 30 && currentPos < 85 && Math.random() < 0.0012) {
            state.fatigue += 10;
            state.baseSpeed *= 0.95;
            const animal = ANIMAL_TYPES[animalType];
            newEffects[racer.id] = { type: 'slow', emoji: '🌊', text: 'Gặp khó!' };
            const slowComments = [
              'BẤT NGỜ CHƯA! Sóng to bất ngờ! 🌊',
              `KHÓ CHỊU VÔ CÙNG! ${animal.moveVerb.charAt(0).toUpperCase() + animal.moveVerb.slice(1)} ngược dòng!`,
              'E LÀ KHÔNG THỂ vượt qua sóng dữ này!',
              'MỜI XUỐNG HỒ nghỉ! Dòng nước ngược!',
              `CÒN CÁI NỊT tốc độ! ${animal.name} gặp trở ngại!`,
              'ĐỈNH NÓC... xuống hố! Dòng chảy xiết!',
              'AI SỢ SÓNG THÌ ĐI VỀ! Nước xoáy tấn công!',
              'SIÊU TO sóng! Gặp sóng to như chống bão!',
              'TUYỆT ĐỐI... xui! Bị nước cuốn!',
            ];
            showCommentary('slowdown', racer.name);
            setEvents(prev => [
              ...prev.slice(-4),
              { id: now, racerName: racer.shortName, color: racer.color, emoji: '🌊', text: 'GẶP KHÓ!', comment: slowComments[Math.floor(Math.random() * slowComments.length)], effect: 'slow' }
            ]);
          }
          
          // === COMEBACK - Recovering from behind! ===
          if (rank > 5 && rank <= 15 && currentPos > 35 && Math.random() < 0.001) {
            state.fatigue = Math.max(0, state.fatigue - 15);
            state.stamina = Math.min(100, state.stamina + 30);
            state.baseSpeed *= 1.1;
            const animal = ANIMAL_TYPES[animalType];
            newEffects[racer.id] = { type: 'comeback', emoji: '🔥', text: 'Hồi sinh!' };
            const comebackComments = [
              'ĐỈNH NÓC KỊCH TRẦN comeback! Phượng hoàng tái sinh! 🔥',
              `BẤT NGỜ CHƯA BÀ GIÀ! ${animal.name} lấy lại phong độ!`,
              'E LÀ KHÔNG THỂ dìm được! Hồi sinh mạnh mẽ!',
              'SIÊU TO KHỔNG LỒ comeback! Từ cuối phi lên top!',
              'XỊN XÒ NHƯ CON BÒ! Never give up!',
              'AI SỢ THÌ ĐI VỀ! Lật kèo ngoạn mục!',
              'MỜI ĐOÀN CỔ VŨ! Hồi sinh như zombie!',
              'TUYỆT ĐỐI ĐIỆN ẢNH! Bùng nổ từ đằng sau!',
              'CÒN CÁI NỊT cho ai nói hết hy vọng!',
              'KHÓ CHỊU VÔ CÙNG cho đối thủ! Trở lại rồi!',
            ];
            showCommentary('comeback', racer.name);
            setEvents(prev => [
              ...prev.slice(-4),
              { id: now, racerName: racer.shortName, color: racer.color, emoji: '🔥', text: 'HỒI SINH!', comment: comebackComments[Math.floor(Math.random() * comebackComments.length)], effect: 'fast' }
            ]);
            playSound('event');
          }
          
          // === LUCKY DODGE - Almost hit but dodged! ===
          if (currentPos > 15 && Math.random() < 0.0006) {
            newEffects[racer.id] = { type: 'lucky', emoji: '🍀', text: 'May quá!' };
            const luckyComments = [
              'BẤT NGỜ CHƯA! Suýt đụng mà né kịp! 🍀',
              'SIÊU may mắn! Chướng ngại vật sát mép!',
              'ĐỈNH NÓC né! Né đẹp như Matrix!',
              'XỊN XÒ luck! Thần may mắn phù hộ!',
              'E LÀ KHÔNG... phù! Né được! Pro!',
              'TUYỆT ĐỐI may mắn! Không đụng!',
              'KHÓ CHỊU... cho chướng ngại! Né rồi!',
              'MỜI may mắn tiếp tục! Thoát nạn!',
              'AI SỢ thì đây né được rồi! Hú vía!',
              'CÒN CÁI NỊT cho ai nói xui! May ghê!',
            ];
            if (isTop10) {
              showCommentary('lucky', racer.name);
              setEvents(prev => [
                ...prev.slice(-4),
                { id: now, racerName: racer.shortName, color: racer.color, emoji: '🍀', text: 'NÉ ĐƯỢC!', comment: luckyComments[Math.floor(Math.random() * luckyComments.length)], effect: 'neutral' }
              ]);
            }
          }
          
          // === FISH ENCOUNTER - Funny interaction with fish! ===
          if (currentPos > 25 && currentPos < 75 && Math.random() < 0.0005) {
            const isFriendly = Math.random() > 0.5;
            if (isFriendly) {
              state.fatigue = Math.max(0, state.fatigue - 5);
              newEffects[racer.id] = { type: 'fish', emoji: '🐟', text: 'Gặp cá!' };
              const fishFriendlyComments = [
                'Ô! Gặp đàn cá dẫn đường! Cảm ơn GPS sống! 🐟',
                'Cá nhỏ bơi cùng làm bạn! Dễ thương!',
                'Được cá hộ tống! VIP treatment luôn!',
                'Cá dẫn lối! Như có hoa tiêu riêng!',
                'Đàn cá cổ vũ! Vui quá đi!',
              ];
              if (isTop10) {
                setEvents(prev => [
                  ...prev.slice(-4),
                  { id: now, racerName: racer.shortName, color: racer.color, emoji: '🐟', text: 'CÁ DẪN ĐƯỜNG!', comment: fishFriendlyComments[Math.floor(Math.random() * fishFriendlyComments.length)], effect: 'neutral' }
                ]);
              }
            } else {
              state.fatigue += 3;
              newEffects[racer.id] = { type: 'fish', emoji: '🐠', text: 'Cá quậy!' };
              const fishNaughtyComments = [
                'Ối! Cá cắn chân! Đau xíu! Cá dữ! 🐠',
                'Cá nghịch ngợm quấn chân! Buông ra!',
                'Bị đàn cá làm rối! Phiền quá!',
                'Cá cản đường! Sao cá không thích tui?',
                'Cá troll! Đùa gì mà đau vậy!',
              ];
              if (isTop10) {
                setEvents(prev => [
                  ...prev.slice(-4),
                  { id: now, racerName: racer.shortName, color: racer.color, emoji: '🐠', text: 'CÁ QUẬY!', comment: fishNaughtyComments[Math.floor(Math.random() * fishNaughtyComments.length)], effect: 'slow' }
                ]);
              }
            }
          }
          
          // === CRAMP (more frequent) ===
          if (isTop3 && currentPos > 50 && currentPos < 85 && Math.random() < 0.001) {
            state.isStunned = true;
            state.stunnedUntil = now + 1500;
            state.fatigue += 25;
            const animal = ANIMAL_TYPES[animalType];
            newEffects[racer.id] = { type: 'cramp', emoji: '😵', text: 'Chuột rút!' };
            const crampComments = [
              'ÁI! Chuột rút chân! Đau muốn khóc! 😵',
              `${animal.moveVerb.charAt(0).toUpperCase() + animal.moveVerb.slice(1)} căng quá nên cơ co giật rồi!`,
              `Chân co cứng! Không ${animal.moveVerb} nổi nữa!`,
              'Chuột rút! Phải dừng lại xoa bóp!',
              `${animal.name} quá sức! Chuột rút căng thẳng!`,
              'Ối ối! Cơ bắp phản bội! Đau quá!',
              'Chuột rút! Ai có dầu nóng không?',
              'Chân cứng đơ! Như bị ma nhập!',
              'Chuột rút chân phải! Rồi chân trái! Help!',
            ];
            setEvents(prev => [
              ...prev.slice(-4),
              { id: now, racerName: racer.shortName, color: racer.color, emoji: '😵', text: 'CHUỘT RÚT!', comment: crampComments[Math.floor(Math.random() * crampComments.length)], effect: 'slow' }
            ]);
            playSound('event');
            return;
          }
          
          // Update position (multiply by timeScale for frame-rate independence)
          newPositions[racer.id] = Math.min(100, currentPos + speed * timeScale);
          
          // Show fatigue effect
          if (state.fatigue > 30 && !newEffects[racer.id]) {
            newEffects[racer.id] = { type: 'fatigued', emoji: '💦' };
          }
          
          // Check winner
          if (newPositions[racer.id] >= 100 && !raceFinished) {
            raceFinished = true;
            setWinner(racer);
            setIsRacing(false);
            stopBgMusic(true, 2000); // Stop background music with 2 second fade out
            showCommentary('final', racer.name);
            playSound('win');
          }
        });
        
        // Update effects
        setRacerEffects(prev => ({ ...prev, ...newEffects }));
        
        return newPositions;
      });
      
      // Update vertical wobble for swimming effect - smoother
      if (frameCount % 3 === 0) {
        setVerticalPos(prev => {
          const newV = { ...prev };
          racers.forEach(r => {
            const state = racerStatesRef.current[r.id];
            if (state && !state.isStunned) {
              state.wobble += 0.08;
              newV[r.id] = prev[r.id] + Math.sin(state.wobble) * 0.25;
            }
          });
          return newV;
        });
      }
      
      if (!raceFinished) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [racers, verticalPos, playSound, showCommentary]);

  // Start race animation when isRacing becomes true
  useEffect(() => {
    if (isRacing && !winner) {
      runRace();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRacing]);

  // Reset race
  const resetRace = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    stopBgMusic(); // Stop background music
    
    setIsRacing(false);
    setWinner(null);
    setTopRacers([]);
    setEvents([]);
    setCountdown(null);
    setRaceTime(0);
    setCommentary('');
    setLastLeader(null);
    
    const resetPos = {};
    const resetVertical = {};
    const resetEffects = {};
    const totalRacers = racers.length;
    
    racers.forEach((r, i) => {
      resetPos[r.id] = 0;
      // Smart vertical distribution - USE FULL RIVER WIDTH (5%-95%)
      if (totalRacers <= 10) {
        resetVertical[r.id] = 5 + (i * 90 / Math.max(totalRacers - 1, 1));
      } else if (totalRacers <= 30) {
        const row = i % totalRacers;
        resetVertical[r.id] = 5 + (row * 90 / Math.max(totalRacers - 1, 1));
      } else if (totalRacers <= 50) {
        const row = i % 20;
        const col = Math.floor(i / 20);
        const jitter = col * 2;
        resetVertical[r.id] = 5 + row * 4.5 + jitter;
      } else {
        const row = i % 25;
        const col = Math.floor(i / 25);
        const jitter = col * 1.5;
        resetVertical[r.id] = 5 + row * 3.6 + jitter;
      }
      resetEffects[r.id] = null;
    });
    setPositions(resetPos);
    setVerticalPos(resetVertical);
    setRacerEffects(resetEffects);
  }, [racers]);

  // Screen state: 'setup' or 'racing'
  const [screen, setScreen] = useState('setup');
  
  // Cleanup helper function - stop all audio immediately
  const stopAllAudioImmediate = useCallback(() => {
    // Clear any intervals
    if (bgMusicIntervalRef.current) {
      clearInterval(bgMusicIntervalRef.current);
      bgMusicIntervalRef.current = null;
    }
    
    if (!bgMusicRef.current) return;
    
    // Handle format: { audios: [audio1, audio2], ... }
    if (bgMusicRef.current.audios && Array.isArray(bgMusicRef.current.audios)) {
      bgMusicRef.current.audios.forEach(a => {
        if (a instanceof Audio) {
          a.pause();
          a.currentTime = 0;
          a.src = ''; // Release resource
        }
      });
      bgMusicRef.current = null;
      return;
    }
    
    // Handle single Audio element
    if (bgMusicRef.current instanceof Audio) {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current.src = ''; // Release resource
      bgMusicRef.current = null;
      return;
    }
    
    // Handle AudioContext
    if (bgMusicRef.current.close) {
      bgMusicRef.current.close();
      bgMusicRef.current = null;
    }
  }, []);

  // Cleanup - stop all audio and animation when unmount or tab close
  useEffect(() => {
    // Handle page unload (close tab, navigate away)
    const handleBeforeUnload = () => {
      stopAllAudioImmediate();
    };
    
    // Handle popstate (browser back/forward)
    const handlePopState = () => {
      stopAllAudioImmediate();
    };
    
    // Handle visibility change (switch tab)
    const handleVisibilityChange = () => {
      if (!bgMusicRef.current) return;
      
      // Get active audio element
      let activeAudio = null;
      if (bgMusicRef.current.audios && Array.isArray(bgMusicRef.current.audios)) {
        activeAudio = bgMusicRef.current.audios[bgMusicRef.current.active || 0];
      } else if (bgMusicRef.current instanceof Audio) {
        activeAudio = bgMusicRef.current;
      }
      
      if (!activeAudio) return;
      
      if (document.hidden) {
        // Pause when tab is hidden
        activeAudio.pause();
      } else if (soundEnabled && isRacing) {
        // Resume when tab is visible again
        activeAudio.play().catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [soundEnabled, isRacing]);

  // Cleanup on unmount only - separate effect with empty deps
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Stop all audio when component unmounts
      if (bgMusicIntervalRef.current) {
        clearInterval(bgMusicIntervalRef.current);
      }
      if (bgMusicRef.current) {
        if (bgMusicRef.current.audios) {
          bgMusicRef.current.audios.forEach(a => {
            if (a) { a.pause(); a.src = ''; }
          });
        } else if (bgMusicRef.current instanceof Audio) {
          bgMusicRef.current.pause();
          bgMusicRef.current.src = '';
        }
        bgMusicRef.current = null;
      }
      // Clear commentary timeout
      if (commentaryTimeoutRef.current) {
        clearTimeout(commentaryTimeoutRef.current);
      }
    };
  }, []); // Empty deps = only run on unmount

  // Start race and switch to racing screen
  const handleStartRace = useCallback(() => {
    if (racers.length < 2) return;
    setScreen('racing');
    // Auto fullscreen when entering race
    setTimeout(() => {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      startRace();
    }, 300);
  }, [racers.length, startRace]);

  // Back to setup
  const backToSetup = useCallback(() => {
    // Stop music immediately (no fade out)
    stopBgMusic(false);
    resetRace();
    setScreen('setup');
    // Exit fullscreen when going back
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [resetRace, stopBgMusic]);

  // ============ SETUP SCREEN ============
  if (screen === 'setup') {
    // Ensure not in fullscreen when on setup screen
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    const currentAnimal = ANIMAL_TYPES[animalType];
    return (
      <ToolLayout toolName="Đua Thú Hoạt Hình" toolIcon="🏁" hideFullscreenButton>
        <div className="min-h-[60vh] flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-2xl">
            {/* Compact Header */}
            <div className="text-center mb-3">
              <div className="flex items-center justify-center gap-3 mb-1">
                <span className="text-5xl" style={{ transform: currentAnimal.flipX ? 'scaleX(-1)' : 'none' }}>
                  {currentAnimal.emoji}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-800">ĐUA THÚ HOẠT HÌNH</h1>
              </div>
              <p className="text-gray-500">Nhập tên các {currentAnimal.plural} đua • Mỗi dòng 1 tên</p>
            </div>

            {/* Input Card - Compact */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
              {/* Input Header - Inline */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  <span className="font-bold text-gray-700">Danh sách ({racers.length}/200)</span>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-sm font-bold
                  ${racers.length >= 200 ? 'bg-red-100 text-red-600' : 
                    racers.length >= 100 ? 'bg-orange-100 text-orange-600' : 
                    racers.length >= 2 ? 'bg-green-100 text-green-600' : 
                    'bg-gray-100 text-gray-500'}`}>
                  {racers.length >= 2 ? '✓ Sẵn sàng' : 'Cần ≥2'}
                </div>
              </div>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Minh\nLan\nHùng\nMai\nTùng\n...`}
                className="w-full h-36 sm:h-40 p-3 border-2 border-gray-200 rounded-xl text-base
                  focus:border-blue-400 focus:ring-4 focus:ring-blue-100 
                  transition-all resize-none font-mono bg-gray-50
                  placeholder:text-gray-400 placeholder:whitespace-pre-line"
                autoFocus
              />
              
              {/* Warnings - Compact */}
              {(duplicateNames.length > 0 || racers.length >= 100) && (
                <div className="mt-2 space-y-1">
                  {duplicateNames.length > 0 && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                      <span className="text-amber-700 font-bold">⚠️ Trùng tên: </span>
                      {duplicateNames.map((dup, idx) => (
                        <span key={idx} className="text-amber-600">
                          {dup.name}×{dup.count}{idx < duplicateNames.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                  {racers.length >= 100 && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                      {ANIMAL_TYPES[animalType].emoji} {racers.length >= 150 ? 'Siêu đông! Hiển thị rất nhỏ.' : 'Rất đông! Hiển thị nhỏ.'}
                    </div>
                  )}
                </div>
              )}
              
              {/* Racer Preview - Compact */}
              <div className="mt-2 flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                {racers.slice(0, 30).map((racer, idx) => (
                  <span 
                    key={racer.id}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white
                      ${duplicateNames.some(d => d.name === racer.name) ? 'ring-1 ring-amber-400' : ''}`}
                    style={{ backgroundColor: racer.color }}
                  >
                    <span className="text-xs" style={{ transform: ANIMAL_TYPES[animalType].flipX ? 'scaleX(-1)' : 'none', display: 'inline-block' }}>
                      {ANIMAL_TYPES[animalType].emoji}
                    </span>
                    {racer.name}
                  </span>
                ))}
                {racers.length > 30 && (
                  <span className="text-gray-400 text-xs">+{racers.length - 30} nữa</span>
                )}
              </div>

              {/* Speed & Animal - Combined Row */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Speed Selector */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">⏱️</span>
                    <span className="font-bold text-gray-700">Tốc độ:</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { value: 'very-slow', label: '🚶', name: 'Rất chậm' },
                      { value: 'slow', label: '🏃', name: 'Chậm' },
                      { value: 'normal', label: '🚗', name: 'Vừa' },
                      { value: 'fast', label: '🚀', name: 'Nhanh' },
                      { value: 'very-fast', label: '⚡', name: 'Turbo' },
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setRaceSpeed(option.value)}
                        title={option.name}
                        className={`py-1.5 px-1 rounded-lg font-medium transition-colors text-center border
                          ${raceSpeed === option.value
                            ? 'bg-blue-500 text-white shadow-md border-blue-400'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'}`}
                      >
                        <div className="text-lg leading-none h-6 flex items-center justify-center">{option.label}</div>
                        <div className="text-[10px] mt-0.5 leading-none whitespace-nowrap">{option.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animal Type Selector */}
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">🐾</span>
                    <span className="font-bold text-gray-700">Loài vật:</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {Object.entries(ANIMAL_TYPES).map(([key, animal]) => (
                      <button
                        key={key}
                        onClick={() => setAnimalType(key)}
                        title={animal.name}
                        className={`py-1.5 px-1 rounded-lg font-medium transition-all text-center
                          ${animalType === key
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md scale-105'
                            : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-200'}`}
                      >
                        <div className="text-xl">
                          {renderAnimal(key, '1.25em')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Controls - Compact */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${soundEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {soundEnabled ? '🔊 BẬT' : '🔇 TẮT'}
                </button>

                <button
                  onClick={handleStartRace}
                  disabled={racers.length < 2}
                  className={`flex-1 max-w-xs px-6 py-3 font-black rounded-xl text-lg transition-all
                    ${racers.length < 2
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                    }`}
                >
                  {racers.length < 2 
                    ? `Cần ${2 - racers.length} ${ANIMAL_TYPES[animalType].plural} nữa` 
                    : `🚀 ĐUA ${racers.length} ${ANIMAL_TYPES[animalType].plural.toUpperCase()}!`}
                </button>
              </div>
            </div>

            {/* Tips - Compact */}
            <div className="mt-3 bg-blue-50 rounded-xl p-2 text-center">
              <p className="text-blue-600 text-xs">
                💡 Có vật cản 🪨🪵, mệt khi dẫn đầu, chuột rút & bình luận viên trực tiếp!
              </p>
            </div>
          </div>
        </div>
      </ToolLayout>
    );
  }

  // ============ RACING SCREEN - FULLSCREEN ============
  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black">
      {/* Portrait Mode Warning Overlay */}
      {isPortrait && (
        <div className="absolute inset-0 z-[100] bg-gradient-to-br from-blue-600 to-purple-700 
          flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="text-8xl mb-6 animate-bounce">📱</div>
          <div className="text-6xl mb-4 animate-spin-slow">🔄</div>
          <h2 className="text-2xl font-black mb-3">Xoay ngang màn hình!</h2>
          <p className="text-lg opacity-90 mb-4">
            Để xem cuộc đua tốt nhất, vui lòng xoay điện thoại ngang
          </p>
          <div className="flex items-center gap-2 text-yellow-300">
            <span className="text-2xl">👉</span>
            <span className="font-bold">Landscape Mode</span>
            <span className="text-2xl">👈</span>
          </div>
          <button
            onClick={backToSetup}
            className="mt-8 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full 
              font-bold transition-all"
          >
            ← Quay lại cài đặt
          </button>
        </div>
      )}

      {/* FULLSCREEN RIVER RACE */}
      <div className="relative w-full h-full overflow-hidden">
        
        {/* River background - realistic water gradient */}
        <div className="absolute inset-0" style={{
          background: `
            linear-gradient(180deg, 
              #87CEEB 0%, 
              #5DADE2 5%,
              #3498DB 15%, 
              #2E86AB 30%, 
              #1A5276 50%, 
              #2E86AB 70%, 
              #3498DB 85%,
              #5DADE2 95%,
              #87CEEB 100%
            )`
        }} />
        
        {/* Water surface shine */}
        <div className="absolute inset-0 opacity-30" style={{
          background: `
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 100px,
              rgba(255,255,255,0.1) 100px,
              rgba(255,255,255,0.2) 150px,
              rgba(255,255,255,0.1) 200px,
              transparent 200px
            )`
        }} />
        
        {/* Soft organic waves - layer 1 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute w-[200%] h-full" style={{ animation: 'wave-drift 15s ease-in-out infinite' }}>
            <defs>
              <pattern id="wave1" x="0" y="0" width="200" height="20" patternUnits="userSpaceOnUse">
                <path d="M0,10 Q25,5 50,10 T100,10 T150,10 T200,10" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none"/>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#wave1)" />
          </svg>
        </div>
        
        {/* Soft organic waves - layer 2 (offset) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute w-[200%] h-full" style={{ animation: 'wave-drift-reverse 20s ease-in-out infinite', opacity: 0.7 }}>
            <defs>
              <pattern id="wave2" x="0" y="0" width="150" height="25" patternUnits="userSpaceOnUse">
                <path d="M0,12 Q20,6 40,12 T80,12 T120,12 T150,12" stroke="rgba(173,216,230,0.15)" strokeWidth="1.5" fill="none"/>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#wave2)" />
          </svg>
        </div>
        
        {/* Subtle shimmer effect */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          background: 'radial-gradient(ellipse 100px 30px at 30% 40%, rgba(255,255,255,0.8) 0%, transparent 70%)',
          animation: 'shimmer-move 8s ease-in-out infinite',
        }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          background: 'radial-gradient(ellipse 80px 25px at 70% 60%, rgba(255,255,255,0.8) 0%, transparent 70%)',
          animation: 'shimmer-move 10s ease-in-out infinite reverse',
        }} />
        
        {/* Water ripples/bubbles - fewer and subtler */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={`ripple-${i}`}
              className="absolute rounded-full border border-white/10"
              style={{
                width: `${30 + Math.random() * 30}px`,
                height: `${15 + Math.random() * 15}px`,
                left: `${10 + i * 15}%`,
                top: `${20 + Math.random() * 60}%`,
                animation: `float-ripple ${5 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
        </div>
        
        {/* Sunlight reflection on water */}
        <div className="absolute top-12 left-0 right-0 h-8 opacity-20" style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)'
        }} />
        
        {/* River banks - Top with grass and sand */}
        <div className="absolute top-0 left-0 right-0 h-14 z-10" style={{
          background: 'linear-gradient(180deg, #2D5016 0%, #3D6B22 30%, #4A7C2A 50%, #8B7355 70%, #C4A77D 85%, #5DADE2 100%)'
        }}>
          {/* Grass layer */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-around items-end">
            {[...Array(40)].map((_, i) => (
              <span key={i} className="text-base" style={{ 
                opacity: 0.7 + Math.random() * 0.3,
                transform: `translateY(${Math.random() * 4}px) rotate(${-5 + Math.random() * 10}deg)`
              }}>
                {['🌿', '🌱', '🍃', '🌾'][i % 4]}
              </span>
            ))}
          </div>
          {/* Sand/mud edge */}
          <div className="absolute bottom-0 left-0 right-0 h-3" style={{
            background: 'linear-gradient(180deg, #C4A77D 0%, #A08060 50%, transparent 100%)'
          }} />
        </div>
        
        {/* River banks - Bottom with grass and sand */}
        <div className="absolute bottom-0 left-0 right-0 h-14 z-10" style={{
          background: 'linear-gradient(0deg, #2D5016 0%, #3D6B22 30%, #4A7C2A 50%, #8B7355 70%, #C4A77D 85%, #5DADE2 100%)'
        }}>
          {/* Grass layer */}
          <div className="absolute top-4 left-0 right-0 flex justify-around items-start">
            {[...Array(40)].map((_, i) => (
              <span key={i} className="text-base" style={{ 
                opacity: 0.7 + Math.random() * 0.3,
                transform: `translateY(${-Math.random() * 4}px) rotate(${-5 + Math.random() * 10}deg) scaleY(-1)`
              }}>
                {['🌿', '🌱', '🍃', '🌾'][i % 4]}
              </span>
            ))}
          </div>
          {/* Sand/mud edge */}
          <div className="absolute top-0 left-0 right-0 h-3" style={{
            background: 'linear-gradient(0deg, #C4A77D 0%, #A08060 50%, transparent 100%)'
          }} />
        </div>

        {/* LOGO SOROKID - Watermark giữa sông */}
        <div className="absolute inset-0 z-[5] pointer-events-none select-none flex items-center justify-center" aria-hidden="true">
          <div className="flex items-center gap-2 opacity-[0.12]">
            <LogoIcon size={56} />
            <span className="text-4xl font-black tracking-tight text-white">SoroKid</span>
          </div>
        </div>
        
        {/* Start area */}
        <div className="absolute left-0 top-12 bottom-12 w-20 bg-gradient-to-r from-green-200/40 to-transparent z-5" />
        <div className="absolute left-16 top-12 bottom-12 w-1 bg-white/60 z-15" />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
          <div className="text-white font-black text-sm transform -rotate-90 whitespace-nowrap">
            XUẤT PHÁT
          </div>
        </div>
        
        {/* Finish line */}
        <div className="absolute right-0 top-12 bottom-12 w-20 bg-gradient-to-l from-yellow-200/40 to-transparent z-5" />
        <div className="absolute right-16 top-12 bottom-12 w-3 z-15 overflow-hidden">
          <div className="w-full h-full" style={{
            background: 'repeating-linear-gradient(0deg, white 0px, white 15px, #222 15px, #222 30px)'
          }} />
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl z-20 animate-pulse">🏆</div>

        {/* OBSTACLES - Random mỗi lần đua */}
        {obstacles.map(obs => (
          <div
            key={obs.id}
            className="absolute z-15"
            style={{
              left: `${obs.x}%`,
              top: `${obs.y}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: obs.size === 'large' ? '3rem' : obs.size === 'medium' ? '2.5rem' : '2rem',
              filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))',
            }}
          >
            {obs.emoji}
          </div>
        ))}

        {/* Back button */}
        <button
          onClick={backToSetup}
          className="absolute top-4 left-4 z-30 px-4 py-2 bg-black/50 hover:bg-black/70 
            text-white rounded-full font-bold text-sm transition-all flex items-center gap-2"
        >
          ← Quay lại
        </button>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-4 left-32 z-30 px-3 py-2 bg-black/50 hover:bg-black/70 
            text-white rounded-full font-bold text-sm transition-all"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 left-48 z-30 px-3 py-2 bg-black/50 hover:bg-black/70 
            text-white rounded-full font-bold text-sm transition-all"
          title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
        >
          {isFullscreen ? '⛶' : '⛶'}
        </button>

        {/* Commentary Box */}
        {commentary && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 animate-slideDown">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 
              text-white px-6 py-3 rounded-2xl font-bold text-lg shadow-2xl
              border-2 border-white/50 max-w-xl text-center">
              {/* Render with highlighted names - [[name]] becomes cyan colored */}
              {commentary.split(/\[\[|\]\]/).map((part, i) => 
                i % 2 === 1 ? (
                  <span key={i} className="text-cyan-300 font-black px-1 
                    bg-black/30 rounded mx-0.5 drop-shadow-lg">
                    {part}
                  </span>
                ) : part
              )}
            </div>
          </div>
        )}

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60">
            <div className={`text-[15rem] font-black drop-shadow-2xl
              ${countdown === 'GO!' ? 'text-yellow-300 animate-bounce' : 'text-white animate-pulse'}`}>
              {countdown}
            </div>
          </div>
        )}

        {/* Race info - Top center */}
        {(isRacing || winner) && !countdown && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-25
            bg-black/70 text-white px-8 py-3 rounded-full font-bold text-2xl flex items-center gap-2">
            ⏱️ {raceTime}s | {renderAnimal(animalType, '1.2em')} {racers.length} {ANIMAL_TYPES[animalType].plural}
          </div>
        )}

        {/* TOP 5 Leaderboard - positioned below top bar */}
        {isRacing && topRacers.length > 0 && !countdown && (
          <div className="absolute top-16 right-4 z-25 bg-white/95 rounded-2xl p-3 shadow-2xl min-w-32">
            <div className="text-sm font-black text-gray-700 mb-2 border-b pb-1">🏆 TOP 5</div>
            {topRacers.slice(0, 5).map((racer, idx) => (
              <div key={racer.id} className="flex items-center gap-2 text-sm py-0.5">
                <span className="font-black w-5 text-base" style={{ 
                  color: idx === 0 ? '#fbbf24' : idx === 1 ? '#9ca3af' : idx === 2 ? '#f97316' : '#6b7280' 
                }}>
                  {idx + 1}
                </span>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: racer.color }} />
                <span className="font-semibold">{racer.shortName}</span>
              </div>
            ))}
          </div>
        )}

        {/* Events Log - Left side panel with bigger, clearer display */}
        {events.length > 0 && (
          <div className="absolute top-16 left-4 z-25 w-56">
            <div className="bg-gradient-to-br from-red-600/95 to-orange-600/95 rounded-xl p-3 shadow-2xl border-2 border-yellow-400/50">
              <div className="text-sm font-black text-yellow-300 mb-2 flex items-center gap-2">
                <span className="text-lg animate-bounce">📢</span> ĐANG XẢY RA!
              </div>
              <div className="space-y-2">
                {events.slice(-3).map(event => (
                  <div 
                    key={event.id}
                    className="bg-black/40 rounded-lg p-2 border-l-4"
                    style={{ borderColor: event.color }}
                  >
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-2xl">{event.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{event.racerName}</div>
                        <div className="text-yellow-300 text-xs">{event.text}</div>
                        {event.comment && (
                          <div className="text-white/80 text-[10px] italic mt-0.5">"{event.comment}"</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ALL DUCKS */}
        <div className="absolute inset-0" style={{ top: '48px', bottom: '48px', left: '80px', right: '80px' }}>
          {racers.map((racer) => {
            const position = positions[racer.id] || 0;
            const vPos = verticalPos[racer.id] || 50;
            const effect = racerEffects[racer.id];
            const isWinnerRacer = winner?.id === racer.id;
            const isTop5 = topRacers.slice(0, 5).some(r => r.id === racer.id);
            const isTop10 = topRacers.slice(0, 10).some(r => r.id === racer.id);
            const state = racerStatesRef.current[racer.id];
            const isStunned = state?.isStunned;
            
            // Duck size - MINIMUM 1.8rem so always visible even from distance
            const totalCount = racers.length;
            let duckSize, bandWidth, bandHeight, showEffect, showTrail, showName;
            
            if (totalCount > 150) {
              // 150-200: Still clearly visible
              duckSize = '1.8rem';
              bandWidth = '6px';
              bandHeight = '3px';
              showEffect = isTop5;
              showTrail = false;
              showName = isTop10; // Only show names for top 10
            } else if (totalCount > 100) {
              // 100-150: Good size
              duckSize = '2rem';
              bandWidth = '7px';
              bandHeight = '3px';
              showEffect = isTop10;
              showTrail = false;
              showName = isTop10;
            } else if (totalCount > 50) {
              // 50-100: Medium-large
              duckSize = '2.2rem';
              bandWidth = '8px';
              bandHeight = '4px';
              showEffect = isTop10;
              showTrail = isTop5;
              showName = true;
            } else if (totalCount > 20) {
              // 20-50: Large
              duckSize = '2.5rem';
              bandWidth = '10px';
              bandHeight = '5px';
              showEffect = true;
              showTrail = isTop10;
              showName = true;
            } else {
              // 1-20: Extra large
              duckSize = '3rem';
              bandWidth = '14px';
              bandHeight = '6px';
              showEffect = true;
              showTrail = true;
              showName = true;
            }
            
            // Show name tag based on count - only for some ducks when many
            const nameSize = totalCount > 100 ? 'text-[8px]' : totalCount > 50 ? 'text-[9px]' : totalCount > 20 ? 'text-[10px]' : 'text-xs';
            const namePadding = totalCount > 100 ? 'px-1 py-0' : totalCount > 50 ? 'px-1.5 py-0.5' : 'px-2 py-0.5';
            const nameTop = totalCount > 100 ? '-top-5' : totalCount > 50 ? '-top-6' : '-top-7';
            // Use shortName for cleaner display during race
            const displayName = racer.shortName;
            
            return (
              <div
                key={racer.id}
                className="absolute"
                style={{
                  left: `${Math.min(position, 98)}%`,
                  top: `${vPos}%`,
                  transform: 'translate(-50%, -50%)',
                  transition: isRacing && !winner && !isStunned ? 'none' : 'all 0.3s ease',
                  zIndex: isWinnerRacer ? 100 : isTop5 ? 50 : 10 + Math.floor(position),
                }}
              >
                <div className={`relative 
                  ${isRacing && !winner && !isStunned ? 'animate-duck-swim' : ''} 
                  ${isWinnerRacer ? 'animate-bounce scale-150' : ''}
                  ${isStunned ? 'animate-stunned' : ''}`}
                >
                  {/* Effect indicator - only show for top racers when many */}
                  {effect && showEffect && (
                    <div className={`absolute left-1/2 -translate-x-1/2 animate-bounce whitespace-nowrap
                      ${totalCount > 100 ? '-top-4 text-sm' : '-top-6 text-xl'}`}>
                      {effect.emoji}
                    </div>
                  )}
                  
                  {/* Animal - facing right toward finish line */}
                  <div
                    className="filter drop-shadow-lg"
                    style={{
                      fontSize: duckSize,
                      opacity: isStunned ? 0.6 : 1,
                      transform: ANIMAL_TYPES[animalType].flipX ? 'scaleX(-1)' : 'none',
                      display: 'inline-block',
                      willChange: 'transform',
                    }}
                  >
                    {renderAnimal(animalType, duckSize)}
                  </div>
                  
                  {/* Color band */}
                  <div 
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full shadow"
                    style={{ 
                      backgroundColor: racer.color,
                      width: bandWidth,
                      height: bandHeight,
                    }}
                  />
                  
                  {/* Name tag - conditional based on showName */}
                  {showName && (
                    <div 
                      className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-bold rounded shadow-lg
                        ${nameTop} ${nameSize} ${namePadding}`}
                      style={{ 
                        backgroundColor: racer.color,
                        color: 'white',
                      }}
                    >
                      {displayName}
                    </div>
                  )}
                  
                  {/* Swimming trail - conditional */}
                  {isRacing && !winner && !isStunned && position > 5 && showTrail && (
                    <div className={`absolute left-full top-1/2 -translate-y-1/2 ml-1 opacity-40 animate-trail
                      ${totalCount > 50 ? 'text-xs' : 'text-base'}`}>
                      ~
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Winner celebration */}
        {winner && (
          <div className="absolute inset-0 z-35 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute text-3xl animate-float-up"
                style={{
                  left: `${5 + Math.random() * 90}%`,
                  bottom: '-50px',
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                {['🎉', '🎊', '⭐', '✨', '🌟', '🎆'][i % 6]}
              </div>
            ))}
          </div>
        )}

        {/* Winner Modal - Full overlay with highest z-index */}
        {winner && (
          <div 
            className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-lg"
            style={{ zIndex: 9999 }}
          >
            {/* Fireworks explosions */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div
                  key={`firework-${i}`}
                  className="absolute animate-firework"
                  style={{
                    left: `${10 + (i % 4) * 25}%`,
                    top: `${15 + Math.floor(i / 4) * 30}%`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                >
                  {[...Array(12)].map((_, j) => (
                    <div
                      key={j}
                      className="absolute w-2 h-2 rounded-full animate-firework-particle"
                      style={{
                        backgroundColor: ['#ff0000', '#ffd700', '#00ff00', '#00bfff', '#ff00ff', '#ff8c00'][j % 6],
                        transform: `rotate(${j * 30}deg) translateY(-30px)`,
                        animationDelay: `${i * 0.3}s`,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Flower/Confetti rain */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(40)].map((_, i) => (
                <div
                  key={`flower-${i}`}
                  className="absolute text-2xl animate-flower-fall"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-50px',
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                >
                  {['🌸', '🌺', '🌼', '🌻', '💐', '🎀', '🎊', '🎉', '✨', '⭐'][i % 10]}
                </div>
              ))}
            </div>

            {/* Sparkle bursts */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={`sparkle-${i}`}
                  className="absolute text-4xl animate-sparkle-burst"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                >
                  ✨
                </div>
              ))}
            </div>

            {/* Winner Card - Responsive cho cả portrait và landscape */}
            <div className="winner-card bg-white rounded-3xl shadow-2xl p-3 sm:p-4 max-w-sm w-full mx-4 text-center animate-bounceIn relative overflow-hidden">
              
              {/* Confetti inside card */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 animate-confetti-pop"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      backgroundColor: DUCK_COLORS[i % DUCK_COLORS.length],
                      borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '0' : '50% 0',
                      animationDelay: `${Math.random() * 0.5}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
              </div>

              <div className="winner-content relative z-10">
                {/* Left section: Icon + Trophy */}
                <div className="winner-icon-section">
                  <div className="winner-animal text-5xl sm:text-6xl mb-1 animate-bounce" style={{
                    transform: ANIMAL_TYPES[animalType].flipX ? 'scaleX(-1)' : 'none'
                  }}>
                    {renderAnimal(animalType, '1em')}
                  </div>
                  <div className="winner-trophy text-3xl sm:text-4xl mb-1 animate-pulse">🏆</div>
                </div>

                {/* Middle section: Winner info */}
                <div className="winner-info-section">
                  <h2 className="winner-title text-2xl sm:text-3xl font-black text-gray-800 mb-1 animate-pulse">🎉 VÔ ĐỊCH! 🎉</h2>

                  <div className="winner-name-badge inline-block px-4 py-1.5 rounded-full text-lg sm:text-xl font-bold text-white mb-2 animate-bounce"
                    style={{ backgroundColor: winner.color, boxShadow: `0 0 20px ${winner.color}` }}>
                    {winner.name}
                  </div>

                  <div className="winner-stats text-gray-500 text-sm flex items-center justify-center gap-1">
                    ⏱️ {raceTime}s | {renderAnimal(animalType, '1.2em')} {racers.length} {ANIMAL_TYPES[animalType].plural}
                  </div>
                </div>
                
                {/* Right section: Ranking + Buttons */}
                <div className="winner-actions-section">
                  {/* TOP 5 Final Results */}
                  {topRacers.length > 1 && (
                    <div className="winner-ranking bg-gray-100 rounded-xl p-2 mb-2 text-left max-h-24 overflow-y-auto">
                      <div className="text-xs font-bold text-gray-600 mb-1 text-center">🏅 Bảng xếp hạng</div>
                      {topRacers.slice(0, 5).map((racer, idx) => (
                        <div key={racer.id} className="flex items-center gap-1.5 py-0.5 text-xs">
                          <span className="font-black w-5" style={{ 
                            color: idx === 0 ? '#fbbf24' : idx === 1 ? '#9ca3af' : idx === 2 ? '#f97316' : '#6b7280' 
                          }}>
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                          </span>
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: racer.color }} />
                          <span className="font-medium text-gray-700 truncate text-xs">{racer.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="winner-buttons flex gap-2 justify-center">
                    <button 
                      onClick={backToSetup}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-full text-sm transition-all">
                      ← Setup
                    </button>
                    <button 
                      onClick={() => { resetRace(); setTimeout(() => startRace(), 100); }}
                      className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full text-sm hover:shadow-xl transition-all">
                      🚀 Đua lại!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes duck-swim {
          0%, 100% { transform: rotate(-2deg) translateY(0); }
          50% { transform: rotate(2deg) translateY(-4px); }
        }
        .animate-duck-swim { animation: duck-swim 0.35s ease-in-out infinite; }
        
        @keyframes wave-drift {
          0% { transform: translateX(0); }
          50% { transform: translateX(-100px); }
          100% { transform: translateX(0); }
        }
        
        @keyframes wave-drift-reverse {
          0% { transform: translateX(-50px); }
          50% { transform: translateX(50px); }
          100% { transform: translateX(-50px); }
        }
        
        @keyframes shimmer-move {
          0%, 100% { transform: translateX(0) translateY(0); opacity: 0.03; }
          50% { transform: translateX(100px) translateY(10px); opacity: 0.06; }
        }
        
        @keyframes water-flow {
          0% { background-position-x: 0; }
          100% { background-position-x: 300px; }
        }
        .animate-water-flow { animation: water-flow 10s linear infinite; }
        
        @keyframes trail {
          0% { opacity: 0.4; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(12px); }
        }
        .animate-trail { animation: trail 0.25s ease-out infinite; }
        
        @keyframes stunned {
          0%, 100% { transform: rotate(-12deg); }
          50% { transform: rotate(12deg); }
        }
        .animate-stunned { animation: stunned 0.15s ease-in-out infinite; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        
        @keyframes float-up {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-500px) rotate(360deg); opacity: 0; }
        }
        .animate-float-up { animation: float-up 3s ease-out forwards; }
        
        @keyframes float-ripple {
          0%, 100% { transform: translateX(0) scale(1); opacity: 0.15; }
          50% { transform: translateX(15px) scale(1.1); opacity: 0.25; }
        }
        
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti 2s ease-out forwards; }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounceIn { animation: bounceIn 0.5s ease-out; }
        
        @keyframes slideDown {
          0% { transform: translateX(-50%) translateY(-30px); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        .animate-slideDown { animation: slideDown 0.4s ease-out; }
        
        @keyframes firework {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-firework { animation: firework 1.5s ease-out infinite; }
        
        @keyframes firework-particle {
          0% { transform: rotate(var(--rotation, 0deg)) translateY(0) scale(1); opacity: 1; }
          100% { transform: rotate(var(--rotation, 0deg)) translateY(-80px) scale(0); opacity: 0; }
        }
        .animate-firework-particle { animation: firework-particle 1.5s ease-out infinite; }
        
        @keyframes flower-fall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          50% { transform: translateY(50vh) rotate(180deg) scale(1.2); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg) scale(0.8); opacity: 0; }
        }
        .animate-flower-fall { animation: flower-fall 4s ease-in-out infinite; }
        
        @keyframes sparkle-burst {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
        .animate-sparkle-burst { animation: sparkle-burst 1.5s ease-out infinite; }
        
        @keyframes confetti-pop {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
          100% { transform: scale(0) rotate(360deg) translateY(50px); opacity: 0; }
        }
        .animate-confetti-pop { animation: confetti-pop 1.5s ease-out infinite; }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        
        /* === Winner Card Landscape Responsive === */
        @media (orientation: landscape) and (max-height: 500px) {
          .winner-card {
            max-width: 42rem;
            max-height: 90vh;
            padding: 0.75rem;
          }
          .winner-content {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .winner-icon-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex-shrink: 0;
          }
          .winner-animal {
            font-size: 2.5rem;
            margin-bottom: 0;
          }
          .winner-trophy {
            font-size: 1.5rem;
            margin-bottom: 0;
          }
          .winner-info-section {
            flex: 1;
            text-align: left;
          }
          .winner-title {
            font-size: 1.25rem;
            margin-bottom: 0.25rem;
          }
          .winner-name-badge {
            font-size: 1rem;
            padding: 0.25rem 0.75rem;
            margin-bottom: 0.25rem;
          }
          .winner-stats {
            font-size: 0.75rem;
          }
          .winner-actions-section {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            flex-shrink: 0;
            width: 11rem;
          }
          .winner-ranking {
            margin-bottom: 0;
            max-height: 5rem;
          }
          .winner-buttons {
            flex-direction: column;
            gap: 0.25rem;
          }
          .winner-buttons button {
            width: 100%;
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
