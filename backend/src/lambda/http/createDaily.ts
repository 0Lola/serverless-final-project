import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { parseUserId } from '../../auth/utils';
import { createLogger } from '../../utils/logger'
import { createDaily } from '../../businessLogic/dailyLogic';
import { CreateDailyRequest } from '../../requests/CreateDailyRequest';

const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    logger.info(`createDaily : ${JSON.stringify(event)}`);

    const daily: CreateDailyRequest = JSON.parse(event.body)
    const split = event.headers.Authorization.split(' ')
    const token = split[1]
    const userId = parseUserId(token)
    const item = await createDaily(userId,daily)

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
