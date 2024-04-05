import { API } from '../../api';

export const getPackages = async () => await API.packages.getPackages();
