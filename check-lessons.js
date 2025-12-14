const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lessons = await prisma.lesson.findMany({
    where: { levelId: { in: [17, 18] } },
    select: { levelId: true, lessonId: true, title: true, content: true }
  });
  
  lessons.forEach(l => {
    const content = l.content ? JSON.parse(l.content) : null;
    console.log(`\n=== Level ${l.levelId} - Lesson ${l.lessonId}: ${l.title} ===`);
    console.log('Content keys:', Object.keys(content || {}));
    console.log('Theory exists:', !!content?.theory);
    console.log('Theory length:', content?.theory?.length || 0);
    console.log('Practice exists:', !!content?.practice);
    console.log('Practice length:', content?.practice?.length || 0);
    if (content?.theory && content.theory.length > 0) {
      console.log('First theory item:', JSON.stringify(content.theory[0]).substring(0, 200));
    }
    if (content?.practice && content.practice.length > 0) {
      console.log('First practice item:', JSON.stringify(content.practice[0]));
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
