import { Request, Response, RequestHandler } from "express";
import {
  createMediaItem,
  getAllMediaItems,
  getMediaItemById,
  updateMediaItem,
  deleteMediaItem,
} from "../services/mediaItemService";

export const createMediaItemController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const newItem = await createMediaItem(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: "Error creating new media: ", error });
  }
};

export const getAllMediaItemsController: RequestHandler = async (
  _req: Request,
  res: Response
) => {
  try {
    const allItems = await getAllMediaItems();
    res.json(allItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching medias: ", error });
  }
};

export const getMediaItemByIdController: RequestHandler = async (req, res) => {
  try {
    const item = await getMediaItemById(req.params.id);
    if (!item) {
      res.status(404).json({ message: "Media not found!" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Error fetching media: ", error });
  }
};

export const updateMediaItemController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const updatedItem = await updateMediaItem(req.params.id, req.body);
    if (!updatedItem) {
      res.status(404).json({ message: "Media not found!" });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Error updating media: ", error });
  }
};

export const deleteMediaItemController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const deletedItem = await deleteMediaItem(req.params.id);
    if (!deletedItem) {
      res.status(404).json({ message: "Media not found!" });
    }
    res.json({ message: "Media deleted!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting media: ", error });
  }
};
