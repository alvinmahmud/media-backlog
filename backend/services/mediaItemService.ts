import MediaItem from "../models/MediaItem";

export const createMediaItem = async (data: any) => {
  const item = new MediaItem(data);
  return await item.save();
};

export const getAllMediaItems = async () => {
  return await MediaItem.find();
};

export const getMediaItemById = async (id: string) => {
  return await MediaItem.findById(id);
};

export const updateMediaItem = async (id: string, data: any) => {
  return await MediaItem.findByIdAndUpdate(id, data, { new: true });
};

export const deleteMediaItem = async (id: string) => {
  return await MediaItem.findByIdAndDelete(id);
};
