// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    if (typeof url !== 'string') {
        return '';
    }

    const value = url.trim();
    if (!value) {
        return '';
    }

    try {
        const parsed = new URL(value);

        if (parsed.hostname === 'youtu.be' || parsed.hostname.endsWith('.youtu.be')) {
            return parsed.pathname.replace(/^\//, '').split('/')[0] || '';
        }

        if (parsed.hostname.includes('youtube.com')) {
            const matchedId = parsed.searchParams.get('v') || parsed.searchParams.get('vi');
            if (matchedId) {
                return matchedId;
            }

            const pathParts = parsed.pathname.split('/').filter(Boolean);
            const videoTypeIndex = ['embed', 'shorts', 'live', 'v'].indexOf(pathParts[0]);
            if (videoTypeIndex >= 0 && pathParts[1]) {
                return pathParts[1];
            }
        }
    } catch {
        // Fall through to a regex-based fallback for URLs that do not parse cleanly.
    }

    return value.match(
        /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?.*?(?:[?&]|\b)v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i,
    )?.[1] ?? '';
}

export function embed(video) {
    const id = getYoutubeIdFromUrl(video);
    return id ? `https://www.youtube.com/embed/${id}` : '';
}

export function localize(num) {
    const value = Number(num);
    if (!Number.isFinite(value)) {
        return '0.000';
    }

    return value.toLocaleString(undefined, { minimumFractionDigits: 3 });
}

export function getThumbnailFromId(id) {
    if (typeof id !== 'string' || !id) {
        return '';
    }

    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle(array) {
    if (!Array.isArray(array)) {
        return array;
    }

    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}
