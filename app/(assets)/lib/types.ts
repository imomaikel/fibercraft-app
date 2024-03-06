import { NAV_LINKS } from './constans';

export type TAllNavLabels = (typeof NAV_LINKS)[number]['itemsOnHover'][number]['label'];
export type TAllNavPaths = (typeof NAV_LINKS)[number]['itemsOnHover'][number]['path'];
