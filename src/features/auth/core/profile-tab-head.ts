import type { QueryClient } from "@tanstack/react-query";
import { FALLBACK_DISPLAY_NAME } from "#/constants.ts";
import {
	buildGetProfileQueryKey,
	mapUserToProfileData,
} from "#/features/game/dal/user-profile/user-profile.dal.ts";
import { getPublicUserProfileServerFn } from "#/features/game/dal/user-profile/user-profile.ts";

// hits the cached profile query populated by the parent profile loader.
const loadProfileTabData = async (
	userId: string,
	queryClient: QueryClient,
): Promise<{ displayName: string }> => {
	const profile = await queryClient.ensureQueryData({
		queryKey: buildGetProfileQueryKey(userId),
		queryFn: async () => {
			const user = await getPublicUserProfileServerFn({ data: { userId } });
			return mapUserToProfileData(user);
		},
	});
	return { displayName: profile?.displayName || FALLBACK_DISPLAY_NAME };
};

// tab-level head() override: only the title-related tags. The parent route's
// og:image / og:description / etc. continue to apply.
const buildTabHead = (displayName: string, tabLabel: string) => {
	const title = `${displayName} - ${tabLabel} | Toolkits.gg`;
	return [
		{ title },
		{ property: "og:title", content: title },
		{ name: "twitter:title", content: title },
	];
};

export { buildTabHead, loadProfileTabData };
