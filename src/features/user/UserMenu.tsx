import {
	Avatar,
	Button,
	Flex,
	Group,
	Menu,
	Skeleton,
	Text,
	UnstyledButton,
	useMantineTheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { BsCollection } from "react-icons/bs";
import { GiCapeArmor } from "react-icons/gi";
import {
	LuCamera,
	LuChevronRight,
	LuHeart,
	LuLayoutTemplate,
	LuLogOut,
	LuSettings,
	LuShield,
} from "react-icons/lu";
import { useViewerGrants } from "#/features/auth/use-viewer-grants";
import { useGameId } from "#/features/game/use-game-id";
import { AvatarPicker } from "#/features/user/AvatarPicker";
import { useProfileLinks } from "#/features/user/use-profile-links";
import { useResolvedAvatar } from "#/features/user/use-resolved-avatar";
import { useUserProfile } from "#/features/user/use-user-profile";
import { gameSupportsBuilds } from "#/games-registry/builds-registry";
import { signOut } from "#/integrations/better-auth/auth-client";
import classes from "./UserMenu.module.css";

export function UserMenu() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const theme = useMantineTheme();
	const { profile, isLoading, isAuthenticated, session } = useUserProfile();
	const { avatarUrl } = useResolvedAvatar();
	const profileLinks = useProfileLinks();
	const gameId = useGameId();
	const supportsBuilds = gameSupportsBuilds(gameId);
	const { hasAnyRole } = useViewerGrants();

	if (isLoading) {
		return <Skeleton height={75} width="100%" animate />;
	}

	const displayName = profile?.displayName ?? "Traveler";
	const initials = displayName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const subtitle = isAuthenticated
		? (session?.user.email ?? "")
		: "Local account";

	const handleOpenAvatarPicker = () => {
		modals.open({
			title: "Choose avatar",
			size: "lg",
			children: <AvatarPicker />,
		});
	};

	const handleSignOut = () => {
		signOut({
			fetchOptions: {
				onSuccess: async () => {
					queryClient.removeQueries({ queryKey: ["data"] });
					await navigate({ to: "/" });
				},
			},
		});
	};

	return (
		<Group justify="center" w="100%" data-wizard-target="user-menu">
			<Menu
				withArrow
				width={300}
				position="top"
				transitionProps={{ transition: "pop" }}
				withinPortal
				classNames={{
					dropdown: classes.menuDropdown,
					item: classes.menuItem,
					divider: classes.menuDivider,
				}}
			>
				<Menu.Target>
					<UnstyledButton className={classes.user}>
						<Group wrap="nowrap">
							<Avatar src={avatarUrl} radius="xl">
								{initials}
							</Avatar>

							<div style={{ flex: 1 }}>
								<Text size="sm" fw={500}>
									{displayName}
								</Text>
								<Text c="dimmed" size="xs">
									{subtitle}
								</Text>
							</div>

							<LuChevronRight size={14} />
						</Group>
					</UnstyledButton>
				</Menu.Target>

				<Menu.Dropdown>
					<Group px="md" py="xs">
						<Avatar radius="xl" src={avatarUrl}>
							{initials}
						</Avatar>
						<div>
							<Text fw={500}>{displayName}</Text>
							<Text size="xs" c="dimmed">
								{subtitle}
							</Text>
							<Text
								size="xs"
								c="primary"
								renderRoot={(props) => (
									<Link {...props} {...profileLinks.home} />
								)}
							>
								View your profile
							</Text>
						</div>
					</Group>

					<Menu.Divider />

					{supportsBuilds && (
						<>
							<Menu.Label>Builds</Menu.Label>
							<Menu.Item
								leftSection={<LuHeart size={16} color={theme.colors.red[6]} />}
								renderRoot={(props) => (
									<Link {...props} {...profileLinks.likedBuilds} />
								)}
							>
								Liked builds
							</Menu.Item>
							<Menu.Item
								leftSection={
									<GiCapeArmor size={16} color={theme.colors.yellow[6]} />
								}
								renderRoot={(props) => (
									<Link {...props} {...profileLinks.createdBuilds} />
								)}
							>
								Created builds
							</Menu.Item>
							<Menu.Item
								leftSection={
									<LuLayoutTemplate size={16} color={theme.colors.blue[6]} />
								}
								renderRoot={(props) => (
									<Link {...props} {...profileLinks.buildCollections} />
								)}
							>
								Your build collections
							</Menu.Item>

							<Menu.Divider />
						</>
					)}

					<Menu.Label>Collection</Menu.Label>
					<Menu.Item
						leftSection={
							<BsCollection size={16} color={theme.colors.teal[6]} />
						}
						renderRoot={(props) => (
							<Link {...props} {...profileLinks.collectedItems} />
						)}
					>
						Collected items
					</Menu.Item>

					<Menu.Divider />

					<Menu.Label>Settings</Menu.Label>
					<Menu.Item
						leftSection={<LuCamera size={16} />}
						onClick={handleOpenAvatarPicker}
					>
						Change avatar
					</Menu.Item>
					{isAuthenticated && (
						<Menu.Item
							leftSection={<LuSettings size={16} />}
							renderRoot={(props) => <Link {...props} to="/account/settings" />}
						>
							Account settings
						</Menu.Item>
					)}

					{hasAnyRole && (
						<Menu.Item
							leftSection={
								<LuShield size={16} color={theme.colors.orange[6]} />
							}
							renderRoot={(props) => <Link {...props} to="/admin" />}
						>
							Moderation
						</Menu.Item>
					)}

					<Menu.Divider />

					<Group
						px="sm"
						py="xs"
						bg="light-dark(var(--mantine-color-popover-1), var(--mantine-color-popover-8))"
						w="100%"
					>
						{isAuthenticated ? (
							<Button
								leftSection={<LuLogOut size={16} />}
								onClick={handleSignOut}
								variant="filled"
								w="100%"
							>
								Log out
							</Button>
						) : (
							<Flex align="center" justify="space-between" w="100%" gap="md">
								<Button
									component={Link}
									href="/sign-up"
									w="100%"
									variant="filled"
								>
									Sign up
								</Button>
								<Button
									component={Link}
									href="/sign-in"
									w="100%"
									variant="subtle"
								>
									Sign in
								</Button>
							</Flex>
						)}
					</Group>
				</Menu.Dropdown>
			</Menu>
		</Group>
	);
}
