/**
 * 🎭 NARRATIVE CONFIG - Hệ Thống Lời Dẫn Phiêu Lưu
 * 
 * Toàn bộ lời hướng dẫn được viết theo phong cách:
 * - Cốt truyện bí ẩn
 * - Nhân vật dẫn chuyện
 * - Khơi gợi tò mò
 * - KHÔNG dạy học - CHỈ mời gọi khám phá
 */

// ============================================================
// 📜 CỐT TRUYỆN TỔNG QUAN - STORY OVERVIEW
// ============================================================
export const STORY_OVERVIEW = {
  // Mở đầu - Khi học sinh lần đầu vào game
  prologue: {
    title: "Huyền Thoại Kho Báu Tri Thức",
    scenes: [
      {
        id: 'scene_1',
        background: 'mystical-forest',
        narrative: "Ngày xưa, có một Kho Báu Tri Thức được các bậc thầy cổ đại cất giữ..."
      },
      {
        id: 'scene_2', 
        background: 'ancient-temple',
        narrative: "Họ dùng một công cụ thần kỳ gọi là Bàn Tính Soroban để bảo vệ kho báu."
      },
      {
        id: 'scene_3',
        background: 'owl-appears',
        narrative: "Cú Soro - Người Gác Kho Báu - đã chờ hàng ngàn năm để tìm người xứng đáng."
      },
      {
        id: 'scene_4',
        background: 'hero-chosen',
        narrative: "Và hôm nay... người đó chính là CON! Hãy cùng Soro khám phá nào!"
      }
    ]
  },

  // Tóm tắt hành trình - Hiển thị trên Map
  journeySummary: {
    title: "Hành Trình Tìm Kho Báu",
    description: "Vượt qua 5 vùng đất bí ẩn để đến được Kho Báu Tri Thức!",
    chapters: [
      {
        chapter: 1,
        zone: 'village-start',
        title: "🏘️ Làng Bàn Tính Thần Kỳ",
        shortDesc: "Nơi khởi đầu - Làm quen công cụ bí ẩn",
        storyBeat: "Con sẽ nhận được Bàn Tính Soroban - công cụ của các bậc thầy cổ đại."
      },
      {
        chapter: 2,
        zone: 'forest-add-basic',
        title: "🌲 Rừng Cộng Đơn",
        shortDesc: "Vùng rừng - Nơi các số hợp nhất",
        storyBeat: "Trong khu rừng này, các con số muốn đến gần nhau. Con sẽ học cách giúp chúng!"
      },
      {
        chapter: 3,
        zone: 'valley-subtract',
        title: "🏔️ Thung Lũng Trừ",
        shortDesc: "Thung lũng - Nơi số nhỏ đi",
        storyBeat: "Có những con số cần được giải phóng. Con sẽ học phép thuật 'trừ' tại đây!"
      },
      {
        chapter: 4,
        zone: 'hill-big-friend',
        title: "⭐ Đồi Bạn Lớn",
        shortDesc: "Ngọn đồi - Bí mật số 10",
        storyBeat: "Bạn Lớn - chìa khóa quan trọng nhất! Ai nắm được sẽ tính siêu nhanh!"
      },
      {
        chapter: 5,
        zone: 'tower-combine',
        title: "🏛️ Đài Kết Hợp",
        shortDesc: "Ngọn tháp - Nơi sức mạnh hội tụ",
        storyBeat: "Kết hợp tất cả sức mạnh để mở cánh cổng cuối cùng đến Kho Báu!"
      }
    ],
    finale: {
      title: "🏆 Kho Báu Tri Thức",
      description: "Con đã trở thành Bậc Thầy Soroban! Kho báu mãi thuộc về con!"
    }
  },

  // Lời dẫn khi chuyển chương
  chapterTransitions: {
    1: {
      entering: "Hú hú! Chào mừng đến Làng Bàn Tính! Đây là nơi mọi hành trình bắt đầu.",
      leaving: "Con đã sẵn sàng rời Làng Bàn Tính. Rừng Cộng Đơn đang vẫy gọi!"
    },
    2: {
      entering: "Con đã đến Rừng Cộng Đơn! Nghe này... các con số đang thì thầm gọi nhau.",
      leaving: "Tuyệt vời! Con đã thuần phục Rừng Cộng. Thung Lũng Trừ chờ phía trước!"
    },
    3: {
      entering: "Thung Lũng Trừ đây rồi! Nơi này có chút lạnh lẽo... vì số đang nhỏ dần.",
      leaving: "Con đã vượt qua Thung Lũng! Đồi Bạn Lớn với bí mật số 10 đang chờ!"
    },
    4: {
      entering: "Wow! Đồi Bạn Lớn! Từ đây con sẽ thấy cả thế giới số khác biệt!",
      leaving: "Bạn Lớn đã trở thành đồng minh của con! Chỉ còn Đài Kết Hợp nữa thôi!"
    },
    5: {
      entering: "Đài Kết Hợp - thử thách cuối cùng! Dùng hết sức mạnh con có nhé!",
      leaving: "TUYỆT VỜI! Con đã mở được cánh cổng Kho Báu Tri Thức! 🏆"
    }
  }
};

