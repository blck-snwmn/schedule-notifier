import puppeteer from "@cloudflare/puppeteer";

export interface Env {
	TARGET_URL: string
	WEBHOOK_URL: string
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
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return new Response('success');
	},
	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext
	): Promise<void> {

	}
};
