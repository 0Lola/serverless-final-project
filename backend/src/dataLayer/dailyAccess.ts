import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Daily } from '../models/Daily';
import { UpdateDailyRequest } from '../requests/UpdateDailyRequest';
import { CreateDailyRequest } from '../requests/CreateDailyRequest';

const XAWS = AWSXRay.captureAWS(AWS)
const DAILY_TABLE = process.env.DAILY_TABLE;
const USER_ID_INDEX = process.env.USER_ID_INDEX;
const IMAGE_BUCKET = process.env.IMAGE_BUCKET

export class DailyAccess {

    constructor(
        private readonly db: DocumentClient = createDynamoDBClient()) {
    }

    async getAllDailyByToken(jwtToken: string): Promise<Daily[]> {

        const result = await this.db.query({
            TableName: DAILY_TABLE,
            IndexName: USER_ID_INDEX,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': jwtToken
            }
        }).promise()

        if (result.Count === 0)
            return []

        const items = result.Items;
        console.log(`getAllDailyByToken response: ${JSON.stringify(items)}`)
        return items as Daily[]
    }

    async createDaily(item: CreateDailyRequest): Promise<Daily> {
        await this.db.put({
            TableName: DAILY_TABLE,
            Item: item
        }).promise()

        console.log(`createTodoItem response: ${JSON.stringify(item)}`)

        return item as Daily
    }

    async updateDaily(userId: string, id: string, item: UpdateDailyRequest): Promise<any> {
        const newItem = await this.db.update({
            TableName: DAILY_TABLE,
            Key: {
                id: id,
                userId: userId
            },
            UpdateExpression: 'SET #t = :title, #c = :content, #d = :date',
            ConditionExpression: '#i = :id AND #u = :userId',
            ExpressionAttributeValues: {
                ':id': id,
                ':userId': userId,
                ':title': item.title,
                ':content': item.content,
                ':date': item.date
            },
            ExpressionAttributeNames: {
                '#i': 'id',
                '#u': 'userId',
                '#t': 'title',
                '#c': 'content',
                '#d': 'date'
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

        console.log(`updateDaily response: ${JSON.stringify(newItem)}`)

        return newItem
    }

    async updateDailyImageUrl(userId: string, id: string, imageId: string): Promise<string> {

        const imageUrl = `https://${IMAGE_BUCKET}.s3.amazonaws.com/${imageId}`
        const newItem = await this.db.update({
            TableName: DAILY_TABLE,
            Key: {
                id: id,
                userId: userId
            },
            UpdateExpression: 'SET #iu = :imageUrl',
            ConditionExpression: '#i = :id AND #u =:userId',
            ExpressionAttributeValues: {
                ':id': id,
                ':userId': userId,
                ':imageUrl': imageUrl,
            },
            ExpressionAttributeNames: {
                '#i': 'id',
                '#u': 'userId',
                '#iu': 'imageUrl'
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();

        console.log(`updateDailyImageUrl response: ${JSON.stringify(newItem)}`)

        return imageId
    }

    async deleteDaily(userId:string,id: string): Promise<string> {
        await this.db.delete({
            TableName: DAILY_TABLE,
            Key: {
                id: id,
                userId: userId
            }
        }).promise()

        console.log(`deleteDaily response: ${id}`)
        return id
    }

    async isExists(userId: string, id: string): Promise<boolean> {
        const result = await this.db.get({
            TableName: DAILY_TABLE,
            Key: {
                id: id,
                userId: userId
            }
        }).promise()

        const item = result.Item
        const isExist = item != null && item != undefined
        console.log(`daily isExists response: ${isExist}`)
        return isExist
    }

}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}
