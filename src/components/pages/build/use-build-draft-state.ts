import { useQueryStates } from "nuqs";
import { useState } from "react";
import type { BuildDetailsValue } from "#/components/pages/build/build-editor/BuildDetailsFields";
import { useDraftDescription } from "#/components/pages/build/use-draft-description";
import type {
	BuildLoadoutEntry,
	CreatedBuildRecord,
} from "#/features/game/data/types";
import { toImageFit } from "#/features/image-position/image-fit";
import { toImagePosition } from "#/features/image-position/image-position";
import {
	type BuildDraftParams,
	buildDraftParsers,
} from "#/features/search-params/parsers/build-draft";
import type { BuildVisibility, GameId } from "@/prisma";

/**
 * Owns the editor's state and decides where it lives.
 *
 * While creating, the build is kept in the URL so an unsaved draft is both
 * refresh-safe and shareable by link. While editing a build that already
 * exists, the URL is left alone: the build has its own address, and mirroring
 * an edit in progress into the query string would just be noise.
 *
 * Both stores are set up no matter what; only which one is selected
 * changes.
 */

/** Editor fields that ride in the query string, and the param each maps to. */
const URL_PARAM_BY_FIELD = {
	name: "n",
	tags: "t",
	videoUrl: "v",
	imageUrl: "i",
	imagePosition: "ip",
	imageFit: "if",
	referenceUrl: "r",
} as const satisfies Partial<Record<keyof BuildDetailsValue, string>>;

const toDetails = (build: CreatedBuildRecord | null): BuildDetailsValue => ({
	name: build?.name ?? "",
	description: build?.description ?? "",
	visibility: build?.visibility ?? "PUBLIC",
	videoUrl: build?.videoUrl ?? "",
	imageUrl: build?.imageUrl ?? "",
	imagePosition: toImagePosition(build?.imagePositionX, build?.imagePositionY),
	imageFit: toImageFit(build?.imageFit),
	referenceUrl: build?.referenceUrl ?? "",
	tags: build?.tags ?? [],
});

type UseBuildDraftStateArgs = {
	build: CreatedBuildRecord | null;
	gameId: GameId;
};

/** Every editor field at once, as a recovered draft supplies them. */
type BuildDraftSnapshot = {
	details: BuildDetailsValue;
	loadout: BuildLoadoutEntry[];
};

type BuildDraftState = {
	details: BuildDetailsValue;
	loadout: BuildLoadoutEntry[];
	setField: <K extends keyof BuildDetailsValue>(
		key: K,
		next: BuildDetailsValue[K],
	) => void;
	setLoadout: (next: BuildLoadoutEntry[]) => void;
	/**
	 * Replaces every field at once. A recovered draft arrives whole, and feeding it
	 * back through setField would rewrite the query string once per field.
	 */
	restore: (snapshot: BuildDraftSnapshot) => void;
	/**
	 * Drops the locally stored description. The query params need no cleanup.
	 */
	clearDraft: () => void;
};

const useBuildDraftState = ({
	build,
	gameId,
}: UseBuildDraftStateArgs): BuildDraftState => {
	const isCreating = build === null;

	const [params, setParams] = useQueryStates(buildDraftParsers);
	const description = useDraftDescription(gameId, isCreating);
	const [draftVisibility, setDraftVisibility] =
		useState<BuildVisibility>("PUBLIC");

	const [savedDetails, setSavedDetails] = useState<BuildDetailsValue>(() =>
		toDetails(build),
	);
	const [savedLoadout, setSavedLoadout] = useState<BuildLoadoutEntry[]>(
		() => build?.loadout ?? [],
	);

	const details: BuildDetailsValue = isCreating
		? {
				name: params.n,
				description: description.value,
				visibility: draftVisibility,
				videoUrl: params.v,
				imageUrl: params.i,
				imagePosition: params.ip,
				imageFit: params.if,
				referenceUrl: params.r,
				tags: params.t,
			}
		: savedDetails;

	const setField = <K extends keyof BuildDetailsValue>(
		key: K,
		next: BuildDetailsValue[K],
	) => {
		if (!isCreating) {
			setSavedDetails((prev) => ({ ...prev, [key]: next }));
			return;
		}
		if (key === "description") {
			description.set(next as string);
			return;
		}
		if (key === "visibility") {
			setDraftVisibility(next as BuildVisibility);
			return;
		}
		const param = URL_PARAM_BY_FIELD[key as keyof typeof URL_PARAM_BY_FIELD];
		void setParams({ [param]: next } as Partial<BuildDraftParams>);
	};

	const setLoadout = (next: BuildLoadoutEntry[]) => {
		if (isCreating) void setParams({ b: next });
		else setSavedLoadout(next);
	};

	const restore = (snapshot: BuildDraftSnapshot) => {
		if (!isCreating) {
			setSavedDetails(snapshot.details);
			setSavedLoadout(snapshot.loadout);
			return;
		}
		description.set(snapshot.details.description);
		setDraftVisibility(snapshot.details.visibility);
		void setParams({
			n: snapshot.details.name,
			t: snapshot.details.tags,
			v: snapshot.details.videoUrl,
			i: snapshot.details.imageUrl,
			ip: snapshot.details.imagePosition,
			if: snapshot.details.imageFit,
			r: snapshot.details.referenceUrl,
			b: snapshot.loadout,
		});
	};

	return {
		details,
		loadout: isCreating ? params.b : savedLoadout,
		setField,
		setLoadout,
		restore,
		clearDraft: description.clear,
	};
};

export { useBuildDraftState };
