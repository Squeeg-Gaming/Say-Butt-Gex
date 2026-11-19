/**
 * Numbers of decimal digits to round to
 */
const scale = 3;

/**
 * Calculate the score awarded when having a certain percentage on a list level
 * @param {Number} rank Position on the list
 * @param {Number} percent Percentage of completion
 * @param {Number} minPercent Minimum percentage required
 * @returns {Number}
 */
export function score(rank, percent, minPercent) {
    const safeRank = Number(rank);
    const safePercent = Number(percent);
    const safeMinPercent = Number(minPercent);

    if (!Number.isFinite(safeRank) || !Number.isFinite(safePercent) || !Number.isFinite(safeMinPercent)) {
        return 0;
    }

    if (safeRank < 1 || safePercent < 0 || safePercent > 100 || safeMinPercent < 1) {
        return 0;
    }
    if (safeRank > 150) {
        return 0;
    }
    if (safeRank > 75 && safePercent < 100) {
        return 0;
    }

    const denominator = 100 - (safeMinPercent - 1);
    if (denominator <= 0) {
        return 0;
    }

    // Old formula
    /*
    let score = (100 / Math.sqrt((rank - 1) / 50 + 0.444444) - 50) *
        ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));
    */
    // New formula
    let scoreValue = (-24.9975 * Math.pow(safeRank - 1, 0.4) + 200) *
        ((safePercent - (safeMinPercent - 1)) / denominator);

    scoreValue = Math.max(0, scoreValue);

    if (safePercent != 100) {
        return round(scoreValue - scoreValue / 3);
    }

    return Math.max(round(scoreValue), 0);
}

export function round(num) {
    const value = Number(num);
    if (!Number.isFinite(value)) {
        return 0;
    }

    if (!('' + value).includes('e')) {
        return +(Math.round(value + 'e+' + scale) + 'e-' + scale);
    }

    const arr = ('' + value).split('e');
    let sig = '';
    if (+arr[1] + scale > 0) {
        sig = '+';
    }
    return +(
        Math.round(+arr[0] + 'e' + sig + (+arr[1] + scale)) +
        'e-' +
        scale
    );
}
