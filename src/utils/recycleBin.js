import { recycleBinApi } from '../services/api';

export const moveToRecycleBin = async (item, type) => {
  try {
    await recycleBinApi.create(type, item);
  } catch (err) {
    console.error('Failed to move to recycle bin', err);
  }
};

export const getRecycleBinItems = async () => {
  try {
    const data = await recycleBinApi.getAll();
    return data.map(row => ({
      id: row.id,
      recycleType: row.recycle_type,
      deletedAt: row.deleted_at,
      ...row.item_data
    }));
  } catch (err) {
    console.error('Failed to get recycle bin items', err);
    return [];
  }
};

export const removeFromRecycleBin = async (id) => {
  try {
    await recycleBinApi.delete(id);
  } catch (err) {
    console.error('Failed to remove from recycle bin', err);
  }
};

export const clearRecycleBin = async () => {
  try {
    await recycleBinApi.clearAll();
  } catch (err) {
    console.error('Failed to clear recycle bin', err);
  }
};
