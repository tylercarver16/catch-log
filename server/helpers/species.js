export const COMMON_SPECIES = [
  'Largemouth Bass', 'Smallmouth Bass', 'Spotted Bass',
  'Rainbow Trout', 'Brown Trout', 'Brook Trout',
  'Walleye', 'Northern Pike', 'Muskellunge',
  'Bluegill', 'Black Crappie', 'White Crappie',
  'Channel Catfish', 'Flathead Catfish', 'Blue Catfish',
  'White Bass', 'Yellow Perch',
];

const _ALL = Array.from(new Set([
  'Largemouth Bass', 'Smallmouth Bass', 'Spotted Bass', 'Guadalupe Bass',
  'Striped Bass', 'White Bass', 'Yellow Bass', 'Rock Bass',
  'Rainbow Trout', 'Brown Trout', 'Brook Trout', 'Lake Trout',
  'Bull Trout', 'Cutthroat Trout', 'Tiger Trout', 'Steelhead',
  'Chinook Salmon', 'Coho Salmon', 'Atlantic Salmon', 'Pink Salmon', 'Sockeye Salmon',
  'Northern Pike', 'Muskellunge', 'Tiger Muskie',
  'Chain Pickerel', 'Grass Pickerel', 'Redfin Pickerel',
  'Walleye', 'Sauger', 'Saugeye', 'Yellow Perch', 'White Perch',
  'Bluegill', 'Redear Sunfish', 'Green Sunfish', 'Pumpkinseed',
  'Longear Sunfish', 'Warmouth', 'Flier', 'Bantam Sunfish',
  'Black Crappie', 'White Crappie',
  'Channel Catfish', 'Blue Catfish', 'Flathead Catfish', 'White Catfish',
  'Yellow Bullhead', 'Brown Bullhead', 'Black Bullhead',
  'Common Carp', 'Grass Carp', 'Bighead Carp', 'Silver Carp', 'Black Carp',
  'Bigmouth Buffalo', 'Smallmouth Buffalo', 'Black Buffalo',
  'White Sucker', 'Shorthead Redhorse', 'Golden Redhorse', 'River Redhorse',
  'Largescale Sucker', 'Mountain Sucker', 'Blue Sucker',
  'Longnose Gar', 'Shortnose Gar', 'Spotted Gar', 'Alligator Gar', 'Florida Gar',
  'Freshwater Drum', 'Bowfin', 'American Eel', 'Burbot', 'Paddlefish',
  'Goldeye', 'Mooneye', 'Lake Whitefish', 'Mountain Whitefish', 'Cisco',
  'American Shad', 'Hickory Shad', 'Gizzard Shad', 'Threadfin Shad',
  'Stonecat', 'Tadpole Madtom', 'Flathead Chub',
])).sort();

export const EXTENDED_SPECIES = _ALL.filter(s => !COMMON_SPECIES.includes(s));

export const SPECIES_MARKER_COLORS = {
  'Largemouth Bass': '#2d6a4f',
};
export const DEFAULT_MARKER_COLOR = '#0d7377';

export function markerColor(species) {
  return SPECIES_MARKER_COLORS[species || ''] || DEFAULT_MARKER_COLOR;
}
