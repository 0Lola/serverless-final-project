import { Daily } from '../models/Daily';
import * as uuid from 'uuid'
import { DailyAccess } from '../dataLayer/dailyAccess';
import { UpdateDailyRequest } from '../requests/UpdateDailyRequest';
import { CreateDailyRequest } from '../requests/CreateDailyRequest';

const dailyAccess = new DailyAccess()

export async function getAllDailyByToken(jwtToken: string): Promise<Daily[]> {
    return dailyAccess.getAllDailyByToken(jwtToken);
}

export async function createDaily(userId: string, item: CreateDailyRequest): Promise<Daily> {
    const date = new Date()

    return dailyAccess.createDaily({
        ...item,
        id: uuid.v4(),
        userId,
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    })
}

export async function updateDaily(userId: string, id: string, item: UpdateDailyRequest): Promise<any> {
    return await dailyAccess.updateDaily(userId, id, item)
}

export async function updateDailyImageUrl(userId: string, id: string, imageId: string): Promise<string> {
    return await dailyAccess.updateDailyImageUrl(userId, id, imageId)
}

export async function deleteDaily(userId: string, id: string): Promise<string> {
    return await dailyAccess.deleteDaily(userId, id)
}

export async function isExists(userId: string, id: string): Promise<boolean> {
    return await dailyAccess.isExists(userId, id)
}
