/* eslint-disable */
import { call } from 'redux-saga/effects';
import { ApiRoute } from '../constants/paths';
import { http } from './http.service';

export const FeedService = {
  *fetchFeed(offset: number, limit?: number) {
    const params = new URLSearchParams();
    params.append('offset', offset.toString());
    if (limit !== undefined) {
      params.append('limit', limit.toString());
    }

    const response = yield call(http(false).get, ApiRoute.DictionaryFeed);
    return response.data;
  },
};