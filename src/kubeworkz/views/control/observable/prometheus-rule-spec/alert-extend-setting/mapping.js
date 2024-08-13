const EVENTS_MAPPING = [
    { text: 'Container failed', value: 'Failed' },
    { text: 'Container preemption', value: 'Preempting' },
    { text: 'Container killed', value: 'Killing' },
    { text: 'Container startup backoff', value: 'BackOff' },
    { text: 'Container gracefully terminated beyond time', value: 'ExceededGracePeriod' },
    { text: 'Failed to kill copy', value: 'FailedKillPod' },
    { text: 'Failed to create replica container', value: 'FailedCreatePodContainer' },
    { text: 'Replica network is not ready', value: 'NetworkNotReady' },
    { text: 'Bad images are not pulled', value: 'ErrImageNeverPull' },
    { text: 'Container is unhealthy', value: 'Unhealthy' },
    { text: 'Container probe alert', value: 'ProbeWarning' },
    { text: 'Container status synchronization failed', value: 'FailedSync' },
    { text: 'Hook execution failed after startup', value: 'FailedPostStartHook' },
    { text: 'Hook execution failed before stopping', value: 'FailedPreStopHook' },
];

export {
    EVENTS_MAPPING,
};
