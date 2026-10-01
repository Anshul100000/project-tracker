// Photos from Unsplash (via picsum.photos), free to use under the Unsplash License.
import sidebarCity from "assets/images/pt/sidebar-city.jpg";
import sidebarArchitecture from "assets/images/pt/sidebar-architecture.jpg";
import sidebarFjord from "assets/images/pt/sidebar-fjord.jpg";
import sidebarMountains from "assets/images/pt/sidebar-mountains.jpg";
import coverFjord from "assets/images/pt/cover-fjord.jpg";
import bannerCity from "assets/images/pt/banner-city.jpg";

// Sidebar background choices shown in the appearance panel. `null` = plain navy.
export const SIDENAV_BACKGROUNDS = {
  city: { name: "City", src: sidebarCity },
  architecture: { name: "Architecture", src: sidebarArchitecture },
  fjord: { name: "Fjord", src: sidebarFjord },
  mountains: { name: "Mountains", src: sidebarMountains },
  none: { name: "Solid", src: null },
};

export { coverFjord, bannerCity };
