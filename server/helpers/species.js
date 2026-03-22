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
  // Bass — brand green
  'Largemouth Bass':  '#2ECC71',
  'Smallmouth Bass':  '#2ECC71',
  'Spotted Bass':     '#2ECC71',
  'Guadalupe Bass':   '#2ECC71',
  'Striped Bass':     '#2ECC71',
  'White Bass':       '#2ECC71',
  'Yellow Bass':      '#2ECC71',
  'Rock Bass':        '#2ECC71',
  // Trout & Salmon — amber
  'Rainbow Trout':    '#E8A020',
  'Brown Trout':      '#E8A020',
  'Brook Trout':      '#E8A020',
  'Lake Trout':       '#E8A020',
  'Bull Trout':       '#E8A020',
  'Cutthroat Trout':  '#E8A020',
  'Tiger Trout':      '#E8A020',
  'Steelhead':        '#E8A020',
  'Chinook Salmon':   '#E8A020',
  'Coho Salmon':      '#E8A020',
  'Atlantic Salmon':  '#E8A020',
  'Pink Salmon':      '#E8A020',
  'Sockeye Salmon':   '#E8A020',
  // Catfish — amber (earthy)
  'Channel Catfish':  '#E8A020',
  'Blue Catfish':     '#E8A020',
  'Flathead Catfish': '#E8A020',
  'White Catfish':    '#E8A020',
  'Yellow Bullhead':  '#E8A020',
  'Brown Bullhead':   '#E8A020',
  'Black Bullhead':   '#E8A020',
  // Pike, Musky, Pickerel — red
  'Northern Pike':    '#D94040',
  'Muskellunge':      '#D94040',
  'Tiger Muskie':     '#D94040',
  'Chain Pickerel':   '#D94040',
  'Grass Pickerel':   '#D94040',
  'Redfin Pickerel':  '#D94040',
  // Panfish, Perch, Walleye — muted sage
  'Bluegill':         '#94A08F',
  'Redear Sunfish':   '#94A08F',
  'Green Sunfish':    '#94A08F',
  'Pumpkinseed':      '#94A08F',
  'Longear Sunfish':  '#94A08F',
  'Warmouth':         '#94A08F',
  'Flier':            '#94A08F',
  'Bantam Sunfish':   '#94A08F',
  'Black Crappie':    '#94A08F',
  'White Crappie':    '#94A08F',
  'Walleye':          '#94A08F',
  'Sauger':           '#94A08F',
  'Saugeye':          '#94A08F',
  'Yellow Perch':     '#94A08F',
  'White Perch':      '#94A08F',
};
export const DEFAULT_MARKER_COLOR = '#2ECC71';

export function markerColor(species) {
  return SPECIES_MARKER_COLORS[species || ''] || DEFAULT_MARKER_COLOR;
}
