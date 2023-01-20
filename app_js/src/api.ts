import fetch from "node-fetch";
import { z } from "zod";

const backImageZ = z.object({
  url: z.string().url()
});
const catImagesZ = z.array(
  z.object({
    url: z.string().url()
  })
);
const descriptionsZ = z.array(z.string().min(1).max(125));

async function fetchJS(url: string, params?: string[]) {
  const finalURL = params ? `${url}?${params.join("&")}` : url;
  return await (await fetch(finalURL)).json();
}

export async function getBackImage(isRandom: boolean) {
  if (isRandom) {
    const dynamicImageRes = backImageZ.parse(await fetchJS(URLS().DYNAMIC_IMAGE));
    return dynamicImageRes.url;
  }
  return URLS().STATIC_IMAGE;
}

async function getCatImages(limit: number) {
  const api_key = process.env.apiKey;
  const api_key_param = api_key ? [`api_key=${api_key}`] : [];
  const catImagesRes = catImagesZ.parse(
    await fetchJS(URLS().CATS_IMAGE, [`limit=${limit}`].concat(api_key_param))
  );
  return catImagesRes.map((cat) => cat.url);
}

async function getDescriptions(amount: number) {
  return descriptionsZ.parse(await fetchJS(`${URLS().DESCRIPTION}/${amount}`));
}

export async function getPosts(amount: number) {
  const cat_images = await getCatImages(amount);
  const cat_descriptions = await getDescriptions(amount);
  return cat_images.map((_, ind) => ({
    pic: cat_images[ind],
    content: cat_descriptions[ind]
  }));
}

export function getEnvOrDefault(envName: string, defaultVal: string) {
  const envContent = process.env[envName];
  return envContent ? envContent : defaultVal;
}

export function URLS() {
  return {
    "RADIO": getEnvOrDefault("RADIO", "http://91.219.74.220:8000/Vanya.ogg"),
    "DYNAMIC_IMAGE": getEnvOrDefault("DYNAMIC_IMAGE", "https://api.waifu.pics/sfw/bully"),
    "STATIC_IMAGE": getEnvOrDefault("STATIC_IMAGE", "https://i.waifu.pics/PGj1tg7.gif"),
    "CATS_IMAGE": getEnvOrDefault("CATS_IMAGE", "https://api.thecatapi.com/v1/images/search"),
    "DESCRIPTION": getEnvOrDefault("DESCRIPTION", "https://binaryjazz.us/wp-json/genrenator/v1/story")
  };
}
