import puppeteer from "@cloudflare/puppeteer";

export interface Env {
	TARGET_URL: string
	WEBHOOK_URL: string
	ACCESS_TOKEN: string
	BROWSER: puppeteer.BrowserWorker
}

async function name(env: Env) {
	const browser = await puppeteer.launch(env.BROWSER);
	const page = await browser.newPage();
	await page.setViewport({ width: 800, height: 2000 });

	await page.goto(env.TARGET_URL);

	const img = (await page.screenshot()) as Buffer;
	await browser.close();
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
