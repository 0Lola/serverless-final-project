import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import { parseUserId } from '../../auth/utils';
import { createLogger } from '../../utils/logger'
import { getAllDailyByToken } from '../../businessLogic/dailyLogic';
import { Daily } from '../../models/Daily';

const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const split = event.headers.Authorization.split(' ')
    const token = split[1]
    const userId = parseUserId(token)
    logger.info(`getDaily by token:${JSON.stringify(event)}`)

    const items = await getAllDailyByToken(userId) as Daily[]

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            items
        })
    }

}
