import { Box, Stack } from "@mantine/core";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { NotFoundCard } from "#/components/NotFoundCard.tsx";
import {
	FALLBACK_DISPLAY_NAME,
	OG_IMAGE,
	SERVER_RESOLVED_GAME_ID_SOURCES,
} from "#/constants.ts";
import { clientEnv } from "#/env/client-env.ts";
import { getServerResolvedGameInputsServerFn } from "#/features/game/active-game";
import {
	buildGetProfileQueryKey,
	getPublicUserProfileServerFn,
	getViewerUserIdServerFn,
	mapUserToProfileData,
} from "#/features/game/data/user-profile/user-profile.ts";
import { ProfileHeader } from "#/features/user/ProfileHeader.tsx";
import { ProfileTabNav } from "#/features/user/ProfileTabNav.tsx";
import { resolveAvatar } from "#/features/user/utils.ts";
import { getValidatedGameId } from "#/registry/game-public-registry.tsx";
import type { GameId } from "@/prisma";

const ProfileLayout = () => {
	const { isOwner } = Route.useLoaderData();
	const { userId } = Route.useParams();

	return (
		<Stack gap={0}>
			<ProfileHeader userId={userId} isOwner={isOwner} />
			<ProfileTabNav
				basePath={`/account/profile/${userId}`}
				showDataSync={isOwner}
			/>
			<Box p="md">
				<Outlet />
			</Box>
		</Stack>
	);
};

const Route = createFileRoute("/account/profile/$userId")({
	loader: async ({ params, context, location }) => {
		const { queryClient } = context;
		const [profile, viewerUserId, { cookieGameId }] = await Promise.all([
			queryClient.ensureQueryData({
				queryKey: buildGetProfileQueryKey(params.userId),
				queryFn: async () => {
					const user = await getPublicUserProfileServerFn({
						data: { userId: params.userId },
					});
					return mapUserToProfileData(user);
				},
			}),
			getViewerUserIdServerFn(),
			queryClient.ensureQueryData({
				queryKey: SERVER_RESOLVED_GAME_ID_SOURCES,
				queryFn: () => getServerResolvedGameInputsServerFn(),
				staleTime: Number.POSITIVE_INFINITY,
				gcTime: Number.POSITIVE_INFINITY,
			}),
		]);
		if (!profile) throw notFound();

		// ?gameId= > cookie. Profile routes are reserved, so they keep their path
		// on a game subdomain and no route segment carries the game here.
		// The cookie reflects the owner's current switcher selection,
		// so SSR'd OG matches what they see on screen, even before the
		// in-tab `useEffect` mirrors the gameId into the URL.
		const searchParams = new URLSearchParams(location.searchStr);
		const searchGameId = getValidatedGameId(searchParams.get("gameId") ?? "");
		const activeGameId: GameId | null = searchGameId ?? cookieGameId ?? null;

		// "none" cleanly bypasses the override branch in resolveAvatar (no override
		// rows are stored against "none"), so primary-then-legacy fallback applies.
		const { avatarUrl } = resolveAvatar({
			primaryAvatarId: profile.primaryAvatarId,
			primaryAvatarGameId: profile.primaryAvatarGameId,
			overrides: profile.avatarOverrides,
			currentGameId: activeGameId ?? ("none" as GameId),
			fallbackAvatarUrl: profile.avatarUrl,
		});

		return {
			isOwner: viewerUserId === params.userId,
			profileMeta: {
				displayName: profile.displayName,
				bio: profile.bio,
				ogImageUrl: avatarUrl ?? OG_IMAGE,
			},
		};
	},
	head: ({ loaderData, params }) => {
		const meta = loaderData?.profileMeta;
		if (!meta) return {};
		const displayName = meta.displayName || FALLBACK_DISPLAY_NAME;
		const title = `${displayName} — Toolkits.gg`;
		const description = meta.bio || `${displayName}'s profile on Toolkits.gg`;
		const url = `${clientEnv.VITE_APP_URL}/account/profile/${params.userId}`;
		return {
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:image", content: meta.ogImageUrl },
				{ property: "og:type", content: "profile" },
				{ property: "og:url", content: url },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: meta.ogImageUrl },
			],
		};
	},
	notFoundComponent: () => (
		<NotFoundCard
			badge="Profile not found"
			heading={<>This profile doesn&rsquo;t exist.</>}
			description={
				<>
					We couldn&rsquo;t find that user. The account may have been deleted,
					or the link you followed might be wrong.
				</>
			}
			footerLabel="404 profile not found"
		/>
	),
	component: ProfileLayout,
});

export { Route };
