export function beatifyNumber(n: number) {
	return (n > 100 ? Math.round(n):n).toLocaleString()
}