// ============================================================
// 🎮 LỜI DẪN TRONG GAME (Practice/Compete)
// ============================================================
export const GAMEPLAY_NARRATIVES = {
  // Bắt đầu game
  gameStart: [
    "Hú hú! Cú Soro đây! Hành trình bắt đầu rồi. Mỗi câu đúng sẽ mở một cánh cửa bí mật!",
    "Sẵn sàng chưa nhà thám hiểm? Kho báu đang chờ con phía trước!",
    "Cú Soro sẽ đi cùng con! Hãy dùng sức mạnh bàn tính để vượt qua nhé!"
  ],
  
  // Trước mỗi câu hỏi
  beforeQuestion: [
    "Ồ, có gì đang chắn đường kìa! Dùng bàn tính giải quyết nó thôi!",
    "Thử thách tiếp theo đây! Soro tin con làm được!",
    "Một cánh cửa bí mật... Cần phép tính để mở!"
  ],
  
  // Khi trả lời đúng
  onCorrect: [
    "Hú hú! Giỏi lắm! Soro biết con làm được mà. Đi tiếp thôi!",
    "Tuyệt vời! Cánh cửa đã mở. Tiến lên nào!",
    "Chính xác! Trí tuệ của con tỏa sáng rồi đó!"
  ],
  
  // Khi trả lời sai
  onIncorrect: [
    "Sai một chút thôi! Nhà thám hiểm giỏi không bỏ cuộc. Thử lần nữa nhé!",
    "Ối, chưa đúng rồi! Không sao, Soro tin con!",
    "Hmm, cánh cửa chưa mở. Bình tĩnh tính lại nào!"
  ],
  
  // Khi chuyển màn / milestone
  onLevelUp: [
    "Hú hú! Lên cấp rồi! Thử thách mới đang chờ. Soro sẽ đi cùng con!",
    "Wow! Con đã tiến xa hơn! Vùng đất mới có phép tính thú vị hơn đấy!",
    "Tuyệt vời! Một chặng đường đã xong. Sẵn sàng cho chặng tiếp chưa?"
  ],
  
  // Khi gần hoàn thành (80%+)
  nearFinish: [
    "Soro nghe thấy tiếng kho báu lấp lánh! Chỉ còn vài bước nữa thôi. Cố lên!",
    "Ánh sáng kho báu đang le lói phía trước! Gần đến đích lắm rồi!",
    "Hú hú! Sắp tới nơi rồi! Tập trung cho những câu cuối nhé!"
  ],
  
  // Khi hoàn thành game (thắng)
  onVictory: [
    "Con đã tìm thấy kho báu tri thức! Soro tự hào về con lắm. Hẹn gặp ở chuyến phiêu lưu sau!",
    "Hú hú! Nhà thám hiểm xuất sắc! Kho báu thuộc về con rồi!",
    "Tuyệt vời! Trí tuệ của con đã chinh phục thử thách! 🏆"
  ],
  
  // Khi chưa đạt yêu cầu
  onDefeat: [
    "Chưa đủ điểm lần này... Nhưng nhà thám hiểm giỏi không bỏ cuộc! Thử lại nhé!",
    "Kho báu chưa mở... Luyện tập thêm rồi quay lại, Soro chờ con!",
    "Đừng buồn! Mỗi lần thử là một lần mạnh hơn. Cố lên nào!"
  ]
};

// ============================================================
// 🦉 NHÂN VẬT DẪN CHUYỆN - CÚ SORO
// ============================================================
export const NARRATOR = {
  id: 'soro',
  name: 'Cú Soro',
  title: 'Người Gác Kho Báu Tri Thức',
  emoji: '🦉',
  avatar: '/images/guide/owl-soro.png',
  
  // Đặc điểm giọng nói
  voiceStyle: {
    tone: 'ấm áp, bí ẩn, truyền cảm',
    pace: 'chậm rãi khi kể chuyện, nhanh khi kịch tính',
    personality: 'khôn ngoan nhưng vui tính, luôn khơi gợi tò mò',
    avoidWords: ['bấm', 'làm bài', 'học', 'hoàn thành', 'phép tính', 'toán'],
    useWords: ['bí mật', 'khám phá', 'sức mạnh', 'cổ xưa', 'huyền thoại', 'kho báu']
  },

  // Âm thanh nền đề xuất
  ambientSounds: {
    map: 'forest-ambient.mp3',        // Tiếng rừng nhẹ, bí ẩn
    lesson: 'mystical-bells.mp3',     // Tiếng chuông huyền bí
    practice: 'adventure-theme.mp3',   // Nhạc phiêu lưu
    compete: 'battle-drums.mp3',       // Trống trận kịch tính
    mental: 'mind-focus.mp3',          // Tiếng thiền định, tập trung
    flash: 'lightning-tension.mp3',    // Âm thanh căng thẳng, nhanh
    victory: 'triumph-fanfare.mp3',    // Nhạc chiến thắng
    unlock: 'magic-unlock.mp3'         // Âm thanh mở khóa bí mật
  }
};

