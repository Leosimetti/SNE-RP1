import fetch from 'node-fetch'

async function fetchJS(url: string, params?: string[]) {
  const finalURL = params ? `${url}?${params.join('&')}` : url
  return await (await fetch(finalURL)).json()
}

type BackImageType = { url: string }
export async function getBackImage(isRandom: boolean) {
  if (isRandom) {
    const dynamicImageRes = (await fetchJS(
      URLS.DYNAMIC_IMAGE
    )) as BackImageType
    return dynamicImageRes.url
  }
  return URLS.STATIC_IMAGE
}

async function getCatImages(limit: number) {
  const api_key = process.env.apiKey
  const api_key_param = api_key ? [`api_key=${api_key}`] : []
  const catImagesRes = await fetchJS(
    URLS.CATS_IMAGE,
    [`limit=${limit}`].concat(api_key_param)
  )
  return catImagesRes.map((cat) => cat.url)
}

async function getDescriptions(amount: number) {
  return await fetchJS(`${URLS.DESCRIPTION}/${amount}`)
}

export async function getPosts(amount: number) {
  const cat_images = await getCatImages(amount)
  const cat_descriptions = await getDescriptions(amount)
  return cat_images.map((_, ind) => ({
    pic: cat_images[ind],
    content: cat_descriptions[ind],
  }))
}

function getEnvOrDefault(envName: string, defaultVal: string) {
  const envContent = process.env[envName]
  return envContent ? envContent : defaultVal
}

export const URLS = {
  RADIO: getEnvOrDefault(
    'RADIO',
    'http://91.219.74.220:8000/Vanya.ogg'
  ),
  DYNAMIC_IMAGE: getEnvOrDefault(
    'DYNAMIC_IMAGE',
    'https://api.waifu.pics/sfw/bully'
  ),
  STATIC_IMAGE: getEnvOrDefault(
    'STATIC_IMAGE',
    'https://i.waifu.pics/PGj1tg7.gif'
  ),
  CATS_IMAGE: getEnvOrDefault(
    'CATS_IMAGE',
    'https://api.thecatapi.com/v1/images/search'
  ),
  DESCRIPTION: getEnvOrDefault(
    'DESCRIPTION',
    'https://binaryjazz.us/wp-json/genrenator/v1/story'
  ),
}
