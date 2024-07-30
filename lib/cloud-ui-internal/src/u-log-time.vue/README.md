# Breadcrumbs

## Example
### Basic form

``` html
<u-log-time storageName="nlsTime"></u-log-time>
```
### Limit minimum date
``` html
<u-log-time storageName="nlsTime" :min="new Date('2024-10-11 18:26:22').getTime()"></u-log-time>
```
### Limit maximum date
``` html
<u-log-time storageName="nlsTime" :max="new Date('2024-10-11 18:26:22').getTime()"></u-log-time>
```

# API
### Props/Attrs

| Prop/Attr | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| storageName | String |  | The name of LocalStorage storage |
| min | Number |  |  Limit minimum value, timestamp |
| max | Number |  |  Limit maximum value, timestamp |
