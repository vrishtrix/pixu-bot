export const template = (str: string, obj: Record<string, string | number | boolean>) => {
	for (const prop in obj) {
		str = str.replace(new RegExp(`{${prop}}`, 'g'), encodeURIComponent(obj[prop]));
	}
	return str;
};