// ============================================================
// 🗺️ LỜI DẪN CHO MAP - Adventure Map
// ============================================================
export const MAP_NARRATIVES = {
  // Khi mới vào Map
  entrance: [
    {
      layer: 'hook', // Lớp 1 - Gợi chuyện
      lines: [
        "Shh... con có nghe thấy không? Tiếng gọi của Kho Báu Tri Thức...",
        "Từ rất lâu rồi, ta đã chờ đợi một nhà thám hiểm như con...",
        "Bản đồ này... không phải bản đồ thường. Mỗi con đường đều ẩn chứa bí mật.",
        "Ta là Cú Soro, Người Gác Kho Báu. Và con... là người được chọn."
      ]
    },
    {
      layer: 'action', // Lớp 2 - Dẫn hành động
      lines: [
        "Những vùng đất đang chờ con khám phá... Mỗi nơi đều có sức mạnh riêng.",
        "Con thấy ánh sáng lấp lánh kia không? Đó là nơi con có thể bắt đầu...",
        "Đừng vội... hãy cảm nhận con đường trước khi bước đi."
      ]
    }
  ],

  // Khi mở khóa zone mới
  zoneUnlock: [
    "Ồ! Con đã làm được rồi... Một cánh cổng mới đang mở ra!",
    "Sức mạnh của con đã đánh thức vùng đất này khỏi giấc ngủ dài...",
    "Ta cảm nhận được... con đã sẵn sàng cho thử thách tiếp theo.",
    "Ánh sáng đang lan tỏa... Con đường phía trước đã hiện ra!"
  ],

  // Khi zone còn khóa
  zoneLocked: [
    "Hmm... cánh cổng này chưa chịu mở. Sức mạnh của con chưa đủ...",
    "Có điều gì đó đang giữ chặt nơi này... Con cần mạnh hơn nữa.",
    "Bí mật ở đây rất sâu... Hãy chinh phục những thử thách trước đã.",
    "Đừng vội... mọi thứ đều có thời điểm của nó."
  ],

  // Khi hoàn thành zone
  zoneComplete: [
    "Phi thường! Vùng đất này đã công nhận sức mạnh của con!",
    "Ta đã biết con làm được... Kho báu ở đây giờ thuộc về con.",
    "Một phần bí mật đã được hé lộ... Nhưng vẫn còn nhiều điều chờ phía trước!",
    "Sức mạnh tri thức trong con đang lớn dần từng ngày..."
  ]
};

