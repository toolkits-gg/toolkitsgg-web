import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Card,
	Group,
	Select,
	Stack,
	Text,
	TextInput,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LuSearch, LuX } from "react-icons/lu";
import { ReasonModal } from "#/documents/admin/ReasonModal.tsx";
import { ROLE_VALUES } from "#/features/auth/capabilities.ts";
import type { AdminUserRow } from "#/features/auth/roles.server.ts";
import {
	banUserServerFn,
	GAME_ID_VALUES,
	grantRoleServerFn,
	revokeRoleServerFn,
	searchUsersServerFn,
	unbanUserServerFn,
} from "#/features/auth/roles.ts";
import { useViewerGrants } from "#/features/auth/use-viewer-grants.ts";
import type { GameId, Role } from "@/prisma";

const ROLE_OPTIONS = ROLE_VALUES.map((role) => ({ value: role, label: role }));

const GAME_OPTIONS = GAME_ID_VALUES.map((gameId) => ({
	value: gameId,
	label: gameId === "none" ? "Site-wide" : gameId,
}));

const roleLabel = (grant: { role: Role; gameId: GameId }) =>
	grant.gameId === "none" ? grant.role : `${grant.role} · ${grant.gameId}`;

const AdminUsers = () => {
	const queryClient = useQueryClient();
	const { can } = useViewerGrants();
	const canManageRoles = can("role:manage", "none");
	const canBan = can("user:ban", "none");

	const [input, setInput] = useState("");
	const [query, setQuery] = useState("");
	const [role, setRole] = useState<string>("MODERATOR");
	const [gameId, setGameId] = useState<string>("none");
	const [banTarget, setBanTarget] = useState<AdminUserRow | null>(null);

	const results = useQuery({
		queryKey: ["data", "adminUsers", query],
		queryFn: (): Promise<AdminUserRow[]> =>
			searchUsersServerFn({ data: { query } }),
		enabled: query.length > 0,
	});

	const refresh = () => {
		void queryClient.invalidateQueries({ queryKey: ["data", "adminUsers"] });
	};

	const grant = useMutation({
		mutationFn: (vars: { userId: string; role: Role; gameId: GameId }) =>
			grantRoleServerFn({ data: vars }),
		onSuccess: refresh,
	});
	const revoke = useMutation({
		mutationFn: (vars: { userId: string; role: Role; gameId: GameId }) =>
			revokeRoleServerFn({ data: vars }),
		onSuccess: refresh,
	});
	const ban = useMutation({
		mutationFn: (vars: {
			userId: string;
			reason: string;
			hideContent: boolean;
		}) => banUserServerFn({ data: vars }),
		onSuccess: refresh,
	});
	const unban = useMutation({
		mutationFn: (vars: { userId: string }) => unbanUserServerFn({ data: vars }),
		onSuccess: refresh,
	});

	const error =
		grant.error ?? revoke.error ?? ban.error ?? unban.error ?? results.error;

	return (
		<Stack gap="md">
			<Group align="flex-end" gap="sm">
				<TextInput
					label="Find a user"
					description="Username, partial match"
					value={input}
					onChange={(event) => setInput(event.currentTarget.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") setQuery(input.trim());
					}}
					leftSection={<LuSearch size={16} />}
					flex={1}
				/>
				<Button onClick={() => setQuery(input.trim())}>Search</Button>
			</Group>

			{error && (
				<Alert color="red" title="Action failed">
					{error.message}
				</Alert>
			)}

			{canManageRoles && (
				<Group align="flex-end" gap="sm">
					<Select
						label="Role to grant"
						data={ROLE_OPTIONS}
						value={role}
						onChange={(value) => setRole(value ?? "MODERATOR")}
						allowDeselect={false}
					/>
					<Select
						label="Scope"
						description="Site-wide applies to every game"
						data={GAME_OPTIONS}
						value={gameId}
						onChange={(value) => setGameId(value ?? "none")}
						allowDeselect={false}
					/>
				</Group>
			)}

			{results.data?.length === 0 && query.length > 0 && (
				<Text c="dimmed">No users match "{query}".</Text>
			)}

			{results.data?.map((user) => (
				<Card key={user.id} withBorder padding="md">
					<Stack gap="sm">
						<Group justify="space-between">
							<Group gap="xs">
								<Text fw={600}>{user.username}</Text>
								{user.displayName && (
									<Text size="sm" c="dimmed">
										{user.displayName}
									</Text>
								)}
								{user.bannedAt && (
									<Badge color="red" variant="light">
										banned
									</Badge>
								)}
							</Group>
							{canBan &&
								(user.bannedAt ? (
									<Button
										size="xs"
										variant="default"
										onClick={() => unban.mutate({ userId: user.id })}
									>
										Unban
									</Button>
								) : (
									<Button
										size="xs"
										color="red"
										variant="light"
										onClick={() => setBanTarget(user)}
									>
										Ban
									</Button>
								))}
						</Group>

						{user.bannedAt && user.banReason && (
							<Text size="sm" c="dimmed">
								Reason: {user.banReason}
							</Text>
						)}

						<Group gap="xs">
							{user.roles.length === 0 ? (
								<Text size="sm" c="dimmed">
									No roles
								</Text>
							) : (
								user.roles.map((userRole) => (
									<Badge
										key={`${userRole.role}-${userRole.gameId}`}
										variant="light"
										rightSection={
											canManageRoles ? (
												<ActionIcon
													size="xs"
													variant="transparent"
													color="gray"
													aria-label={`Revoke ${userRole.role}`}
													onClick={() =>
														revoke.mutate({
															userId: user.id,
															role: userRole.role,
															gameId: userRole.gameId,
														})
													}
												>
													<LuX size={12} />
												</ActionIcon>
											) : null
										}
									>
										{roleLabel(userRole)}
									</Badge>
								))
							)}
						</Group>

						{canManageRoles && (
							<Group>
								<Button
									size="xs"
									variant="default"
									loading={grant.isPending}
									onClick={() =>
										grant.mutate({
											userId: user.id,
											role: role as Role,
											gameId: gameId as GameId,
										})
									}
								>
									Grant {role}
									{gameId === "none" ? " site-wide" : ` for ${gameId}`}
								</Button>
							</Group>
						)}
					</Stack>
				</Card>
			))}

			{banTarget && (
				<ReasonModal
					opened
					title={`Ban ${banTarget.username}`}
					description="Their sessions end immediately and every request is refused until the ban is lifted."
					confirmLabel="Ban and hide content"
					danger
					onCancel={() => setBanTarget(null)}
					onConfirm={(reason) => {
						ban.mutate({
							userId: banTarget.id,
							reason,
							hideContent: true,
						});
						setBanTarget(null);
					}}
				/>
			)}
		</Stack>
	);
};

export { AdminUsers };
