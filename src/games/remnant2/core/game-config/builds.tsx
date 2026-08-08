import type { GameBuildsConfig } from "#/features/game/types";
import { REMNANT2_BUILD_TAG_OPTIONS } from "#/games/remnant2/core/build-tags";
import { Remnant2BuildTool } from "#/games/remnant2/core/build-tool/Remnant2BuildTool";
import { remnant2BuildCollectionsData } from "#/games/remnant2/data/build-collections/use-build-collections";
import { remnant2BuildFeedsData } from "#/games/remnant2/data/build-feeds/use-build-feeds";
import { remnant2BuildUpvotesData } from "#/games/remnant2/data/build-upvotes/use-build-upvotes";
import { remnant2CreatedBuildsData } from "#/games/remnant2/data/created-builds/use-created-builds";
import { remnant2ModerationData } from "#/games/remnant2/data/moderation/use-moderation";

const BUILDS: GameBuildsConfig = {
	data: {
		builds: remnant2CreatedBuildsData,
		collections: remnant2BuildCollectionsData,
		upvotes: remnant2BuildUpvotesData,
		feeds: remnant2BuildFeedsData,
		moderation: remnant2ModerationData,
	},
	renderBuildTool: (args) => <Remnant2BuildTool {...args} />,
	tagOptions: REMNANT2_BUILD_TAG_OPTIONS,
};

export { BUILDS };
