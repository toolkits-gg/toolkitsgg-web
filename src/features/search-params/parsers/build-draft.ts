import { createParser } from "nuqs";
import {
	decodeLoadout,
	encodeLoadout,
} from "#/features/game/data/build-url-codec";
import type { BuildLoadoutEntry } from "#/features/game/data/types";
import {
	DEFAULT_IMAGE_FIT,
	type ImageFit,
	toImageFit,
} from "#/features/image-position/image-fit";
import {
	clampImagePosition,
	DEFAULT_IMAGE_POSITION,
	type ImagePosition,
	imagePositionsEqual,
	isDefaultImagePosition,
} from "#/features/image-position/image-position";

/**
 * The shareable slice of a build, carried entirely in the query string so a
 * build can be linked without a server record.
 *
 * The description is deliberately absent. It is headed for 5k characters of
 * markdown, which would push a link past the message limits of the places
 * builds actually get shared, so it stays in the editor and the saved build.
 */

const MAX_NAME_LENGTH = 100;
const MAX_TAGS = 20;
const MAX_URL_LENGTH = 500;
const TAG_SEPARATOR = ",";
const POSITION_SEPARATOR = ",";

const DRAFT_OPTIONS = {
	history: "replace",
	shallow: true,
	clearOnDefault: true,
	// The name field writes on every keystroke.
	throttleMs: 300,
} as const;

const loadoutParser = createParser<BuildLoadoutEntry[]>({
	parse: decodeLoadout,
	serialize: encodeLoadout,
	eq: (a, b) => encodeLoadout(a) === encodeLoadout(b),
})
	.withDefault([])
	.withOptions(DRAFT_OPTIONS);

const clampedStringParser = (maxLength: number) =>
	createParser<string>({
		parse: (value) => value.slice(0, maxLength),
		serialize: (value) => value.slice(0, maxLength),
	})
		.withDefault("")
		.withOptions(DRAFT_OPTIONS);

/**
 * A URL cannot be carried through the query string as-is.
 *
 * The router collapses runs of slashes anywhere in a href it assembles, and
 * nuqs deliberately leaves `/` unencoded so query strings stay readable. A
 * literal `https://` in a param is therefore rewritten to `https:/` in transit,
 * which browsers quietly repair in an `<img>` src but the build image allowlist
 * does not. Percent-encoding keeps the slashes out of the router's reach; every
 * transport layers exactly one more encoding on top and strips it again on read.
 */
const encodeDraftUrl = (value: string): string => encodeURIComponent(value);

const decodeDraftUrl = (value: string): string => {
	try {
		return decodeURIComponent(value);
	} catch {
		// A truncated or hand-edited escape must cost that one field, not the draft.
		return value;
	}
};

const urlStringParser = (maxLength: number) =>
	createParser<string>({
		parse: (value) => decodeDraftUrl(value).slice(0, maxLength),
		serialize: (value) => encodeDraftUrl(value.slice(0, maxLength)),
	})
		.withDefault("")
		.withOptions(DRAFT_OPTIONS);

const tagsParser = createParser<string[]>({
	parse: (value) =>
		value.split(TAG_SEPARATOR).filter(Boolean).slice(0, MAX_TAGS),
	serialize: (value) => value.slice(0, MAX_TAGS).join(TAG_SEPARATOR),
	eq: (a, b) => a.length === b.length && a.every((tag, i) => tag === b[i]),
})
	.withDefault([])
	.withOptions(DRAFT_OPTIONS);

/** "x,y", each 0-1. Anything unparseable centers the image. */
const imagePositionParser = createParser<ImagePosition>({
	parse: (value) => {
		const [x, y] = value.split(POSITION_SEPARATOR);
		return clampImagePosition({ x: Number(x), y: Number(y) });
	},
	serialize: (value) => `${value.x}${POSITION_SEPARATOR}${value.y}`,
	eq: imagePositionsEqual,
})
	.withDefault(DEFAULT_IMAGE_POSITION)
	.withOptions(DRAFT_OPTIONS);

