import { Card, Rank, Suit, HandResult } from '../types';

export const rankToValue: Record<Rank, number> = {
  [Rank.TWO]: 2, [Rank.THREE]: 3, [Rank.FOUR]: 4, [Rank.FIVE]: 5, [Rank.SIX]: 6, [Rank.SEVEN]: 7, [Rank.EIGHT]: 8, [Rank.NINE]: 9, [Rank.TEN]: 10, [Rank.JACK]: 11, [Rank.QUEEN]: 12, [Rank.KING]: 13, [Rank.ACE]: 14
};

function getHandRank(hand: Card[]): HandResult {
    const sortedHand = [...hand].sort((a, b) => rankToValue[b.rank] - rankToValue[a.rank]);
    const ranks = sortedHand.map(c => rankToValue[c.rank]);
    const suits = sortedHand.map(c => c.suit);

    const isFlush = suits.every(s => s === suits[0]);
    const rankCounts: Record<number, number> = ranks.reduce((acc, rank) => {
        acc[rank] = (acc[rank] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);
    
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    
    const isStraight = ranks.every((rank, i) => i === 0 || ranks[i-1] - 1 === rank) ||
                     ([14, 5, 4, 3, 2].every(r => ranks.includes(r))); // Ace-low straight
    
    // A more robust value calculation for tie-breaking
    const valueFromGroups = Object.entries(rankCounts)
        .sort(([,aCount], [,bCount]) => bCount - aCount)
        .map(([rank]) => parseInt(rank, 10))
        .reduce((acc, rank) => (acc << 4) + rank, 0);

    if (isStraight && isFlush) {
        const straightFlushValue = ranks[0] === 14 && ranks[1] === 5 ? 5 : ranks[0];
        return { rank: 9, name: 'Straight Flush', value: straightFlushValue, cards: sortedHand };
    }
    if (counts[0] === 4) return { rank: 8, name: 'Four of a Kind', value: valueFromGroups, cards: sortedHand };
    if (counts[0] === 3 && counts[1] === 2) return { rank: 7, name: 'Full House', value: valueFromGroups, cards: sortedHand };
    if (isFlush) return { rank: 6, name: 'Flush', value: valueFromGroups, cards: sortedHand };
    if (isStraight) {
        const straightValue = ranks[0] === 14 && ranks[1] === 5 ? 5 : ranks[0];
        return { rank: 5, name: 'Straight', value: straightValue, cards: sortedHand };
    }
    if (counts[0] === 3) return { rank: 4, name: 'Three of a Kind', value: valueFromGroups, cards: sortedHand };
    if (counts[0] === 2 && counts[1] === 2) return { rank: 3, name: 'Two Pair', value: valueFromGroups, cards: sortedHand };
    if (counts[0] === 2) return { rank: 2, name: 'One Pair', value: valueFromGroups, cards: sortedHand };
    
    return { rank: 1, name: 'High Card', value: valueFromGroups, cards: sortedHand };
}

export function evaluatePlayerHand(hand: Card[], communityCards: Card[]): HandResult | null {
    const allCards = [...hand, ...communityCards];
    if (allCards.length < 5) {
        return null;
    }

    const all5CardCombos: Card[][] = [];
    // Generate all 5-card combinations from the available 7 cards (2 hole + 5 community)
    for (let i = 0; i < allCards.length; i++) {
        for (let j = i + 1; j < allCards.length; j++) {
            for (let k = j + 1; k < allCards.length; k++) {
                for (let l = k + 1; l < allCards.length; l++) {
                    for (let m = l + 1; m < allCards.length; m++) {
                        all5CardCombos.push([allCards[i], allCards[j], allCards[k], allCards[l], allCards[m]]);
                    }
                }
            }
        }
    }

    if (all5CardCombos.length === 0) return null;

    let bestHand: HandResult = getHandRank(all5CardCombos[0]);

    for (let i = 1; i < all5CardCombos.length; i++) {
        const result = getHandRank(all5CardCombos[i]);
        if (result.rank > bestHand.rank || (result.rank === bestHand.rank && result.value > bestHand.value)) {
            bestHand = result;
        }
    }

    return bestHand;
}
