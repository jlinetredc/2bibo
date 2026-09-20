import type { JigsawImage } from "../domain/imagePieces";
import { generateDifficultyPuzzle } from "../domain/difficulty";

export interface JigsawPicture { readonly id: string; readonly title: string; readonly image: JigsawImage }
export interface JigsawThemePack { readonly id: string; readonly title: string; readonly pictures: readonly JigsawPicture[] }

/** Local vector and generated illustrations. Metadata imports do not fetch image bytes. */
export const JIGSAW_THEME_PACKS: readonly JigsawThemePack[] = Object.freeze([
  Object.freeze({ id: "doraemon", title: "Doraemon", pictures: Object.freeze([
    Object.freeze({ id: "doraemon-garden", title: "Doraemon trong vườn", image: Object.freeze({ src: "/images/themes/doraemon/garden.webp", alt: "Doraemon vui chơi trong khu vườn đầy hoa, bướm và hồ cá.", width: 1448, height: 1086 }) }),
    Object.freeze({ id: "doraemon-picnic", title: "Doraemon và buổi picnic", image: Object.freeze({ src: "/images/themes/doraemon/picnic.webp", alt: "Doraemon, Nobita và Shizuka cùng ăn picnic bên dòng suối.", width: 1448, height: 1086 }) }),
    Object.freeze({ id: "doraemon-sky", title: "Bay cùng Dorami", image: Object.freeze({ src: "/images/themes/doraemon/sky.webp", alt: "Doraemon, Nobita và Dorami bay trên đồng hoa với chong chóng tre.", width: 1448, height: 1086 }) }),
    Object.freeze({ id: "doraemon-friends", title: "Đường tàu của các bạn", image: Object.freeze({ src: "/images/themes/doraemon/friends.webp", alt: "Doraemon, Nobita, Shizuka, Gian và Suneo cùng chơi đường tàu trong vườn.", width: 1448, height: 1086 }) }),
  ]) }),
  Object.freeze({ id: "labrador", title: "Cảnh sát trưởng Labrador", pictures: Object.freeze([
    Object.freeze({ id: "labrador-garden", title: "Cảnh sát trưởng Labrador", image: Object.freeze({ src: "/images/themes/labrador/garden.webp", alt: "Chú chó cảnh sát Labrador giúp bạn thỏ bên xe cảnh sát trong thị trấn.", width: 1448, height: 1086 }) }),
    Object.freeze({ id: "labrador-crossing", title: "Cùng qua đường", image: Object.freeze({ src: "/images/themes/labrador/crossing.webp", alt: "Labrador giúp các bạn thỏ, mèo và vịt đi qua vạch sang đường.", width: 1448, height: 1086 }) }),
    Object.freeze({ id: "labrador-park", title: "Quả bóng của bạn thỏ", image: Object.freeze({ src: "/images/themes/labrador/park.webp", alt: "Labrador và bạn cảnh sát Doberman trao bóng bay cho các bạn nhỏ trong công viên.", width: 1448, height: 1086 }) }),
    Object.freeze({ id: "labrador-rescue", title: "Khu vườn của gấu trúc", image: Object.freeze({ src: "/images/themes/labrador/rescue.webp", alt: "Labrador, chú chó cứu hỏa và bạn gấu trúc cùng tưới hoa bên xe cứu hỏa.", width: 1448, height: 1086 }) }),
  ]) }),
  Object.freeze({ id: "princess", title: "Công chúa", pictures: Object.freeze([
    Object.freeze({ id: "princess-butterfly-garden", title: "Vườn bướm công chúa", image: Object.freeze({ src: "/images/themes/princess/butterfly-garden.png", alt: "Các nàng công chúa vui chơi giữa hoa và bướm trước lâu đài.", width: 684, height: 459 }) }),
    Object.freeze({ id: "princess-fairy-tales", title: "Những người bạn cổ tích", image: Object.freeze({ src: "/images/themes/princess/fairy-tales.png", alt: "Các nàng công chúa cùng những người bạn trong khung hoa màu hồng.", width: 755, height: 543 }) }),
    Object.freeze({ id: "princess-garden-friends", title: "Công chúa bên lâu đài", image: Object.freeze({ src: "/images/themes/princess/garden-friends.png", alt: "Các nàng công chúa gặp nhau trong khu vườn xanh bên lâu đài.", width: 750, height: 531 }) }),
    Object.freeze({ id: "princess-forest-friends", title: "Bạn nhỏ trong rừng", image: Object.freeze({ src: "/images/themes/princess/forest-friends.png", alt: "Các nàng công chúa chơi cùng hươu, thỏ và chim trong khu rừng.", width: 683, height: 488 }) }),
  ]) }),
  Object.freeze({ id: "animals", title: "Động vật", pictures: Object.freeze([
    Object.freeze({ id: "animals-fox", title: "Cáo nhỏ", image: Object.freeze({ src: "/images/themes/animals/fox.svg", alt: "Cáo màu cam ngồi bên hoa và cây.", width: 640, height: 480 }) }),
    Object.freeze({ id: "animals-rabbit", title: "Thỏ trong vườn", image: Object.freeze({ src: "/images/themes/animals/rabbit.svg", alt: "Thỏ trắng với đôi tai dài bên củ cà rốt.", width: 640, height: 480 }) }),
  ]) }),
  Object.freeze({ id: "dinosaurs", title: "Khủng long", pictures: Object.freeze([
    Object.freeze({ id: "dinosaurs-long-neck", title: "Bạn cổ dài", image: Object.freeze({ src: "/images/themes/dinosaurs/long-neck.svg", alt: "Khủng long cổ dài màu xanh đứng cạnh cây lá rộng.", width: 640, height: 480 }) }),
    Object.freeze({ id: "dinosaurs-stegosaurus", title: "Bạn lưng gai", image: Object.freeze({ src: "/images/themes/dinosaurs/stegosaurus.svg", alt: "Khủng long tím với các tấm lưng màu hồng trên đồng cỏ.", width: 640, height: 480 }) }),
  ]) }),
  Object.freeze({ id: "vehicles", title: "Xe cộ", pictures: Object.freeze([
    Object.freeze({ id: "vehicles-bus", title: "Xe buýt vàng", image: Object.freeze({ src: "/images/themes/vehicles/bus.svg", alt: "Xe buýt vàng với ba cửa sổ xanh chạy trên đường.", width: 640, height: 480 }) }),
    Object.freeze({ id: "vehicles-sailboat", title: "Thuyền buồm", image: Object.freeze({ src: "/images/themes/vehicles/sailboat.svg", alt: "Thuyền buồm đỏ và vàng trên làn nước xanh.", width: 640, height: 480 }) }),
  ]) }),
  Object.freeze({ id: "ocean", title: "Đại dương", pictures: Object.freeze([
    Object.freeze({ id: "ocean-turtle", title: "Rùa biển", image: Object.freeze({ src: "/images/themes/ocean/turtle.svg", alt: "Rùa biển xanh bơi giữa rong biển và bong bóng.", width: 640, height: 480 }) }),
    Object.freeze({ id: "ocean-whale", title: "Cá voi", image: Object.freeze({ src: "/images/themes/ocean/whale.svg", alt: "Cá voi xanh phun nước giữa biển và những bong bóng.", width: 640, height: 480 }) }),
  ]) }),
  Object.freeze({ id: "space", title: "Không gian", pictures: Object.freeze([
    Object.freeze({ id: "space-rocket", title: "Tên lửa", image: Object.freeze({ src: "/images/themes/space/rocket.svg", alt: "Tên lửa trắng bay giữa các ngôi sao và một hành tinh.", width: 640, height: 480 }) }),
    Object.freeze({ id: "space-moon", title: "Trăng và sao", image: Object.freeze({ src: "/images/themes/space/moon.svg", alt: "Mặt trăng vàng bên các ngôi sao và một hành tinh tím.", width: 640, height: 480 }) }),
  ]) }),
  Object.freeze({ id: "farm", title: "Nông trại", pictures: Object.freeze([
    Object.freeze({ id: "farm-barn", title: "Nông trại nhỏ", image: Object.freeze({ src: "/images/themes/farm/barn.svg", alt: "Nhà kho đỏ, hàng rào trắng và cây trên đồng cỏ.", width: 640, height: 480 }) }),
    Object.freeze({ id: "farm-chick", title: "Gà con", image: Object.freeze({ src: "/images/themes/farm/chick.svg", alt: "Gà con màu vàng đứng cạnh quả trứng và bông hoa.", width: 640, height: 480 }) }),
  ]) }),
]);

export function getJigsawThemePack(id: string): JigsawThemePack | undefined {
  return JIGSAW_THEME_PACKS.find((pack) => pack.id === id);
}

/** The selected image feeds the same age/count generation path as other puzzles. */
export function generateThemedPuzzle({ themeId, pictureId, ...options }: Omit<Parameters<typeof generateDifficultyPuzzle>[0], "image"> & {
  readonly themeId: string; readonly pictureId: string;
}) {
  const picture = getJigsawThemePack(themeId)?.pictures.find((entry) => entry.id === pictureId);
  if (!picture) throw new RangeError("Unknown picture in Jigsaw theme pack.");
  return generateDifficultyPuzzle({ ...options, image: picture.image });
}
