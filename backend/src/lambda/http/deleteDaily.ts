import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils';
import { deleteDaily } from '../../businessLogic/dailyLogic';

const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters.id
    const split = event.headers.Authorization.split(' ')
    const token = split[1]
    const userId = parseUserId(token)
    const item = await deleteDaily(userId,id)

    logger.info(`deleteDaily : ${id}`);

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item
        })
    }
}
