import dateFormat from '@micro-app/common/base/date.js';

const filter = {
    // The date is accurate to the earliest time of the day and converted to a timestamp
    getFirstTime(time) {
        if (!time) { return ''; }
        time = time.replace(/-/g, '/');
        const date = new Date(time);
        time = date.getTime();
        return time;
    },
    // The date is accurate to the latest time of the day and converted to a timestamp
    getLastTime(time) {
        if (!time) { return ''; }
        time = time.replace(/-/g, '/');
        time += ' 23:59:59';
        const date = new Date(time);
        time = date.getTime();
        return time;
    },
    // Convert date to timestamp, 10 digits
    getTimeStampTen(time) {
        if (!time) { return ''; }
        time = time.replace(/-/g, '/');
        time = time.replace(/T/g, ' ');
        const date = new Date(time);
        time = Math.round(date.getTime() / 1000);
        return time;
    },
    // Convert date to timestamp
    getTimeStamp(time) {
        if (!time) { return ''; }
        time = time.replace(/-/g, '/');
        time = time.replace(/T/g, ' ');
        const date = new Date(time);
        time = date.getTime();
        return time;
    },
    // Get the time one week ago
    getOneWeekBefore(time) {
        const myDate = new Date(time.toString().length === 13 ? (parseInt(time) - 7 * 24 * 60 * 60 * 1000) : (parseInt(time * 1000) - 7 * 24 * 60 * 60 * 1000));
        const year = myDate.getFullYear();
        const month = this.get2Length(myDate.getMonth() + 1);
        const date = this.get2Length(myDate.getDate());
        return year + '-' + month + '-' + date;
    },
    // Convert timestamp to date, accurate to day
    timeToDay(time) {
        const myDate = new Date(time.toString().length === 13 ? parseInt(time) : parseInt(time * 1000));
        const year = myDate.getFullYear();
        const month = (myDate.getMonth() + 1) < 10 ? '0' + (myDate.getMonth() + 1) : (myDate.getMonth() + 1);
        const date = (myDate.getDate()) < 10 ? '0' + (myDate.getDate()) : (myDate.getDate());
        return year + '-' + month + '-' + date;
    },
    // Timestamp difference converted into years, months, days, hours, minutes and seconds
    timeDistance(time) {
        let min,
            hour,
            day,
            month,
            year;
        if (time < (1000 * 60)) { return Math.floor(time / 1000) + 'seconds'; } else if ((min = time / (1000 * 60)) < 60) { return Math.floor(min) + 'minutes' + Math.floor((time % 60000) / 1000) + 'seconds'; } else if ((hour = min / 60) < 24) { return Math.floor(hour) + 'hours' + Math.floor(min % 60) + 'minutes'; } else if ((day = hour / 24) < 30) { return Math.floor(day) + 'days' + Math.floor(hour % 24) + 'hours'; } else if ((month = day / 30) < 12) { return Math.floor(month) + 'months' + Math.floor(month % 30) + 'days'; } else if ((year = month / 12) >= 1) { return Math.floor(year) + 'years' + Math.floor(month % 12) + 'months'; }
    },
    get2Length(num) {
        if (num < 10) { return '0' + num; }
        return num.toString();
    },
    smartDateFormat(date) {
        if (!date) { return '-'; }
        const time = new Date(date).getTime();
        return dateFormat(time, 'YYYY-MM-DD HH:mm:ss');
    },
    smartTime(date) {
        if (!date) { return '-'; }
        const time = new Date(date).getTime();
        return dateFormat(time, 'YYYY-MM-DD HH:mm:ss ms');
    },
    // Get the current year
    getYear(time) {
        const myDate = new Date(dateFormat(parseInt(time), 'YYYY-MM-DD'));
        const year = myDate.getFullYear();
        return year;
    },
    unitFormat(unit) {
        const map = {
            second: 'second',
            minute: 'minute',
            hour: 'hour',
            day: 'day',
        };
        return map[unit];
    },

    // Load balancing strategy
    balancePolicy(unit) {
        const map = {
            ROUND_ROBIN: 'Polling',
            WEIGHTED_RESPONSE_TIME: 'Response time weighting',
            RANDOM: 'Random',
            AVAILABILITY_FILTERING: 'Availability filtering',
            BEST_AVAILABLE: 'Maximum available',
            SESSION_STICKY: 'Session sticky',
        };
        return map[unit];
    },

    // Matching conditions for routing rules
    routerType(type) {
        const map = {
            SERVICE_NAME: 'Service Name',
            SERVICE_NAME_VERSION: 'Service name + version',
            INSTANCE_NAME: 'Instance name',
            INSTANCE_IP: 'Instance IP',
            TAG: 'Label',
            SERVICE_NAME_TAG: 'Services + Tags',
        };
        return map[type];
    },
    getFullTime(d) {
        return d.getFullYear() + '' + (d.getMonth() + 1) + '' + d.getDate() + '' + d.getHours() + '' + d.getMinutes() + '' + d.getSeconds();
    },
    // dubbo's downgraded status
    dubboMocked(type) {
        const map = {
            FAIL: 'Fault tolerant',
            NO: 'Not downgraded',
            FORCE: 'Blocked',
        };
        return map[type];
    },
    // Check of dubbo provider list
    errorLevel(type) {
        const map = {
            ERROR: 'Error',
            WARN: 'Warn',
            OK: 'Normal',
        };
        return map[type];
    },
};

export default filter;