const imageFitParser = createParser<ImageFit>({
	parse: toImageFit,
	serialize: (value) => value,
})
	.withDefault(DEFAULT_IMAGE_FIT)
	.withOptions(DRAFT_OPTIONS);

const buildDraftParsers = {
	b: loadoutParser,
	n: clampedStringParser(MAX_NAME_LENGTH),
	t: tagsParser,
	v: urlStringParser(MAX_URL_LENGTH),
	i: urlStringParser(MAX_URL_LENGTH),
	ip: imagePositionParser,
	if: imageFitParser,
	r: urlStringParser(MAX_URL_LENGTH),
};

type BuildDraftValue = {
	loadout: BuildLoadoutEntry[];
	name: string;
	tags: string[];
	videoUrl: string;
	imageUrl: string;
	imagePosition: ImagePosition;
	imageFit: ImageFit;
	referenceUrl: string;
};

/** The draft as `useQueryStates(buildDraftParsers)` returns it, keyed by param name. */
type BuildDraftParams = {
	b: BuildLoadoutEntry[];
	n: string;
	t: string[];
	v: string;
	i: string;
	ip: ImagePosition;
	if: ImageFit;
	r: string;
};

const paramsToDraft = (params: BuildDraftParams): BuildDraftValue => ({
	loadout: params.b,
	name: params.n,
	tags: params.t,
	videoUrl: params.v,
	imageUrl: params.i,
	imagePosition: params.ip,
	imageFit: params.if,
	referenceUrl: params.r,
});

/**
 * The draft as already-serialized param values, so it can be handed to a router
 * `search` prop without the values being re-encoded as JSON. Empty fields are
 * omitted entirely.
 */
const buildDraftToSearchParams = (
	draft: Partial<BuildDraftValue>,
): Record<string, string> => {
	const imageUrl = (draft.imageUrl ?? "").slice(0, MAX_URL_LENGTH);
	const position = draft.imagePosition ?? DEFAULT_IMAGE_POSITION;
	const fit = draft.imageFit ?? DEFAULT_IMAGE_FIT;
	// A focal point says nothing without the image it frames, nothing at all when
	// centered, and nothing at all when the image isn't being cropped.
	const carriesPosition =
		imageUrl !== "" && fit === "cover" && !isDefaultImagePosition(position);

	const pairs: [string, string][] = [
		["b", encodeLoadout(draft.loadout ?? [])],
		["n", (draft.name ?? "").slice(0, MAX_NAME_LENGTH)],
		["t", (draft.tags ?? []).slice(0, MAX_TAGS).join(TAG_SEPARATOR)],
		["v", encodeDraftUrl((draft.videoUrl ?? "").slice(0, MAX_URL_LENGTH))],
		["i", encodeDraftUrl(imageUrl)],
		[
			"ip",
			carriesPosition ? `${position.x}${POSITION_SEPARATOR}${position.y}` : "",
		],
		["if", imageUrl !== "" && fit !== DEFAULT_IMAGE_FIT ? fit : ""],
		["r", encodeDraftUrl((draft.referenceUrl ?? "").slice(0, MAX_URL_LENGTH))],
	];
	return Object.fromEntries(pairs.filter(([, value]) => value !== ""));
};

/**
 * Builds the query string for a share link. Hand-rolled rather than via
 * URLSearchParams, which would percent-encode the `~` and `!` the loadout codec
 * relies on and roughly double the length of the encoded loadout.
 */
const buildDraftToSearch = (draft: Partial<BuildDraftValue>): string =>
	Object.entries(buildDraftToSearchParams(draft))
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");

export {
	type BuildDraftParams,
	type BuildDraftValue,
	buildDraftParsers,
	buildDraftToSearch,
	buildDraftToSearchParams,
	paramsToDraft,
};