// ============================================================
// 📚 LỜI DẪN CHO BÀI HỌC - Lessons
// ============================================================
export const LESSON_NARRATIVES = {
  // === CHƯƠNG 1: LÀNG BÀN TÍNH (Level 1) ===
  level_1: {
    intro: {
      hook: [
        "Nhìn kìa... Một vật thể cổ xưa đang phát sáng trước mặt con.",
        "Đây là Bàn Tính Thần Kỳ - công cụ của các bậc thầy từ ngàn năm trước.",
        "Những hạt tròn này... không chỉ là hạt. Chúng chứa đựng sức mạnh của những con số."
      ],
      action: [
        "Hãy chạm vào chúng... Cảm nhận cách chúng di chuyển...",
        "Mỗi hạt đều có một linh hồn riêng. Con có muốn đánh thức chúng không?"
      ],
      feedback: [
        "Tuyệt vời... Con đã bắt đầu hiểu ngôn ngữ của bàn tính!",
        "Những hạt đang thì thầm với con rồi đó... Con có nghe thấy không?"
      ]
    },
    lessons: {
      1: { // Lesson 1
        hook: "Mỗi con số đều có một hình dạng riêng trên bàn tính...",
        action: "Hãy khám phá cách những hạt tạo nên các con số từ 0 đến 9...",
        feedback: "Con đã nắm được bí mật đầu tiên! Số 0 đến 9 đã trở thành bạn của con."
      },
      2: {
        hook: "Nhưng khoan... còn những số lớn hơn thì sao?",
        action: "Bí mật nằm ở những cột bên cạnh... Hãy để chúng kể cho con nghe.",
        feedback: "Ồ! Con đã mở khóa sức mạnh của số có 2 chữ số!"
      }
    }
  },

  // === CHƯƠNG 2: RỪNG CỘNG ĐƠN (Level 2-3) ===
  level_2: {
    intro: {
      hook: [
        "Chào mừng đến Rừng Cộng Đơn... Nơi những con số muốn được hợp nhất.",
        "Ở đây, các con số không đứng một mình. Chúng muốn đến với nhau..."
      ],
      action: [
        "Khi hai con số gặp nhau, điều kỳ diệu sẽ xảy ra...",
        "Hãy để những hạt bàn tính dẫn lối cho con."
      ],
      feedback: [
        "Con đã cảm nhận được sức mạnh của sự hợp nhất!",
        "Những con số đang nhảy múa cùng con rồi đó!"
      ]
    },
    lessons: {
      1: {
        hook: "Đơn giản thôi... khi có đủ chỗ, các hạt sẽ tự tìm đến nhau.",
        action: "Hãy thử cho chúng gặp nhau xem...",
        feedback: "Hoàn hảo! Con đã hiểu cách các hạt hợp nhất khi có đủ không gian."
      }
    }
  },

  level_3: {
    intro: {
      hook: [
        "Nhưng... điều gì xảy ra khi không còn đủ chỗ?",
        "Ta sẽ tiết lộ cho con một bí mật cổ xưa: Công Thức Bạn Nhỏ!"
      ],
      action: [
        "Bạn Nhỏ là những cặp số có tổng bằng 5... Chúng luôn giúp đỡ nhau.",
        "1 và 4... 2 và 3... Chúng là đôi bạn thân không thể tách rời."
      ],
      feedback: [
        "Tuyệt vời! Con đã kết bạn với Bạn Nhỏ!",
        "Bí mật của số 5 giờ đã thuộc về con!"
      ]
    },
    lessons: {
      1: {
        hook: "Khi cột hạt Đất đầy... Bạn Nhỏ sẽ xuất hiện để giúp con.",
        action: "Hãy gọi hạt Trời xuống và Bạn Nhỏ sẽ ra đi...",
        feedback: "Xuất sắc! Con đã biết cách dùng Bạn Nhỏ khi cộng!"
      }
    }
  },

  // === CHƯƠNG 3: THUNG LŨNG TRỪ (Level 4) ===
  level_4: {
    intro: {
      hook: [
        "Thung Lũng Trừ... Nơi con học cách chia sẻ sức mạnh.",
        "Đôi khi, các con số cần nhỏ đi để lớn mạnh hơn..."
      ],
      action: [
        "Khi con lấy đi một phần, phần còn lại sẽ hiện ra...",
        "Bạn Nhỏ vẫn ở đây, nhưng lần này chúng giúp con theo cách khác."
      ],
      feedback: [
        "Con đã hiểu nghệ thuật của sự cân bằng!",
        "Biết cho đi cũng là một sức mạnh, con ạ."
      ]
    }
  },

  // === CHƯƠNG 4: ĐỒI BẠN LỚN (Level 5-6) ===
  level_5: {
    intro: {
      hook: [
        "Đồi Bạn Lớn... Nơi ẩn chứa bí mật mạnh mẽ nhất!",
        "Bạn Lớn là những cặp số có tổng bằng 10. Sức mạnh của chúng vượt xa Bạn Nhỏ!"
      ],
      action: [
        "9 và 1... 8 và 2... 7 và 3... 6 và 4...",
        "Khi con vượt qua ranh giới 10, Bạn Lớn sẽ dẫn đường."
      ],
      feedback: [
        "Phi thường! Con đã nắm giữ sức mạnh của số 10!",
        "Bạn Lớn đã công nhận con là bạn của chúng!"
      ]
    }
  },

  level_6: {
    intro: {
      hook: [
        "Nhưng Bạn Lớn không chỉ giúp cộng... Chúng còn giúp con trừ qua 10!",
        "Đây là kỹ năng mà ít nhà thám hiểm nào nắm được..."
      ],
      action: [
        "Khi cần trừ mà không đủ hạt, hãy nhờ Bạn Lớn...",
        "Mượn 10 từ cột bên trái, rồi trả lại phần thừa."
      ],
      feedback: [
        "Xuất sắc! Con đã làm chủ cả hai chiều của Bạn Lớn!",
        "Sức mạnh của con giờ đã hoàn chỉnh hơn rất nhiều!"
      ]
    }
  },

  // === CHƯƠNG 5: ĐÀI KẾT HỢP (Level 7) ===
  level_7: {
    intro: {
      hook: [
        "Đài Kết Hợp... Nơi tất cả sức mạnh hội tụ!",
        "Bạn Nhỏ và Bạn Lớn... khi kết hợp sẽ tạo nên phép thuật mạnh nhất!"
      ],
      action: [
        "Đôi khi con cần cả hai công thức trong một phép tính...",
        "Hãy lắng nghe... bàn tính sẽ mách bảo con dùng công thức nào."
      ],
      feedback: [
        "TUYỆT ĐỈNH! Con đã thành thạo nghệ thuật kết hợp!",
        "Từ giờ, không phép cộng trừ nào có thể làm khó con!"
      ]
    }
  },

  // === CHƯƠNG 6: VƯƠNG QUỐC SỐ LỚN (Level 8-10) ===
  level_8: {
    intro: {
      hook: [
        "Chào mừng đến Vương Quốc Số Lớn!",
        "Những con số ở đây... to lớn và hùng mạnh hơn nhiều."
      ],
      action: [
        "Số có 3, 4 chữ số... chúng không đáng sợ như con nghĩ.",
        "Cách tính vẫn như cũ, chỉ là nhiều cột hơn thôi."
      ],
      feedback: [
        "Con đã chinh phục được các số lớn!",
        "Vương quốc này giờ đã mở cửa chào đón con!"
      ]
    }
  },

  // === CHƯƠNG 7: HANG ĐỘNG NHÂN (Level 11-12) ===
  level_11: {
    intro: {
      hook: [
        "Hang Động Nhân... Nơi các con số nhân đôi sức mạnh của mình!",
        "Phép nhân không phải là cộng nhiều lần... mà là nghệ thuật tạo ra số mới."
      ],
      action: [
        "Bảng cửu chương là chìa khóa vào hang động này...",
        "Hãy để ta dẫn con qua từng bước."
      ],
      feedback: [
        "Tuyệt vời! Con đã nắm được sức mạnh của phép nhân!",
        "Những con số giờ có thể nhân bản theo ý con muốn!"
      ]
    }
  },

  // === CHƯƠNG 8: HỒ CHIA (Level 13-14) ===
  level_13: {
    intro: {
      hook: [
        "Hồ Chia... Mặt nước trong vắt phản chiếu nghệ thuật chia đều.",
        "Phép chia là ngược lại của nhân... nhưng cũng đẹp đẽ không kém."
      ],
      action: [
        "Khi chia, con đang tìm xem một số chứa bao nhiêu lần số khác...",
        "Hãy từ từ... mặt hồ sẽ chỉ cho con câu trả lời."
      ],
      feedback: [
        "Con đã làm chủ cả 4 phép tính cơ bản!",
        "Sức mạnh của con giờ đã toàn diện rồi!"
      ]
    }
  },

  // === CHƯƠNG 9: THÁP TÍNH NHẨM (Level 15-16) ===
  level_15: {
    intro: {
      hook: [
        "Tháp Tính Nhẩm... Nơi sức mạnh nằm trong tâm trí!",
        "Ở đây, con không cần bàn tính vật lý... vì bàn tính đã ở trong đầu con."
      ],
      action: [
        "Hãy nhắm mắt lại... tưởng tượng bàn tính trước mặt...",
        "Các hạt di chuyển trong tâm trí con... và đáp án sẽ hiện ra."
      ],
      feedback: [
        "ĐÁNG KINH NGẠC! Con đã đạt đến trình độ Siêu Trí Tuệ!",
        "Tâm trí con giờ là một siêu máy tính!"
      ]
    }
  },

  // === CHƯƠNG 10: ĐỈNH CAO TIA CHỚP (Level 17-18) ===
  level_17: {
    intro: {
      hook: [
        "Đỉnh Cao Tia Chớp... Thử thách cuối cùng và khó nhất!",
        "Ở đây, mọi thứ diễn ra trong tích tắc... Không có thời gian suy nghĩ!"
      ],
      action: [
        "Các con số lóe lên như tia chớp... Con phải bắt lấy chúng bằng trực giác!",
        "Tin vào bản năng... tâm trí con nhanh hơn con tưởng."
      ],
      feedback: [
        "HUYỀN THOẠI! Con đã đạt đến đỉnh cao của Tia Chớp!",
        "Rất ít người có thể làm được điều này... Con thật đặc biệt!"
      ]
    }
  }
};

