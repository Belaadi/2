export function percentage(number: number, percent: number) {
  return (percent / 100) * number;
}

export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}