import React, { useContext } from 'react';
import { AssetContext } from '../contexts/AssetContext';

interface IconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    iconKey: keyof typeof defaultIconMap;
}

const defaultIconMap = {
    crypto: '',
    playMoney: '',
    exit: '',
    settings: '',
    users: '',
    dealerChip: '',
    pokerChip: '',
    slotMachine: '',
    roulette: '',
    fold: '',
    call: '',
    raise: ''
}

const DynamicIcon: React.FC<IconProps> = ({ iconKey, className, ...props }) => {
    const { assets } = useContext(AssetContext);
    const dbKey = `icon${iconKey.charAt(0).toUpperCase() + iconKey.slice(1)}`;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const src = assets[dbKey] || '';
    
    return <img src={src} alt={`${iconKey} icon`} className={className} {...props} />;
};


// FIX: Changed props from React.SVGProps<SVGSVGElement> to React.ImgHTMLAttributes<HTMLImageElement> to match the rendered <img> element.
export const CryptoIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
    <DynamicIcon iconKey="crypto" {...props} />
);

// FIX: Changed props from React.SVGProps<SVGSVGElement> to React.ImgHTMLAttributes<HTMLImageElement> to match the rendered <img> element.
export const PlayMoneyIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
    <DynamicIcon iconKey="playMoney" {...props} />
);

// FIX: Changed props from React.SVGProps<SVGSVGElement> to React.ImgHTMLAttributes<HTMLImageElement> to match the rendered <img> element.
export const ExitIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
    <DynamicIcon iconKey="exit" {...props} />
);

// FIX: Changed props from React.SVGProps<SVGSVGElement> to React.ImgHTMLAttributes<HTMLImageElement> to match the rendered <img> element.
export const SettingsIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
    <DynamicIcon iconKey="settings" {...props} />
);

// FIX: Changed props from React.SVGProps<SVGSVGElement> to React.ImgHTMLAttributes<HTMLImageElement> to match the rendered <img> element.
export const UsersIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
   <DynamicIcon iconKey="users" {...props} />
);

// FIX: Changed props from React.SVGProps<SVGSVGElement> to React.ImgHTMLAttributes<HTMLImageElement> to match the rendered <img> element.
export const DealerChipIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
    <DynamicIcon iconKey="dealerChip" {...props} />
);

// FIX: Changed props from React.SVGProps<SVGSVGElement> to React.ImgHTMLAttributes<HTMLImageElement> to match the rendered <img> element.
export const PokerChipIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
    <DynamicIcon iconKey="pokerChip" {...props} />
);

// FIX: Changed props from React.SVGProps<SVGSVGElement> to React.ImgHTMLAttributes<HTMLImageElement> to match the rendered <img> element.
export const SlotMachineIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
   <DynamicIcon iconKey="slotMachine" {...props} />
);

// FIX: Changed props from React.SVGProps<SVGSVGElement> to React.ImgHTMLAttributes<HTMLImageElement> to match the rendered <img> element.
export const RouletteIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
    <DynamicIcon iconKey="roulette" {...props} />
);

// FIX: Changed props from React.SVGProps<SVGSVGElement> to React.ImgHTMLAttributes<HTMLImageElement> to match the rendered <img> element.
export const FoldIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
    <DynamicIcon iconKey="fold" {...props} />
);

// FIX: Changed props from React.SVGProps<SVGSVGElement> to React.ImgHTMLAttributes<HTMLImageElement> to match the rendered <img> element.
export const CallIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
    <DynamicIcon iconKey="call" {...props} />
);

// FIX: Changed props from React.SVGProps<SVGSVGElement> to React.ImgHTMLAttributes<HTMLImageElement> to match the rendered <img> element.
export const RaiseIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
    <DynamicIcon iconKey="raise" {...props} />
);