// ============================================================
// 💪 LỜI DẪN CHO LUYỆN TẬP - Practice
// ============================================================
export const PRACTICE_NARRATIVES = {
  // Khi chọn mode
  modeSelection: {
    hook: [
      "Hmm... con muốn rèn luyện sức mạnh nào hôm nay?",
      "Mỗi con đường đều dẫn đến sức mạnh khác nhau...",
      "Ta thấy tiềm năng trong con... Hãy chọn thử thách của mình."
    ],
    modes: {
      addition: {
        name: "Sức Mạnh Hợp Nhất",
        hook: "Con muốn luyện sức mạnh hợp nhất các con số?",
        action: "Hãy để các con số tìm đến nhau..."
      },
      subtraction: {
        name: "Nghệ Thuật Cân Bằng", 
        hook: "Đôi khi sức mạnh đến từ việc buông bỏ...",
        action: "Hãy tìm sự cân bằng trong mỗi phép tính..."
      },
      addSubMixed: {
        name: "Vũ Điệu Cộng Trừ",
        hook: "Cộng và trừ đan xen như một vũ điệu...",
        action: "Hãy nhảy theo nhịp của những con số..."
      },
      multiplication: {
        name: "Bí Thuật Nhân Bản",
        hook: "Sức mạnh nhân đôi đang chờ con...",
        action: "Hãy khiến các con số nhân bản theo ý muốn..."
      },
      division: {
        name: "Nghệ Thuật Phân Chia",
        hook: "Chia đều là một nghệ thuật cao quý...",
        action: "Hãy tìm sự công bằng trong mỗi con số..."
      },
      mulDiv: {
        name: "Song Kiếm Nhân Chia",
        hook: "Nhân và chia như hai thanh kiếm song song...",
        action: "Hãy múa cả hai một cách điêu luyện..."
      },
      mixed: {
        name: "Tứ Đại Nguyên Tố",
        hook: "Cộng, trừ, nhân, chia - bốn nguyên tố hợp nhất...",
        action: "Chỉ bậc thầy mới làm chủ được cả bốn!"
      }
    }
  },

  // Khi bắt đầu luyện tập
  start: [
    "Thử thách bắt đầu... Hãy để trực giác dẫn lối!",
    "Những con số đang thức dậy... Con có sẵn sàng không?",
    "Ta sẽ theo dõi con từ đây... Hãy cho ta thấy sức mạnh của con!"
  ],

  // Difficulty descriptions
  difficulty: {
    1: { name: "Tập Sự", desc: "Những bước đi đầu tiên trên con đường..." },
    2: { name: "Chiến Binh", desc: "Con đã bắt đầu mạnh mẽ hơn..." },
    3: { name: "Dũng Sĩ", desc: "Thử thách đang trở nên thú vị..." },
    4: { name: "Cao Thủ", desc: "Chỉ những người thật sự giỏi mới đến được đây..." },
    5: { name: "Huyền Thoại", desc: "Đây là thử thách của những huyền thoại!" },
    6: { name: "Siêu Huyền Thoại", desc: "Rất ít người dám bước vào đây..." }
  },

  // Phản hồi đúng
  correct: {
    normal: [
      "Đúng rồi... Sức mạnh đang chảy trong con.",
      "Hmm, tốt lắm... Con đang tiến bộ.",
      "Những con số đã khuất phục trước con.",
      "Ta biết con làm được mà..."
    ],
    fast: [
      "NHANH QUÁ! Con như một tia chớp!",
      "Tốc độ đáng kinh ngạc! Bàn tính đang rung chuyển!",
      "Con nhanh hơn cả ta tưởng!",
      "SIÊU TỐC! Đó mới là sức mạnh thực sự!"
    ],
    godlike: [
      "KHÔNG THỂ TIN NỔI! Con là thiên tài!",
      "THẦN TỐC! Ta chưa từng thấy ai nhanh như vậy!",
      "PHI THƯỜNG! Con đang viết lại lịch sử!",
      "ĐỈNH CỦA ĐỈNH! Các bậc thầy cũng phải ngả mũ!"
    ],
    streak: {
      3: "COMBO 3! Sức mạnh đang tích tụ!",
      5: "COMBO 5! Không ai cản nổi con!",
      7: "COMBO 7! Con đang bất bại!",
      10: "COMBO 10! HUYỀN THOẠI ĐANG THỨC GIẤC!"
    }
  },

  // Phản hồi sai
  wrong: [
    "Hmm... đó chưa phải câu trả lời. Nhưng đừng lo...",
    "Sai một chút thôi... Hãy thử lại, ta tin con!",
    "Những con số đang đánh lừa con... Tập trung hơn nào!",
    "Đường đến kho báu không bao giờ thẳng... Cố lên!"
  ],

  // Khi hoàn thành
  complete: {
    excellent: [
      "XUẤT SẮC! Con đã chinh phục thử thách này một cách hoàn hảo!",
      "Ta rất tự hào về con! Sức mạnh của con đã tăng lên đáng kể!",
      "PHI THƯỜNG! Kho Báu Tri Thức đang mở rộng cửa chào đón con!"
    ],
    good: [
      "Tốt lắm! Con đã vượt qua thử thách!",
      "Sức mạnh của con đang lớn dần... Tiếp tục rèn luyện nhé!",
      "Con đang đi đúng hướng! Kho báu không còn xa nữa!"
    ],
    needsWork: [
      "Con đã cố gắng... Nhưng hãy thử lại, con sẽ làm tốt hơn!",
      "Đường đến kho báu cần sự kiên trì... Ta tin con sẽ làm được!",
      "Mỗi lần thử là một bước tiến... Đừng bỏ cuộc nhé!"
    ]
  }
};

