// www.sreborn.net → https://sreborn.net (301). Apex is served by Pages as-is.
export async function onRequest(context) {
	const url = new URL(context.request.url);
	if (url.hostname !== 'www.sreborn.net') {
		return context.next();
	}
	url.hostname = 'sreborn.net';
	url.protocol = 'https:';
	return Response.redirect(url.toString(), 301);
}
