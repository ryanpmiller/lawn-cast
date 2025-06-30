export function getPast7Dates(): string[] {
	const today = new Date();
	const dates: string[] = [];
	for (let i = 1; i <= 7; i++) {
		const d = new Date(today);
		d.setDate(today.getDate() - i);
		dates.push(d.toISOString().slice(0, 10));
	}
	return dates.reverse(); // oldest → newest
}

export function getStartDate(dates: string[]): string {
	return dates[0];
}