// ============================================================
// 🧠 LỜI DẪN CHO SIÊU TRÍ TUỆ - Mental Math
// ============================================================
export const MENTAL_NARRATIVES = {
  intro: {
    hook: [
      "Thử thách Siêu Trí Tuệ... Nơi sức mạnh đến từ bên trong!",
      "Ở đây, bàn tính không ở trước mặt con... mà ở trong tâm trí.",
      "Hãy nhắm mắt... tưởng tượng... và để đáp án tự hiện ra."
    ],
    action: [
      "Không có bàn tính vật lý... Chỉ có trí tuệ của con.",
      "Hít thở sâu... tập trung... con có thể làm được.",
      "Tâm trí con mạnh hơn bất kỳ công cụ nào!"
    ]
  },

  modeSelect: {
    hook: "Con muốn thử thách trí tuệ với loại sức mạnh nào?",
    modes: {
      addition: "Hợp nhất trong tâm trí...",
      subtraction: "Cân bằng bằng suy nghĩ...",
      multiplication: "Nhân bản bằng trí tưởng tượng...",
      division: "Phân chia bằng logic...",
      mixed: "Tất cả trong một... Thử thách tối thượng!"
    }
  },

  during: [
    "Tập trung... để tâm trí dẫn lối...",
    "Nhìn vào con số... để chúng tự sắp xếp trong đầu con...",
    "Không vội... trí tuệ cần không gian để tỏa sáng."
  ],

  correct: [
    "TUYỆT VỜI! Trí tuệ của con đang tỏa sáng!",
    "Siêu não! Con không cần bàn tính vẫn tính đúng!",
    "Tâm trí con mạnh mẽ hơn ta tưởng rất nhiều!"
  ],

  wrong: [
    "Hmm... hãy để tâm trí nghỉ ngơi một chút rồi thử lại.",
    "Siêu trí tuệ cần thời gian để phát triển... Cố lên!",
    "Đừng lo, ngay cả thiên tài cũng sai... Quan trọng là con đã thử!"
  ]
};

