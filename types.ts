

export enum Suit {
    HEARTS = 'HEARTS',
    DIAMONDS = 'DIAMONDS',
    CLUBS = 'CLUBS',
    SPADES = 'SPADES',
}

export enum Rank {
    TWO = '2', THREE = '3', FOUR = '4', FIVE = '5', SIX = '6',
    SEVEN = '7', EIGHT = '8', NINE = '9', TEN = 'T', JACK = 'J',
    QUEEN = 'Q', KING = 'K', ACE = 'A',
}

export interface Card {
    suit: Suit;
    rank: Rank;
}

export interface Player {
    id: string;
    name: string;
    stack: number;
    bet: number;
    hand?: Card[];
    isFolded: boolean;
    isAllIn: boolean;
    isActive: boolean;
    hasActed?: boolean; // Added for betting round logic
    photoUrl?: string;
}

export enum GameStage {
    PRE_DEAL = 'PRE_DEAL',
    PRE_FLOP = 'PRE_FLOP',
    FLOP = 'FLOP',
    TURN = 'TURN',
    RIVER = 'RIVER',
    SHOWDOWN = 'SHOWDOWN',
}

export interface WinnerInfo {
    playerId: string;
    name: string;
    amountWon: number;
    handRank: string;
    winningHand: Card[];
}

export interface GameState {
    players: Player[];
    communityCards: Card[];
    pot: number;
    currentBet: number;
    activePlayerIndex: number;
    stage: GameStage;
    dealerIndex: number;
    winners?: WinnerInfo[];
}

export type PlayerAction =
    | { type: 'fold' }
    | { type: 'check' }
    | { type: 'call' }
    | { type: 'raise'; amount: number };

export enum GameMode {
    REAL_MONEY = 'REAL_MONEY',
    PLAY_MONEY = 'PLAY_MONEY',
}

export interface TableConfig {
    id: string;
    name: string;
    mode: GameMode;
    stakes: { small: number; big: number };
    players: number;
    maxPlayers: number;
}

export interface SlotSymbol {
  id?: number;
  name: string;
  imageUrl: string;
  payout: number;
  weight: number;
}

export interface IconAssets {
    iconFavicon: string;
    iconManifest: string;
    iconCrypto: string;
    iconPlayMoney: string;
    iconExit: string;
    iconSettings: string;
    iconUsers: string;
    iconDealerChip: string;
    iconPokerChip: string;
    iconSlotMachine: string;
    iconRoulette: string;
    iconFold: string;
    iconCall: string;
    iconRaise: string;
    iconBank: string;
}

export interface GameAssets extends IconAssets {
  cardBackUrl: string;
  tableBackgroundUrl: string;
  godModePassword: string;
  cardFaces: { [suit in Suit]?: { [rank in Rank]?: string } };
  slotSymbols: SlotSymbol[];
}