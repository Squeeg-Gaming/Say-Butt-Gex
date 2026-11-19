import { round, score } from './score.js';

/**
 * Path to directory containing `_list.json` and all levels
 */
const dir = '/data';

export async function fetchList() {
    try {
        const listResult = await fetch(`${dir}/_list.json`);
        if (!listResult.ok) {
            throw new Error(`Request failed with status ${listResult.status}`);
        }
        const list = await listResult.json();
        if (!Array.isArray(list)) {
            throw new Error('List data must be an array.');
        }
        return await Promise.all(
            list.map(async (path, rank) => {
                try {
                    const levelResult = await fetch(`${dir}/${path}.json`);
                    if (!levelResult.ok) {
                        throw new Error(
                            `Request failed with status ${levelResult.status}`,
                        );
                    }
                    const level = await levelResult.json();
                    if (!Array.isArray(level.records)) {
                        throw new Error('Level records must be an array.');
                    }
                    return [
                        {
                            ...level,
                            path,
                            records: level.records.sort(
                                (a, b) => b.percent - a.percent,
                            ),
                        },
                        null,
                    ];
                } catch {
                    console.error(`Failed to load level #${rank + 1} ${path}.`);
                    return [null, path];
                }
            }),
        );
    } catch {
        console.error(`Failed to load list.`);
        return null;
    }
}

export async function fetchEditors() {
    try {
        const editorsResults = await fetch(`${dir}/_editors.json`);
        if (!editorsResults.ok) {
            throw new Error(
                `Request failed with status ${editorsResults.status}`,
            );
        }
        const editors = await editorsResults.json();
        if (!Array.isArray(editors)) {
            throw new Error('Editor data must be an array.');
        }
        return editors;
    } catch {
        console.error('Failed to load list editors.');
        return null;
    }
}

export async function fetchLeaderboard() {
    const list = await fetchList();
    if (!list) {
        return [[], ['_list']];
    }

    const scoreMap = {};
    const errs = [];
    list.forEach(([level, err], rank) => {
        if (err) {
            errs.push(err);
            return;
        }

        if (
            !level ||
            typeof level.verifier !== 'string' ||
            !level.verifier ||
            !Array.isArray(level.records)
        ) {
            errs.push(level?.path || `_level-${rank + 1}`);
            return;
        }

        // Verification
        const verifier = Object.keys(scoreMap).find(
            (u) => u.toLowerCase() === level.verifier.toLowerCase(),
        ) || level.verifier;
        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
        };
        const { verified } = scoreMap[verifier];
        verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(rank + 1, 100, level.percentToQualify),
            link: level.verification,
        });

        // Records
        level.records.forEach((record) => {
            if (
                !record ||
                typeof record.user !== 'string' ||
                !record.user
            ) {
                errs.push(level.path || `_level-${rank + 1}`);
                return;
            }

            const recordPercent = Number(record.percent);
            if (!Number.isFinite(recordPercent) || recordPercent < 0 || recordPercent > 100) {
                errs.push(level.path || `_level-${rank + 1}`);
                return;
            }

            const user = Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === record.user.toLowerCase(),
            ) || record.user;
            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };
            const { completed, progressed } = scoreMap[user];
            if (recordPercent === 100) {
                completed.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(rank + 1, 100, level.percentToQualify),
                    link: record.link,
                });
                return;
            }

            progressed.push({
                rank: rank + 1,
                level: level.name,
                percent: recordPercent,
                score: score(rank + 1, recordPercent, level.percentToQualify),
                link: record.link,
            });
        });
    });

    // Wrap in extra Object containing the user and total score
    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;
        const total = [verified, completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        return {
            user,
            total: round(total),
            ...scores,
        };
    });

    // Sort by total score
    return [res.sort((a, b) => b.total - a.total), errs];
}
