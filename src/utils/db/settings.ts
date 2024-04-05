import { API } from '../../api';

export const getSettings = async () => await API.settings.getSettings();
