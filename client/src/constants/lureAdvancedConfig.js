// Field definitions for the Advanced lure panel, keyed by lure_type.
// type: 'select' | 'text'
// wide: true = spans full width (col-12), default is half-width (col-6)

export const ADVANCED_CONFIG = {
  soft_plastic: [
    { key: 'sub_type',  label: 'Style',                type: 'select', options: ['Worm', 'Stick Bait', 'Creature', 'Craw', 'Tube', 'Fluke', 'Grub', 'Finesse / Ned'] },
    { key: 'rig',       label: 'Rig',                  type: 'select', options: ['Texas', 'Carolina', 'Wacky', 'Drop Shot', 'Ned', 'Neko', 'Shaky Head', 'Weightless', 'Jighead'] },
    { key: 'weight',    label: 'Sinker / Head Weight',  type: 'text',   placeholder: '3/16 oz' },
    { key: 'size',      label: 'Size',                 type: 'text',   placeholder: '5"' },
    { key: 'color',     label: 'Color',                type: 'text',   placeholder: 'Green Pumpkin' },
  ],

  crankbait: [
    { key: 'sub_type',   label: 'Style',      type: 'select', options: ['Square Bill', 'Standard Diver', 'Lipless', 'Flat-sided', 'Wakebait'] },
    { key: 'dive_depth', label: 'Dive Depth', type: 'text',   placeholder: '8 ft' },
    { key: 'buoyancy',   label: 'Buoyancy',   type: 'select', options: ['Floating', 'Suspending', 'Sinking'] },
    { key: 'size',       label: 'Size',       type: 'text',   placeholder: '2.5"' },
    { key: 'color',      label: 'Color',      type: 'text',   placeholder: 'Chartreuse Shad' },
    { key: 'model',      label: 'Model',      type: 'text',   placeholder: 'Strike King 6XD', wide: true },
  ],

  jerkbait: [
    { key: 'sub_type', label: 'Depth Range', type: 'select', options: ['Shallow (0–3 ft)', 'Mid (4–8 ft)', 'Deep (8+ ft)'] },
    { key: 'buoyancy', label: 'Buoyancy',    type: 'select', options: ['Floating', 'Suspending', 'Sinking'] },
    { key: 'size',     label: 'Size',        type: 'text',   placeholder: '4.5"' },
    { key: 'color',    label: 'Color',       type: 'text',   placeholder: 'Ghost Minnow' },
    { key: 'model',    label: 'Model',       type: 'text',   placeholder: 'Rapala X-Rap 10', wide: true },
  ],

  topwater: [
    { key: 'sub_type', label: 'Style', type: 'select', options: ['Popper', 'Walker', 'Frog', 'Prop Bait', 'Whopper Plopper', 'Buzzbait'] },
    { key: 'size',     label: 'Size',  type: 'text',   placeholder: '3"' },
    { key: 'color',    label: 'Color', type: 'text',   placeholder: 'Bone' },
    { key: 'model',    label: 'Model', type: 'text',   placeholder: 'Zara Spook', wide: true },
  ],

  jig: [
    { key: 'sub_type',      label: 'Style',         type: 'select', options: ['Flipping', 'Football', 'Swim', 'Finesse', 'Casting', 'Hair'] },
    { key: 'weight',        label: 'Weight',        type: 'text',   placeholder: '3/8 oz' },
    { key: 'skirt_color',   label: 'Skirt Color',   type: 'text',   placeholder: 'Black / Blue' },
    { key: 'trailer',       label: 'Trailer',       type: 'text',   placeholder: 'Rage Craw' },
    { key: 'trailer_color', label: 'Trailer Color', type: 'text',   placeholder: 'Black / Blue' },
    { key: 'model',         label: 'Model',         type: 'text',   placeholder: 'Booyah Boo Jig', wide: true },
  ],

  spinnerbait: [
    { key: 'sub_type',    label: 'Style',       type: 'select', options: ['Spinnerbait', 'Bladed Jig / ChatterBait'] },
    { key: 'blade_type',  label: 'Blade Type',  type: 'select', options: ['Colorado', 'Willow', 'Indiana', 'Tandem'] },
    { key: 'weight',      label: 'Weight',      type: 'text',   placeholder: '1/2 oz' },
    { key: 'skirt_color', label: 'Skirt Color', type: 'text',   placeholder: 'White / Chartreuse' },
    { key: 'trailer',     label: 'Trailer',     type: 'text',   placeholder: 'Swimbait tail' },
  ],

  swimbait: [
    { key: 'sub_type', label: 'Style',          type: 'select', options: ['Soft Paddle Tail', 'Soft Boot Tail', 'Hard Multi-joint', 'Glide Bait'] },
    { key: 'size',     label: 'Size',           type: 'text',   placeholder: '4"' },
    { key: 'weight',   label: 'Jighead Weight', type: 'text',   placeholder: '1/4 oz' },
    { key: 'color',    label: 'Color',          type: 'text',   placeholder: 'Shad' },
    { key: 'model',    label: 'Model',          type: 'text',   placeholder: '',     wide: true },
  ],

  spoon: [
    { key: 'sub_type', label: 'Style',  type: 'select', options: ['Flutter', 'Casting', 'Weedless', 'Jigging'] },
    { key: 'weight',   label: 'Weight', type: 'text',   placeholder: '1/2 oz' },
    { key: 'color',    label: 'Color',  type: 'text',   placeholder: 'Chrome' },
  ],

  live_bait: [
    { key: 'sub_type', label: 'Bait Type', type: 'select', options: ['Worm', 'Minnow', 'Shad', 'Shiner', 'Crayfish', 'Cricket', 'Leech', 'Bluegill', 'Other'] },
    { key: 'rig',      label: 'Rig',       type: 'select', options: ['Carolina', 'Texas', 'Float / Bobber', 'Free-lined', 'Jighead'] },
    { key: 'size',     label: 'Size',      type: 'text',   placeholder: 'Medium' },
  ],

  fly: [
    { key: 'sub_type',  label: 'Type',      type: 'select', options: ['Dry Fly', 'Nymph', 'Streamer', 'Wet Fly', 'Popper / Bass Bug', 'Emerger'] },
    { key: 'hook_size', label: 'Hook Size', type: 'text',   placeholder: '#14' },
    { key: 'color',     label: 'Color',     type: 'text',   placeholder: 'Olive' },
    { key: 'pattern',   label: 'Pattern',   type: 'text',   placeholder: 'Adams', wide: true },
  ],

  other: [
    { key: 'color', label: 'Color', type: 'text', placeholder: '' },
    { key: 'size',  label: 'Size',  type: 'text', placeholder: '' },
  ],
};
