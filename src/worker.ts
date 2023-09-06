import puppeteer from "@cloudflare/puppeteer";
import robotsParser from "robots-parser";

export interface Env {
  TARGET_URL: string;
  SLACK_TOKEN: string;
  BROWSER: puppeteer.BrowserWorker;
}

async function send(env: Env): Promise<Response> {
  let isAllowed = true;
  try {
    const robotsTextPath = new URL(env.TARGET_URL).origin + "/robots.txt";
    const response = await fetch(robotsTextPath);

    const robots = robotsParser(robotsTextPath, await response.text());
    isAllowed = robots.isAllowed(env.TARGET_URL) ?? true; // respect robots.txt!
  } catch {
    // ignore
  }

  if (!isAllowed) {
    console.log("robots.txt disallows crawling");
    return new Response("robots.txt disallows crawling", { status: 403 });
  }
  console.log("robots.txt allows crawling");

  const browser = await puppeteer.launch(env.BROWSER);
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 2000 });

  await page.goto(env.TARGET_URL);

  const img = (await page.screenshot()) as Buffer;
  await browser.close();

  const blob = new Blob([img.buffer], { type: "image/png" });

  const fd = new FormData();
  fd.append("initial_comment", "schedule");
  fd.append("channels", "C05CACLMRUZ");
  fd.append("file", blob);

  return fetch("https://slack.com/api/files.upload", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.SLACK_TOKEN}`,
    },
    body: fd,
  });
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
    _controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<void> {
    const resp = await send(env);
    console.log(`status: ${resp.status}`);
    if (!resp.ok) {
      console.log(`result: ${await resp.text()}`);
      return;
    }
    const body = await resp.text();
    const json = JSON.parse(body) as { ok: boolean };
    if (!json["ok"]) {
      console.log(`result: ${body}`);
      return;
    }
  },
};