// ============================================================
// ⚡ LỜI DẪN CHO TIA CHỚP - Flash Anzan
// ============================================================
export const FLASH_NARRATIVES = {
  intro: {
    hook: [
      "⚡ TIA CHỚP! Thử thách dành cho những bộ óc nhanh nhất!",
      "Các con số sẽ lóe lên như tia sét... Con có bắt kịp không?",
      "Không có thời gian suy nghĩ... Chỉ có PHẢN XẠ!"
    ],
    action: [
      "Hít thở... tập trung... để mắt và não trở thành một.",
      "Khi số xuất hiện, đừng suy nghĩ - hãy CẢM NHẬN!",
      "Tốc độ ánh sáng đang chờ con..."
    ]
  },

  // Tên các tốc độ theo chủ đề Tia Sáng
  speedLevels: {
    1: { 
      name: "Ánh Nến", 
      hook: "Ánh sáng dịu nhẹ cho người mới bắt đầu...",
      desc: "Chậm rãi như ngọn nến lung linh"
    },
    2: { 
      name: "Ánh Trăng", 
      hook: "Ánh trăng lướt qua trong màn đêm...",
      desc: "Nhẹ nhàng nhưng đã nhanh hơn"
    },
    3: { 
      name: "Ánh Sao", 
      hook: "Những ngôi sao nhấp nháy trên bầu trời...",
      desc: "Bắt đầu thử thách thực sự"
    },
    4: { 
      name: "Tia Nắng", 
      hook: "Tia nắng xuyên qua mây...",
      desc: "Nhanh và mạnh mẽ"
    },
    5: { 
      name: "Tia Chớp", 
      hook: "Tia chớp lóe sáng giữa cơn giông...",
      desc: "Chỉ dành cho cao thủ"
    },
    6: { 
      name: "SIÊU TÂN TINH", 
      hook: "Vụ nổ ánh sáng mạnh nhất vũ trụ...",
      desc: "Thử thách của những huyền thoại!"
    }
  },

  countdown: [
    "3... Tập trung...",
    "2... Sẵn sàng...",
    "1... BẮT ĐẦU!"
  ],

  correct: [
    "⚡ SIÊU TỐC! Con đã bắt được tia chớp!",
    "THẦN KỲ! Mắt và não con nhanh như ánh sáng!",
    "ĐỈNH CAO! Con sinh ra để làm điều này!",
    "KHÔNG THỂ TIN! Tia chớp cũng không thoát khỏi tầm mắt con!"
  ],

  wrong: [
    "Tia chớp quá nhanh lần này... Nhưng con sẽ bắt được lần sau!",
    "Đừng lo! Ngay cả ninja cũng cần luyện tập!",
    "Gần lắm rồi! Mắt con đang dần quen với tốc độ!"
  ],

  complete: {
    excellent: "⚡ HUYỀN THOẠI TIA CHỚP! Con đã đạt đến đỉnh cao phản xạ!",
    good: "Tốt lắm! Phản xạ của con đang tiến bộ rõ rệt!",
    needsWork: "Tia chớp cần thời gian để thuần phục... Tiếp tục luyện tập nhé!"
  }
};

// ============================================================
// 🏆 LỜI DẪN CHO THI ĐẤU - Compete
// ============================================================
export const COMPETE_NARRATIVES = {
  intro: {
    hook: [
      "Đấu Trường Tri Thức... Nơi các anh hùng chứng minh sức mạnh!",
      "Rất nhiều nhà thám hiểm khác cũng đang thử sức ở đây...",
      "Đây không chỉ là thi đấu... mà là cuộc chiến vì DANH DỰ!"
    ],
    action: [
      "Hãy cho tất cả thấy con không phải người thường!",
      "Bảng xếp hạng đang chờ ghi tên con vào lịch sử!",
      "Mỗi câu đúng là một bước tiến đến vinh quang!"
    ]
  },

  modeSelect: {
    hook: "Con muốn thi đấu ở đấu trường nào?",
    modes: {
      addition: "Đấu trường Hợp Nhất - nơi tốc độ cộng quyết định tất cả!",
      subtraction: "Đấu trường Cân Bằng - ai trừ nhanh hơn sẽ chiến thắng!",
      addSubMixed: "Đấu trường Vũ Điệu - cộng trừ xen kẽ, không có chỗ cho sai lầm!",
      multiplication: "Đấu trường Nhân Bản - sức mạnh nhân đôi, vinh quang nhân đôi!",
      division: "Đấu trường Phân Chia - chia đều chiến thắng về phía con!",
      mulDiv: "Đấu trường Song Kiếm - nhân chia như hai lưỡi dao!",
      mixed: "Đấu trường Tứ Đại - chỉ bậc thầy mới dám bước vào!"
    }
  },

  questionCount: {
    hook: "Con muốn chiến đấu bao nhiêu hiệp?",
    options: {
      5: "Khởi động nhanh - 5 hiệp",
      10: "Trận đấu cơ bản - 10 hiệp",
      15: "Thử thách bền bỉ - 15 hiệp",
      20: "Cuộc chiến dai dẳng - 20 hiệp",
      25: "Đấu trường khốc liệt - 25 hiệp",
      30: "Marathon tri thức - 30 hiệp",
      40: "Siêu đấu trường - 40 hiệp",
      50: "Thử thách huyền thoại - 50 hiệp"
    }
  },

  start: [
    "Trận đấu bắt đầu! Hãy cho ta thấy sức mạnh thực sự!",
    "Đấu trường đang dõi theo từng bước của con!",
    "CHIẾN ĐẤU! VINH QUANG ĐANG CHỜ ĐỢI!"
  ],

  correct: [
    "Đẹp! Con đang dẫn đầu cuộc đua!",
    "Mạnh mẽ! Đối thủ đang run sợ!",
    "Tuyệt vời! Vương miện đang gần hơn!"
  ],

  wrong: [
    "Một sơ suất nhỏ... Nhưng trận đấu chưa kết thúc!",
    "Đừng lo! Anh hùng thực sự không bao giờ bỏ cuộc!",
    "Vấp ngã để đứng dậy mạnh mẽ hơn! Tiếp tục nào!"
  ],

  complete: {
    top1: [
      "🥇 VÔ ĐỊCH! Con là HUYỀN THOẠI của đấu trường này!",
      "🏆 QUÁN QUÂN! Tên con sẽ được khắc vào lịch sử!",
      "👑 BÁ CHỦ! Không ai có thể đánh bại con!"
    ],
    top3: [
      "🥈🥉 TOP 3! Con là một trong những người giỏi nhất!",
      "Xuất sắc! Đứng trong TOP 3 là một vinh dự lớn!",
      "Gần đỉnh cao lắm rồi! Lần sau sẽ là số 1!"
    ],
    good: [
      "Trận đấu kết thúc! Con đã chiến đấu dũng cảm!",
      "Kinh nghiệm này sẽ giúp con mạnh hơn lần sau!",
      "Mỗi trận đấu đều là một bài học... Con đang tiến bộ!"
    ]
  },

  leaderboard: {
    hook: "Bảng vàng vinh danh những anh hùng...",
    yourRank: "Con đang ở vị trí này trong đấu trường...",
    challenge: "Có dám vượt qua những người phía trên không?"
  }
};

