import type AxiosType from 'axios';
import {AxiosRequestConfig} from 'axios';
// @ts-ignore-error
import axiosImport from 'axios/lib/axios.js';

axiosImport.defaults.adapter = require('axios/lib/adapters/http.js');
export const axios = axiosImport as typeof AxiosType;

export async function get(url: string, options: AxiosRequestConfig) {
    const response = await axios.get(url, options);
    return response;
}

export async function post(url: string, data: any, options: AxiosRequestConfig) {
    const response = await axios.post(url, data, options);
    return response;
}

export async function put(url: string, data: any, options: AxiosRequestConfig) {
    const response = await axios.put(url, data, options);
    return response;
}
