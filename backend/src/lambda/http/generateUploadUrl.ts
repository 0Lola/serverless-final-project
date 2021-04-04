import 'source-map-support/register'
import * as uuid from 'uuid'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'
import { isExists, updateDailyImageUrl } from '../../businessLogic/dailyLogic'
import { getUploadUrl } from '../../businessLogic/imageLogic'

const logger = createLogger('auth')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters.id
    const split = event.headers.Authorization.split(' ')
    const token = split[1]
    const userId = parseUserId(token)
    logger.info(`generateUploadUrl id : ${id}}`)
    const valid = await isExists(userId,id)

    if (!valid) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'Daily does not exist'
            })
        }
    }
    
    const imageId = uuid.v4()
    await updateDailyImageUrl(userId,id,imageId)
    logger.info(`attachmentUrl imageId : ${imageId}`)

    const uploadUrl = getUploadUrl(imageId)
    logger.info(`generateUploadUrl uploadUrl : ${uploadUrl}`)

    return {
        statusCode: 201,
        body: JSON.stringify({
            uploadUrl
        })
    }
})

handler.use(
    cors({
        credentials: true
    })
)

