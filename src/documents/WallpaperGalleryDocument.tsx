import {
	Button,
	Card,
	Group,
	Modal,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Title,
	UnstyledButton,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMemo, useState } from "react";
import { LuDownload, LuSearch } from "react-icons/lu";
import { AppImage } from "#/components/AppImage.tsx";
import type { GameWallpaper } from "#/features/game/types.ts";
import { downloadWallpaper } from "#/features/wallpaper/download-wallpaper.ts";
import { WallpaperAttributionText } from "#/features/wallpaper/WallpaperAttributionText.tsx";
import {
	wallpaperFullUrl,
	wallpaperVariantUrl,
} from "#/features/wallpaper/wallpaper-image.ts";
import {
	getGameMetadata,
	getGameWallpapers,
} from "#/games-registry/public-registry.ts";
import type { GameId } from "@/prisma";
import classes from "./WallpaperGalleryDocument.module.css";

type WallpaperGalleryProps = { gameId: GameId };

const WallpaperGalleryDocument = ({ gameId }: WallpaperGalleryProps) => {
	const wallpapers = useMemo(() => getGameWallpapers(gameId) ?? [], [gameId]);
	const [search, setSearch] = useState("");
	const [debouncedSearch] = useDebouncedValue(search, 250);
	const [selected, setSelected] = useState<GameWallpaper | null>(null);
	const [downloading, setDownloading] = useState(false);
	const [opened, { open, close }] = useDisclosure(false);

	const matches = useMemo(() => {
		const query = debouncedSearch.trim().toLowerCase();
		if (!query) return wallpapers;
		return wallpapers.filter((w) =>
			`${w.name ?? ""} ${w.imageUrl}`.toLowerCase().includes(query),
		);
	}, [wallpapers, debouncedSearch]);

	const handleSelect = (wallpaper: GameWallpaper) => {
		setSelected(wallpaper);
		open();
	};

	const handleDownload = async (wallpaper: GameWallpaper) => {
		setDownloading(true);
		try {
			await downloadWallpaper(wallpaper, gameId);
		} catch (cause) {
			notifications.show({
				color: "red",
				title: "Couldn't download",
				message:
					cause instanceof Error ? cause.message : "Failed to download image.",
			});
		} finally {
			setDownloading(false);
		}
	};

	const renderCard = (wallpaper: GameWallpaper) => (
		<Card
			key={wallpaper.id}
			withBorder
			p={0}
			radius="md"
			className={classes.card}
		>
			<UnstyledButton
				onClick={() => handleSelect(wallpaper)}
				aria-label={`Preview ${wallpaper.name ?? "wallpaper"}`}
				className={classes.preview}
			>
				<AppImage
					src={wallpaperVariantUrl(wallpaper, gameId, "thumb")}
					fallbackSrc={wallpaperFullUrl(wallpaper, gameId)}
					alt={wallpaper.name ?? ""}
					loading="lazy"
					className={classes.thumb}
				/>
				{wallpaper.name && (
					<Text size="sm" fw={500} truncate px="xs" pt={6}>
						{wallpaper.name}
					</Text>
				)}
			</UnstyledButton>
			{wallpaper.attribution && (
				<WallpaperAttributionText
					attribution={wallpaper.attribution}
					px="xs"
					pb={6}
				/>
			)}
		</Card>
	);

	return (
		<Stack gap="lg" p="md">
			<Stack gap={4}>
				<Title order={2}>
					{getGameMetadata(gameId)?.label ?? gameId} Wallpapers
				</Title>
				<Text size="sm" c="dimmed">
					Browse and download artwork. You can also use any of these as your
					build image or profile header.
				</Text>
			</Stack>

			<TextInput
				placeholder="Search wallpapers..."
				leftSection={<LuSearch size={16} />}
				value={search}
				onChange={(event) => setSearch(event.currentTarget.value)}
			/>

			{matches.length === 0 ? (
				<Text c="dimmed" ta="center" py="xl">
					No wallpapers match "{debouncedSearch}".
				</Text>
			) : (
				<SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
					{matches.map(renderCard)}
				</SimpleGrid>
			)}

			<Modal
				opened={opened}
				onClose={close}
				size="xl"
				title={selected?.name}
				centered
			>
				{selected && (
					<Stack gap="md">
						<AppImage
							src={wallpaperVariantUrl(selected, gameId, "preview")}
							fallbackSrc={wallpaperFullUrl(selected, gameId)}
							alt={selected.name ?? ""}
							radius="sm"
						/>
						<Group
							justify={selected.attribution ? "space-between" : "flex-end"}
						>
							{selected.attribution && (
								<WallpaperAttributionText
									attribution={selected.attribution}
									size="sm"
								/>
							)}
							<Button
								leftSection={<LuDownload size={16} />}
								loading={downloading}
								onClick={() => void handleDownload(selected)}
							>
								Download
							</Button>
						</Group>
					</Stack>
				)}
			</Modal>
		</Stack>
	);
};

export { WallpaperGalleryDocument };
