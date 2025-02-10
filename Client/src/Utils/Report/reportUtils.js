export const calculateDowntimeCount = (checks) => {
    if (!checks || checks.length < 2) return 0;

    let downtimeCount = 0;
    for (let i = 0; i < checks.length - 1; i++) {
        const currentCheck = checks[i];
        const nextCheck = checks[i + 1];

        if (currentCheck.status === true && nextCheck.status === false) {
            downtimeCount++;
        }
    }
    return downtimeCount;
};

export const calculatePingStats = (checks) => {
    if (!checks || checks.length === 0) return { min: 0, max: 0 };

    let min = Number.MAX_SAFE_INTEGER;
    let max = 0;

    checks.forEach((check) => {
        if (check.originalResponseTime) {
            min = Math.min(min, check.originalResponseTime);
            max = Math.max(max, check.originalResponseTime);
        }
    });

    return {
        min: min === Number.MAX_SAFE_INTEGER ? 0 : min,
        max: max,
    };
};

export const calculateActiveRanges = (checks) => {
    if (!checks || checks.length < 2) return { min: 0, max: 0 };

    const durations = [];
    let startTime = null;

    for (let i = checks.length - 1; i >= 0; i--) {
        const check = checks[i];

        if (check.status && !startTime) {
            startTime = new Date(check.createdAt);
        }

        if (!check.status && startTime) {
            const endTime = new Date(check.createdAt);
            const duration = endTime - startTime;
            if (duration > 0) {
                durations.push(duration);
            }
            startTime = null;
        }
    }

    // Handle case where site is currently up
    if (startTime && checks[0].status) {
        const now = new Date();
        const duration = now - startTime;
        durations.push(duration);
    }

    return durations.length
        ? {
                min: Math.min(...durations),
                max: Math.max(...durations),
            }
        : { min: 0, max: 0 };
};