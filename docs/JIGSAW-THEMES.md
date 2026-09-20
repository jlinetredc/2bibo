# Jigsaw theme packs — TASK 024

## User-supplied Công chúa pack (2026-09-20)

Four supplied PNG screenshots are copied unchanged into
`public/images/themes/princess/`, preserving their original proportions,
borders and embedded screenshot marks. Both garden variants are retained as
requested. Catalogue total: nine packs, 24 pictures. All support 4–24 pieces.

| Asset | Original clipboard ID | Dimensions |
| --- | --- | --- |
| butterfly-garden.png | d45aef41-11b1-4ae3-bc5a-7091f1c3a87f | 684×459 |
| fairy-tales.png | 26ac7d45-4447-4dbb-9eb6-245de3908ded | 755×543 |
| garden-friends.png | cde9533f-796e-4b81-aee9-701415f97baa | 750×531 |
| forest-friends.png | 7b01b527-2728-4bec-9318-f604640cc588 | 683×488 |

These are user-provided images, not generated artwork. No Elsa picture was
supplied in this batch; the separate pending Elsa item is unchanged.

## User-requested character extension (2026-09-20)

The catalogue now also includes Doraemon and Cảnh sát trưởng Labrador, one new
four illustrations each, bringing the total to eight packs and twenty pictures.
These are generated illustrations, not official comic/film frames. The local
1448×1086 WebP assets are below 500 KB each. Prompts, provenance, saved paths and
the unsuccessful Elsa generation are recorded in `JIGSAW-CHARACTER-ART.md`.
Elsa has no selectable entry until a usable image is supplied.

The standalone picker exposes 4/6/9/12/16/24 pieces. Count/picture changes remain
drafts in a thumbnail library until “Bắt đầu ghép”; restart preserves the active count. The game now
emphasizes dragging image fragments over an optional faint guide, rather than
visible number matching. Accessible piece/target labels and tap/keyboard input
remain available. All remaining pieces appear on a freely rearrangeable mat without
pagination. “Xếp gọn” restores the initial spread; arrow keys also move a selected
piece. Landscape places the mat beside the board. These options are session-only.

The sections below record the original TASK 024 SVG packs.

`src/games/jigsaw/data/themePacks.ts` contains the immutable, ordered catalogue.
Each pack has a stable ID, Vietnamese title and two pictures with globally unique
IDs, Vietnamese labels/alt descriptions and declared 640×480 image dimensions.

| Pack ID | Title | Pictures |
| --- | --- | --- |
| animals | Động vật | Cáo nhỏ, Thỏ trong vườn |
| dinosaurs | Khủng long | Bạn cổ dài, Bạn lưng gai |
| vehicles | Xe cộ | Xe buýt vàng, Thuyền buồm |
| ocean | Đại dương | Rùa biển, Cá voi |
| space | Không gian | Tên lửa, Trăng và sao |
| farm | Nông trại | Nông trại nhỏ, Gà con |

## Assets and provenance

All twelve illustrations are original SVG markup authored for this repository
in TASK 024, without third-party source artwork, external fonts or remote image
dependencies. Files live under `public/images/themes/<pack>/<picture>.svg` so
later games can reuse the same artwork. They use simple recognizable silhouettes,
gentle colors, descriptive SVG title/desc elements and no embedded text labels,
scripts, external resources or animation. Each is below 8 KB.

SVG is appropriate for these flat vector illustrations and remains sharp as
pieces resize. Importing the catalogue loads metadata only; image bytes are
requested when a host renders the selected source. A host should not eagerly
render every theme at app startup. Local files remove third-party network
dependencies; offline caching still belongs to the later PWA tasks.

## Integration

- `JIGSAW_THEME_PACKS` supplies pack/picture lists for future selection UI.
- `getJigsawThemePack(id)` returns the matching immutable pack or `undefined`.
- `generateThemedPuzzle({ id, themeId, pictureId, profile?, level?, pieceCount? })`
  resolves a picture within its pack and delegates to the existing difficulty and
  image-piece generator. Unknown or cross-pack selections throw instead of
  silently replacing the child's choice. The host supplies a unique puzzle ID
  for the selected content/configuration and handles image loading failures.

Every picture supports the existing 4/6/9/12/16/24-piece grids. This increment
adds content and integration functions, not a production Jigsaw route, gallery,
saved theme preference or completion experience. TASK 025 remains separate.

## Validation

Eight new Node tests cover the six packs, unique IDs/paths, immutable metadata,
file presence/dimensions, self-contained SVG constraints and size limits,
every supported difficulty count for every picture, guest defaults and rejected
selections. Chromium and WebKit decode all twelve real assets and render their
24-piece reconstructions. Checks cover 320/375/768/1024px without horizontal
overflow or aspect-ratio distortion. Existing pixel-exact raster crop tests
also pass. The captured gallery and reconstructed images were visually reviewed.
There are no new pointer handlers; manual touch and physical iPad play remain
outside this content-only task.
