import { Basket } from 'tebex_headless';
import { NAV_LINKS } from './constans';

export type TAllNavLabels = (typeof NAV_LINKS)[number]['itemsOnHover'][number]['label'];
export type TAllNavPaths = (typeof NAV_LINKS)[number]['itemsOnHover'][number]['path'];

export type TActionResponse =
  | { status: 'success'; basket: Basket }
  | {
      status: 'error';
      message: 'Something went wrong!';
    }
  | { status: 'error'; message: 'Product quantity limit reached!' }
  | {
      status: 'error';
      message: 'Basket not authorized';
      authUrl: string;
    };
