import { Dimensions } from 'react-native';

const { width: WW, 
    //height: WH
} = Dimensions.get('window');

const WH = WW * 812 / 375;

const FW = 375; // Figma design width
const FH = 812; // Figma design height

export const sx = (x: number) => (x * WW) / FW; // scale X position
export const sy = (y: number) => (y * WH) / FH; // scale Y position
export const ss = (n: number) => (n * WW) / FW; // scale size (width-based)
export const sv = (n: number) => (n * WH) / FH; // scale size (height-based)
