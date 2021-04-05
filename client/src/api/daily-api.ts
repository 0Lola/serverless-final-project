import { apiEndpoint } from '../config'
import Axios from 'axios'
import { Daily } from '../types/Daily'
import { CreateDailyRequest } from '../types/CreateDailyRequest'
import { UpdateDailyRequest } from '../types/UpdateDailyRequest'

export async function getDaily(idToken: string): Promise<Daily[]> {
  console.log('Fetching daily')

  const response = await Axios.get(`${apiEndpoint}/daily`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Daily:', response.data)
  return response.data.items
}

export async function createDaily(
  idToken: string,
  newDaily: CreateDailyRequest
): Promise<Daily> {
  const response = await Axios.post(`${apiEndpoint}/daily`,  JSON.stringify(newDaily), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchDaily(
  idToken: string,
  id: string,
  updateDaily: UpdateDailyRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/daily/${id}`, JSON.stringify(updateDaily), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteDaily(
  idToken: string,
  id: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/daily/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  id: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/daily/${id}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
