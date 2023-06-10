import puppeteer from "@cloudflare/puppeteer";

export interface Env {
	TARGET_URL: string
	SLACK_TOKEN: string
	BROWSER: puppeteer.BrowserWorker
}

async function send(env: Env): Promise<Response> {
	const browser = await puppeteer.launch(env.BROWSER);
	const page = await browser.newPage();
	await page.setViewport({ width: 800, height: 2000 });

	await page.goto(env.TARGET_URL);

	const img = (await page.screenshot()) as Buffer;
	await browser.close();

	const blob = new Blob([img.buffer], { type: "image/png" })

	const fd = new FormData()
	fd.append("initial_comment", "schedule")
	fd.append("channels", "C05CACLMRUZ")
	fd.append("file", blob)

	return fetch("https://slack.com/api/files.upload", {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${env.SLACK_TOKEN}`
		},
		body: fd,
	})
}

export default {
	// for test
	// async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	// 	const resp = await send(env);
	// 	console.log(`status: ${resp.status}`)
	// 	if (!resp.ok) {
	// 		console.log(`result: ${await resp.text()}`)
	// 		return new Response("failed", { status: resp.status })
	// 	}
	// 	const body = await resp.text()
	// 	const json = JSON.parse(body) as { ok: boolean }
	// 	if (!json["ok"]) {
	// 		console.log(`result: ${body}`)
	// 		return new Response("failed", { status: resp.status })
	// 	}
	// 	return new Response("ok")
	// },
	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext
	): Promise<void> {
		const resp = await send(env);
		console.log(`status: ${resp.status}`)
		if (!resp.ok) {
			console.log(`result: ${await resp.text()}`)
			return
		}
		const body = await resp.text()
		const json = JSON.parse(body) as { ok: boolean }
		if (!json["ok"]) {
			console.log(`result: ${body}`)
			return
		}
	}
};
