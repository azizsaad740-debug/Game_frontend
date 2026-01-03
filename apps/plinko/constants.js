export const RiskLevel = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH'
};

export const rowCountOptions = [8, 9, 10, 11, 12, 13, 14, 15, 16];

export const binPayouts = {
    8: {
        [RiskLevel.LOW]: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
        [RiskLevel.MEDIUM]: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
        [RiskLevel.HIGH]: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
    },
    9: {
        [RiskLevel.LOW]: [5.6, 2, 1.6, 1, 0.7, 0.7, 1, 1.6, 2, 5.6],
        [RiskLevel.MEDIUM]: [18, 4, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4, 18],
        [RiskLevel.HIGH]: [43, 7, 2, 0.6, 0.2, 0.2, 0.6, 2, 7, 43],
    },
    10: {
        [RiskLevel.LOW]: [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
        [RiskLevel.MEDIUM]: [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
        [RiskLevel.HIGH]: [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76],
    },
    11: {
        [RiskLevel.LOW]: [8.4, 3, 1.9, 1.3, 1, 0.7, 0.7, 1, 1.3, 1.9, 3, 8.4],
        [RiskLevel.MEDIUM]: [24, 6, 3, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3, 6, 24],
        [RiskLevel.HIGH]: [120, 14, 5.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 5.2, 14, 120],
    },
    12: {
        [RiskLevel.LOW]: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
        [RiskLevel.MEDIUM]: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
        [RiskLevel.HIGH]: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
    },
    13: {
        [RiskLevel.LOW]: [8.1, 4, 3, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3, 4, 8.1],
        [RiskLevel.MEDIUM]: [43, 13, 6, 3, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3, 6, 13, 43],
        [RiskLevel.HIGH]: [260, 37, 11, 4, 1, 0.2, 0.2, 0.2, 0.2, 1, 4, 11, 37, 260],
    },
    14: {
        [RiskLevel.LOW]: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
        [RiskLevel.MEDIUM]: [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58],
        [RiskLevel.HIGH]: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420],
    },
    15: {
        [RiskLevel.LOW]: [15, 8, 3, 2, 1.5, 1.1, 1, 0.7, 0.7, 1, 1.1, 1.5, 2, 3, 8, 15],
        [RiskLevel.MEDIUM]: [88, 18, 11, 5, 3, 1.3, 0.5, 0.3, 0.3, 0.5, 1.3, 3, 5, 11, 18, 88],
        [RiskLevel.HIGH]: [620, 83, 27, 8, 3, 0.5, 0.2, 0.2, 0.2, 0.2, 0.5, 3, 8, 27, 83, 620],
    },
    16: {
        [RiskLevel.LOW]: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
        [RiskLevel.MEDIUM]: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
        [RiskLevel.HIGH]: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
    },
};

export const binColor = {
    background: {
        red: { r: 255, g: 0, b: 63 },
        yellow: { r: 255, g: 192, b: 0 },
    },
    shadow: {
        red: { r: 166, g: 0, b: 4 },
        yellow: { r: 171, g: 121, b: 0 },
    },
};

export function interpolateRgbColors(from, to, length) {
    return Array.from({ length }, (_, i) => ({
        r: Math.round(from.r + ((to.r - from.r) / (length - 1)) * i),
        g: Math.round(from.g + ((to.g - from.g) / (length - 1)) * i),
        b: Math.round(from.b + ((to.b - from.b) / (length - 1)) * i),
    }));
}

export function getBinColors(rowCount) {
    const binCount = rowCount + 1;
    const isBinsEven = binCount % 2 === 0;
    const redToYellowLength = Math.ceil(binCount / 2);

    const redToYellowBg = interpolateRgbColors(
        binColor.background.red,
        binColor.background.yellow,
        redToYellowLength,
    ).map(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`);

    const redToYellowShadow = interpolateRgbColors(
        binColor.shadow.red,
        binColor.shadow.yellow,
        redToYellowLength,
    ).map(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`);

    return {
        background: [...redToYellowBg, ...redToYellowBg.slice().reverse().slice(isBinsEven ? 0 : 1)],
        shadow: [...redToYellowShadow, ...redToYellowShadow.slice().reverse().slice(isBinsEven ? 0 : 1)],
    };
}
