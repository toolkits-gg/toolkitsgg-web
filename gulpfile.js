import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { favicons } from "favicons";
import sharp from "sharp";
import FAVICON_REGISTRY from "./src/features/game/registry/favicon-registry.json" with {
	type: "json",
};
import IMAGE_SIZES from "#/features/game/core/image-sizes.json" with {
	type: "json",
};


const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ! Deliberately hardcording to avoid injectint env vars
const CLOUDFRONT_URL = "https://d1ig3kkc8hj9hz.cloudfront.net";

export async function generateFavicons() {
	async function generateForKey(key, imagePath) {
		if (!CLOUDFRONT_URL) {
			throw new Error("VITE_CLOUDFRONT_URL is not set in .env.local");
		}

		const url = `${CLOUDFRONT_URL}/${imagePath}`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${url}: ${response.status}`);
		}
		const buffer = Buffer.from(await response.arrayBuffer());

		const result = await favicons(buffer, {
			appName: "Toolkits.gg",
			path: `/favicons/${key}/`,
			icons: {
				android: false,
				appleIcon: true,
				appleStartup: false,
				favicons: true,
				windows: false,
				yandex: false,
			},
		});

		const destDir = path.join(__dirname, "public", "favicons", key);
		await mkdir(destDir, { recursive: true });

		await Promise.all(
			[...result.images, ...result.files].map(({ name, contents }) =>
				writeFile(path.join(destDir, name), contents),
			),
		);

		console.log(`✓ Generated favicons for: ${key} (${result.images.length} images, ${result.files.length} files)`);
	}

	await Promise.all(
		Object.entries(FAVICON_REGISTRY).map(([key, imagePath]) =>
			generateForKey(key, imagePath),
		),
	);
	console.log("All favicons generated.");
}

// ----------------------------------------------------------------------------
// Item image resizing
// ----------------------------------------------------------------------------
//
// Fetches each item's source image from CloudFront, resizes it to every preset
// in image-sizes.json, and writes the variants to /.images/<gameId>/... .
//
// Idempotent: per item, the task checks if every expected output already exists
// on disk before fetching. If all variants are present, no network call is made.
// Only missing variants are regenerated.
//
// To force a refresh after replacing a CloudFront original with new content at
// the same path, delete the relevant /.images/<gameId>/... subtree and re-run.
// ----------------------------------------------------------------------------

const IMAGE_OUTPUT_ROOT = path.join(__dirname, ".images");
const ITEM_DATA_GLOB_ROOT = path.join(__dirname, "src", "games");
const FETCH_CONCURRENCY = 16;
const IMAGE_URL_REGEX = /imageUrl:\s*["']([^"']+)["']/g;

const fileExists = async (p) => {
	try {
		await access(p);
		return true;
	} catch {
		return false;
	}
};

const collectImageUrlsForGame = async (gameId) => {
	const dir = path.join(ITEM_DATA_GLOB_ROOT, gameId, "core", "item-data");
	let entries;
	try {
		entries = await readdir(dir);
	} catch {
		return [];
	}
	const tsFiles = entries.filter((f) => f.endsWith(".ts"));
	const urls = new Set();
	await Promise.all(
		tsFiles.map(async (file) => {
			const contents = await readFile(path.join(dir, file), "utf8");
			for (const match of contents.matchAll(IMAGE_URL_REGEX)) {
				const value = match[1].trim();
				if (value.length > 0) urls.add(value);
			}
		}),
	);
	return [...urls];
};

const expectedOutputPath = (gameId, imageUrl, width, height) => {
	const ext = path.extname(imageUrl);
	const dir = path.dirname(imageUrl);
	const base = path.basename(imageUrl, ext);
	return path.join(
		IMAGE_OUTPUT_ROOT,
		gameId,
		dir,
		"resized",
		`${base}-${width}x${height}${ext}`,
	);
};

const processItem = async (gameId, imageUrl, stats) => {
	const sizes = Object.values(IMAGE_SIZES);
	const targets = sizes.map(([w, h]) => ({
		w,
		h,
		out: expectedOutputPath(gameId, imageUrl, w, h),
	}));
	const presence = await Promise.all(targets.map((t) => fileExists(t.out)));
	const missing = targets.filter((_, i) => !presence[i]);

	if (missing.length === 0) {
		stats.skipped += 1;
		return;
	}

	const sourceUrl = `${CLOUDFRONT_URL}/games/${gameId}/${imageUrl}`;
	const response = await fetch(sourceUrl);
	if (!response.ok) {
		stats.missingOnCdn += 1;
		console.warn(`  ! ${gameId}/${imageUrl} — CDN returned ${response.status}`);
		return;
	}
	const buffer = Buffer.from(await response.arrayBuffer());

	await Promise.all(
		missing.map(async ({ w, h, out }) => {
			const resized = await sharp(buffer)
				.resize(w, h, {
					fit: "contain",
					background: { r: 0, g: 0, b: 0, alpha: 0 },
				})
				.toBuffer();
			await mkdir(path.dirname(out), { recursive: true });
			await writeFile(out, resized);
			stats.variantsWritten += 1;
		}),
	);
	stats.generated += 1;
};

const runWithConcurrency = async (jobs, limit) => {
	const queue = [...jobs];
	const workers = Array.from({ length: limit }, async () => {
		while (queue.length > 0) {
			const job = queue.shift();
			if (job) await job();
		}
	});
	await Promise.all(workers);
};

export async function generateItemImages() {
	const gameIds = Object.keys(FAVICON_REGISTRY).filter((k) => k !== "default");
	if (gameIds.length === 0) {
		console.log("No games registered.");
		return;
	}

	console.log(
		`Generating item images for ${gameIds.length} game(s) at ${Object.keys(IMAGE_SIZES).length} sizes...`,
	);

	for (const gameId of gameIds) {
		const imageUrls = await collectImageUrlsForGame(gameId);
		if (imageUrls.length === 0) {
			console.log(`  ${gameId}: no item images`);
			continue;
		}
		const stats = { generated: 0, skipped: 0, missingOnCdn: 0, variantsWritten: 0 };
		const jobs = imageUrls.map((url) => () => processItem(gameId, url, stats));
		await runWithConcurrency(jobs, FETCH_CONCURRENCY);
		console.log(
			`✓ ${gameId}: ${stats.generated} generated (${stats.variantsWritten} variants), ${stats.skipped} skipped, ${stats.missingOnCdn} missing on CDN (${imageUrls.length} items total)`,
		);
	}
	console.log("All item images generated.");
}
