import { sizeProcessor } from './filters';

export const POD_CHART_OPTIONS = [
    {
        name: 'cpu_usage_percentage',
        unit: '%',
        title: 'CPU usage',
    },
    {
        name: 'memory_usage_bytes',
        unit: 'B',
        title: 'Memory usage',
        processor: sizeProcessor,
    },
    {
        name: 'disk_read_operation_rate',
        unit: 'Second-rate/s',
        title: 'Disk read operation rate',
        hasDevice: true,
    },
    {
        name: 'disk_read_bytes_rate',
        unit: 'B/s',
        title: 'Disk read byte rate',
        hasDevice: true,
        processor: sizeProcessor,
    },
    {
        name: 'disk_write_operation_rate',
        unit: 'Second-rate/s',
        title: 'Disk write operation rate',
        hasDevice: true,
    },
    {
        name: 'disk_write_bytes_rate',
        unit: 'B/s',
        title: 'Disk write byte rate',
        hasDevice: true,
        processor: sizeProcessor,
    },
    {
        name: 'network_receive_bytes_rate',
        unit: 'B/s',
        title: 'Network Bandwidth - Inflow',
        hasInterface: true,
        processor: sizeProcessor,
    },
    {
        name: 'network_receive_packets_rate',
        unit: 'pps',
        hasInterface: true,
        title: 'Network packet receiving rate',
    },
    {
        name: 'network_transmit_bytes_rate',
        unit: 'B/s',
        title: 'Network Bandwidth - Outflow',
        hasInterface: true,
        processor: sizeProcessor,
    },
    {
        name: 'network_transmit_packets_rate',
        unit: 'pps',
        title: 'Network packet sending rate',
        hasInterface: true,
    },
];

export const NODE_CHART_OPTIONS = [
    {
        name: 'cpu_usage_percentage',
        unit: '%',
        title: 'CPU usage',
    },
    {
        name: 'memory_usage_bytes',
        unit: 'B',
        title: 'Memory usage',
    },
    {
        name: 'disk_usage_percentage',
        unit: '%',
        title: 'File system usage',
        hasDevice: true,
    },
    {
        name: 'disk_read_operation_rate',
        unit: 'Second-rate/s',
        title: 'Disk read operation rate',
        hasDevice: true,
    },
    {
        name: 'disk_read_bytes_rate',
        unit: 'B/s',
        title: 'Disk read byte rate',
        hasDevice: true,
    },
    {
        name: 'disk_write_operation_rate',
        unit: 'Second-rate/s',
        title: 'Disk write operation rate',
        hasDevice: true,
    },
    {
        name: 'disk_write_bytes_rate',
        unit: 'B/s',
        title: 'Disk write byte rate',
        hasDevice: true,
    },
];

export const CLUSTER_CHART_OPTIONS = [
    {
        name: 'cpu_idle_mode_percentage',
        unit: '%',
        title: 'Idle CPU',
    },
    {
        name: 'system_load',
        unit: '',
        keys: [ 'load1', 'load5', 'load15' ], // Corresponds to the key agreed with the backend
        title: 'System Load',
    },
    {
        name: 'memory_usage_bytes',
        unit: 'B',
        title: 'Memory Used',
    },
    {
        name: 'memory_free_bytes',
        unit: 'B',
        title: 'Memory Free',
    },
    {
        name: 'memory_cached_bytes',
        unit: 'B',
        title: 'Memory Cached',
    },
    {
        name: 'memory_buffer_bytes',
        unit: 'B',
        title: 'Memory Buffers',
    },
    {
        name: 'disk_read_write_bytes_rate', 
        unit: 'B/s',
        keys: ['read', 'write'],
        title: 'Disk I/O Throughout',
    },
    {
        name: 'disk_read_write_operation_rate', 
        unit: 'Second-rate/s',
        keys: ['read', 'write'],
        title: 'Disk IOPS',
    },
    {
        name: 'disk_io_time',
        unit: '%',
        title: 'Disk I/O iotime',
    },
    {
        name: 'network_receive_transmit_bytes_rate',
        unit: 'B/s',
        keys: ['receive', 'transmit'],
        title: 'Network Throughout',
    },
    {
        name: 'network_receive_transmit_packets_rate',
        unit: 'pps',
        keys: ['receive', 'transmit'],
        title: 'Network PPS',
    },
    {
        name: 'pod_num_info',
        unit: 'indivual',
        keys: [ 
            { text: 'Maximum number of copies available', value: 'available' },
            { text: 'Number of copies used', value: 'used' },
        ],
        title: 'Number of cluster replicas',
    },
];