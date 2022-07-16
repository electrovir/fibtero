import type AxiosType from 'axios';
import {AxiosRequestConfig} from 'axios';
// @ts-ignore-error
import axiosImport from 'axios/lib/axios.js';

axiosImport.defaults.adapter = require('axios/lib/adapters/http.js');
export const axios = axiosImport as typeof AxiosType;

export async function makeRequest(url: string, options: AxiosRequestConfig) {
    const response = await axios.get(url, options);
    return response;
}
