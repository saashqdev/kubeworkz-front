const apis = {
    getApiList: {
        action: 'DescribeApiListByLimit',
    },
    // api status list
    getApiStatus: {
        action: 'DescribeApiDocument',
    },
    // List of services
    getApiServiceList: {
        action: 'DescribeServiceForApi',
    },
    // Publish API
    publishApi: {
        action: 'PublishApi',
        method: 'post',
    },
    // Import via Excel API
    importApi: {
        action: 'CreateApiByExcelFile',
        method: 'post',
    },
    // Batch publishing API
    batchPublishApi: {
        action: 'PublishMultiApi',
        method: 'post',
    },
    // New API
    createApi: {
        method: 'post',
        action: 'CreateApi',
    },
    // Modify API
    updateApi: {
        method: 'post',
        action: 'UpdateApi',
    },
    // Delete API
    deleteApi: {
        action: 'DeleteApiById',
    },
    // api details
    getApiDetail: {
        action: 'DescribeApiById',
    },
    // Get API request query
    getApiReqQueryList: {
        action: 'DescribeQueryString',
    },
    // Get API query type
    getApiQueryParamType: {
        action: 'DescribeQueryStringParamType',
    },
    // Get API request header
    getApiReqHeaderList: {
        action: 'DescribeRequestHeader',
    },
    // Get request header type
    getReqHeaderType: {
        action: 'DescribeHeaderParamType',
    },
    // Get request body
    getApiReqBody: {
        action: 'DescribeRequestBody',
    },
    // Get request body param
    getBodyParam: {
        action: 'DescribeBodyParam',
    },
    // Save request body
    saveApiReqBody: {
        action: 'CreateRequestBody',
        method: 'post',
    },
    // Get custom model
    getApiModel: {
        action: 'DescribeApiModel',
    },
    // Save request query
    saveQueryString: {
        action: 'CreateQueryString',
        method: 'post',
    },
    // Save request header
    saveRequestHeader: {
        action: 'CreateRequestHeader',
        method: 'post',
    },
    // Get API response header
    getApiResHeaderList: {
        action: 'DescribeResponseHeader',
    },
    // Get API response body
    getApiResBodyList: {
        action: 'DescribeResponseBody',
    },
    // Create response header
    saveResponseHeader: {
        action: 'CreateResponseHeader',
        method: 'post',
    },
    // Create response body
    saveResponseBody: {
        action: 'CreateResponseBody',
        method: 'post',
    },
    // Get API response code
    getApiResCode: {
        action: 'DescribeStatusCode',
    },
    // Create response code
    saveResponseCode: {
        action: 'CreateStatusCode',
        method: 'post',
    },
    // Get API examples
    getApiExample: {
        action: 'DescribeExample',
    },
    // Update API examples
    saveApiExample: {
        action: 'CreateApiExample',
        method: 'post',
    },
    // API modification record
    getApiLog: {
        action: 'DescribeOperationList',
    },
    // Upload body in json format
    addResBodyByJson: {
        action: 'GenerateBodyByJson',
        method: 'post',
    },
    // webService type service class list
    webServiceClass: {
        action: 'GetWebServiceInterface',
    },
    // webService type service class list
    webServiceMethod: {
        action: 'GetWebServiceMethod',
    },
    // Get webService type parameters
    webServiceParam: {
        action: 'DescribeWebserviceParam',
    },
    // Save webService type parameters
    saveServiceParam: {
        action: 'CreateWebserviceParam',
        method: 'post',
    },
    // Get dubbo information
    getDubboParam: {
        action: 'DescribeDubboParam',
    },
    // Get Markdown
    getMarkdown: {
        action: 'DescribeMarkdownApiById',
    },
    // Get API publishable gateway
    getApieGateway: {
        action: 'DescribeGatewayForPublishedApi',
    },
};

export default apis;
