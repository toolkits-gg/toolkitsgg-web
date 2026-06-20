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
import {
	LuCamera,
	LuChevronRight,
	LuHeart,
	LuLayoutTemplate,
	LuLogOut,
	LuSettings,
	LuStar,
} from "react-icons/lu";
import { AvatarPicker } from "#/features/auth/AvatarPicker.tsx";
import { useResolvedAvatar } from "#/features/auth/use-resolved-avatar.ts";
import { useUserProfile } from "#/features/auth/use-user-profile.ts";
import { signOut } from "#/integrations/better-auth/auth-client.ts";
import classes from "./UserMenu.module.css";

export function UserMenu() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const theme = useMantineTheme();
	const { profile, isLoading, isAuthenticated, session } = useUserProfile();
	const { avatarUrl } = useResolvedAvatar();

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
	const profileHref =
		isAuthenticated && session?.user.id
			? `/account/profile/${session.user.id}`
			: "/profile";

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
					queryClient.removeQueries({ queryKey: ["dal"] });
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
							{profileHref && (
								<Text size="xs" c="primary" component="a" href={profileHref}>
									View your profile
								</Text>
							)}
						</div>
					</Group>

					<Menu.Divider />

					<Menu.Label>Builds</Menu.Label>
					<Menu.Item
						leftSection={<LuHeart size={16} color={theme.colors.red[6]} />}
						disabled
					>
						Liked builds
					</Menu.Item>
					<Menu.Item
						leftSection={<LuStar size={16} color={theme.colors.yellow[6]} />}
						disabled
					>
						Saved builds
					</Menu.Item>
					<Menu.Item
						leftSection={
							<LuLayoutTemplate size={16} color={theme.colors.blue[6]} />
						}
						disabled
					>
						Your build collections
					</Menu.Item>

					<Menu.Divider />

					<Menu.Label>Settings</Menu.Label>
					<Menu.Item
						leftSection={<LuCamera size={16} />}
						onClick={handleOpenAvatarPicker}
					>
						Change avatar
					</Menu.Item>
					{profileHref && (
						<Menu.Item
							leftSection={<LuSettings size={16} />}
							component="a"
							href={profileHref}
						>
							Account settings
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
