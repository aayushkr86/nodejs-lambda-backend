let UPDATE = require('../query/update+insert1.js');
let authorizer = require('../authorizer')

exports.handler = function (event, context, cb) { //console.log(event)
   
    // authorizer()
    UPDATE.execute(event, cb)
    
}

// # INTEGRATION: LAMBDA
//             # integration: lambda
//             # request:
//             #   template:
//             #   application/json: '{ "foo" : "$input.params(''bar'')" }'

//             # ApiGatewayRestApi:
//             # Type: AWS::ApiGateway::RestApi
//             # Properties:
//             #   Name: $<self:custom.apiGateway>
//             #   BinaryMediaTypes:
//             #   - "application~1octet-stream"