// ============================================================
// 🎖️ LỜI DẪN CHO CHỨNG CHỈ & THÀNH TÍCH
// ============================================================
export const ACHIEVEMENT_NARRATIVES = {
  certificate: {
    addSub: {
      unlock: [
        "🎖️ CHỨNG CHỈ CỘNG TRỪ! Con đã chứng minh sức mạnh của mình!",
        "Tấm bằng này công nhận con là Bậc Thầy Cộng Trừ!",
        "Từ giờ, không phép cộng trừ nào có thể làm khó con!"
      ]
    },
    complete: {
      unlock: [
        "🏆 CHỨNG CHỈ SOROBAN TOÀN DIỆN! Thành tựu cao nhất!",
        "Con đã làm chủ TẤT CẢ kỹ năng! Ta rất tự hào!",
        "Rất ít người đạt được đến đây... Con thật sự đặc biệt!"
      ]
    }
  },

  milestones: {
    firstLesson: "Bước đầu tiên trên hành trình... Kho báu đang chờ!",
    level5: "Con đã vượt qua 5 cấp độ! Sức mạnh đang tăng lên!",
    level10: "10 cấp độ! Con đang trở thành bậc thầy thực sự!",
    level18: "TẤT CẢ 18 CẤP ĐỘ! Con là HUYỀN THOẠI!",
    streak7: "7 ngày liên tiếp! Sự kiên trì của con thật đáng ngưỡng mộ!",
    streak30: "30 NGÀY! Con có ý chí sắt đá của một nhà vô địch!"
  }
};

// ============================================================
// 🔧 HELPER FUNCTIONS
// ============================================================

/**
 * Lấy một câu ngẫu nhiên từ array
 */
export function getRandomLine(lines) {
  if (!lines || lines.length === 0) return '';
  return lines[Math.floor(Math.random() * lines.length)];
}

/**
 * Lấy narrative theo level
 */
export function getLevelNarrative(levelId, type = 'intro') {
  const key = `level_${levelId}`;
  return LESSON_NARRATIVES[key]?.[type] || null;
}

/**
 * Lấy narrative cho practice mode
 */
export function getPracticeModeNarrative(mode) {
  return PRACTICE_NARRATIVES.modeSelection.modes[mode] || null;
}

/**
 * Lấy feedback message dựa trên kết quả
 */
export function getFeedbackNarrative(isCorrect, speed = 'normal', streak = 0) {
  if (!isCorrect) {
    return getRandomLine(PRACTICE_NARRATIVES.wrong);
  }
  
  // Check streak first
  if (streak >= 10) return PRACTICE_NARRATIVES.correct.streak[10];
  if (streak >= 7) return PRACTICE_NARRATIVES.correct.streak[7];
  if (streak >= 5) return PRACTICE_NARRATIVES.correct.streak[5];
  if (streak >= 3) return PRACTICE_NARRATIVES.correct.streak[3];
  
  // Then check speed
  if (speed === 'godlike') return getRandomLine(PRACTICE_NARRATIVES.correct.godlike);
  if (speed === 'fast') return getRandomLine(PRACTICE_NARRATIVES.correct.fast);
  return getRandomLine(PRACTICE_NARRATIVES.correct.normal);
}

/**
 * Lấy completion message dựa trên điểm
 */
export function getCompletionNarrative(score, total, context = 'practice') {
  const percentage = (score / total) * 100;
  const narratives = context === 'compete' 
    ? COMPETE_NARRATIVES.complete 
    : PRACTICE_NARRATIVES.complete;
  
  if (percentage >= 90) return getRandomLine(narratives.excellent || narratives.top1);
  if (percentage >= 70) return getRandomLine(narratives.good || narratives.top3);
  return getRandomLine(narratives.needsWork || narratives.good);
}

// ============================================================
// 🎯 EXPORT
// ============================================================
const narrativeConfig = {
  NARRATOR,
  MAP_NARRATIVES,
  LESSON_NARRATIVES,
  PRACTICE_NARRATIVES,
  MENTAL_NARRATIVES,
  FLASH_NARRATIVES,
  COMPETE_NARRATIVES,
  ACHIEVEMENT_NARRATIVES,
  getRandomLine,
  getLevelNarrative,
  getPracticeModeNarrative,
  getFeedbackNarrative,
  getCompletionNarrative
};

export default narrativeConfig;
