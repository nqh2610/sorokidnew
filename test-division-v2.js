import { parseDivisionProblem } from './lib/soroban-division-guide.js';

console.log('=== TEST DIVISION GUIDE V2 ===\n');

const tests = [
  { problem: '9 ÷ 3', answer: 3, name: '1÷1' },
  { problem: '84 ÷ 7', answer: 12, name: '2÷1' },
  { problem: '155 ÷ 5', answer: 31, name: '3÷1' },
  { problem: '84 ÷ 12', answer: 7, name: '2÷2' }
];

tests.forEach(test => {
  const steps = parseDivisionProblem(test.problem, test.answer);
  console.log(`${test.name}: ${test.problem} = ${test.answer}`);
  console.log(`Số bước: ${steps.length}`);

  // Kiểm tra có bước chia chi tiết không
  const hasDivisionSteps = steps.some(s => s.title.includes('Chia'));
  console.log(`Có bước chia chi tiết: ${hasDivisionSteps ? '✅' : '❌'}`);
  console.log();
});

console.log('\n=== CHI TIẾT: 155 ÷ 5 ===\n');
const detailed = parseDivisionProblem('155 ÷ 5', 31);
detailed.forEach((step, i) => {
  console.log(`Bước ${i} – ${step.emoji} ${step.title}`);
  console.log(step.instruction);
  if (step.quotientSoFar !== undefined) {
    console.log(`🔢 quotientSoFar: ${step.quotientSoFar}`);
  }
  console.log();
});
