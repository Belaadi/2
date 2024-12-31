export function durationBetween(from: Date, to: Date) {
    const timeDifference = to.getTime() - from.getTime();
    return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
}