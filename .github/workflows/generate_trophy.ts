import "https://deno.land/x/dotenv@v0.5.0/load.ts";

const username = Deno.args[0];
const outPath = Deno.args[1] ?? "./assets/trophy.svg";

if (!username) {
  console.error("Usage: deno run --allow-net --allow-env --allow-read --allow-write .github/workflows/generate_trophy.ts USERNAME OUTPUT_PATH");
  Deno.exit(1);
}

import { GithubApiService } from "../../trophy/src/Services/GithubApiService.ts";
import { Card } from "../../trophy/src/card.ts";
import { COLORS } from "../../trophy/src/theme.ts";

const svc = new GithubApiService();

const userInfoOrError = await svc.requestUserInfo(username);


if (!(userInfoOrError && (userInfoOrError as any).totalCommits !== undefined)) {
  console.error("Failed to fetch user info. Check token, username and rate limits.");
  Deno.exit(2);
}

const userInfo = userInfoOrError as any;

const card = new Card([], [], -1, 10, 115, 10, 10, false, false);
const theme = (COLORS as any).default;
const svg = card.render(userInfo, theme);

try {
  const dir = outPath.replace(/\/[^/]+$/, "");
  if (dir) await Deno.mkdir(dir, { recursive: true });
} catch {}

await Deno.writeTextFile(outPath, svg);
console.log(`Wrote ${outPath}`);