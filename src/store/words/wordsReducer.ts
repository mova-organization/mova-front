/* eslint-disable */
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { FormikHelpers } from 'formik';
import { AxiosResponse } from 'axios';
import { InferActionsTypes } from '../types';
import wordsService from '../../services/wordsService';
import { notificationActions } from '../notification/reducer/notificationReducer';
import NotificationTypes from '../../constants/notificationTypes';
import Word from '../../models/word';
import HttpError from '../../models/httpError';
import NewWordData from '../../models/forms/newWordData';
import { FeedService } from '../../services/FeedService';
import { RootState } from '../rootReducer';

// --CONSTANTS--
export const CREATE_A_NEW_WORD = 'wordReducer/CREATE_A_NEW_WORD';
const CREATE_A_NEW_WORD_SUCCESS = 'wordReducer/CREATE_A_NEW_WORD_SUCCESS';
const CREATE_A_NEW_WORD_ERROR = 'wordReducer/CREATE_A_NEW_WORD_ERROR';
const LIKE_A_WORD_SUCCESS = 'wordReducer/LIKE_A_WORD_SUCCESS';
const LIKE_A_WORD_ERROR = 'wordReducer/LIKE_A_WORD_ERROR';
const RATE_A_WORD = 'wordReducer/RATE_A_WORD';
export const FETCH_FEED = 'wordReducer/FETCH_FEED';
export const FETCH_FEED_SUCCESS = 'wordReducer/FETCH_FEED_SUCCESSSSS';
export const FETCH_FEED_ERROR = 'wordReducer/FETCH_FEED_ERROR';
export const PURGE_FEED = 'wordReducer/PURGE_FEED';

type WordsActionType = InferActionsTypes<typeof wordsActions>;

type ReducerState = {
  feed: Word[];
  currentOffset: number;
  fetching: boolean;
};

const initialState: ReducerState = {
  feed: [],
  currentOffset: 0,
  fetching: false,
};

// --REDUCER--

const wordsReducer = (state = initialState, action: WordsActionType) => {
  switch (action.type) {
    case CREATE_A_NEW_WORD:
      return {
        ...state,
        isFetching: true,
      };
    case CREATE_A_NEW_WORD_SUCCESS:
      return {
        ...state,
        isFetching: false,
      };
    case FETCH_FEED:
      return {
        ...state,
        fetching: true,
      };

    case FETCH_FEED_ERROR:
      return {
        ...state,
        fetching: false,
      };
    case FETCH_FEED_SUCCESS: {
      const { data, offset } = action.payload;
      return {
        ...state,
        feed: [...data],
        currentOffset: offset,
        fetching: false,
      };
    }
    case RATE_A_WORD:
    default:
      return state;
  }
};

// --ACTION-CREATORS--

export const wordsActions = {
  fetchCreateANewWord: (newWord: NewWordData, meta: FormikHelpers<NewWordData>) =>
    ({ type: CREATE_A_NEW_WORD, payload: { newWord, meta } } as const),

  createANewWordSuccess: () =>
    ({
      type: CREATE_A_NEW_WORD_SUCCESS,
    } as const),

  createANewWordError: () =>
    ({
      type: CREATE_A_NEW_WORD_ERROR,
    } as const),

  rateAWord: (id: string, ratingType: string) =>
    ({
      type: RATE_A_WORD,
      payload: { id, ratingType },
    } as const),

  fetchFeed: (offset: number, limit = 20) =>
    ({
      type: FETCH_FEED,
      payload: {
        offset,
        limit,
      },
    } as const),

  fetchFeedSuccess: (data: Word[], offset: number) => {
    return {
      type: FETCH_FEED_SUCCESS,
      payload: {
        data,
        offset,
      },
    } as const;
  },

  fetchFeedError: (error: HttpError) =>
    ({
      type: FETCH_FEED_ERROR,
      payload: error,
    } as const),
};

// --WORKER-SAGAS--

export function* createANewWordWorker({
  payload,
}: ReturnType<typeof wordsActions.fetchCreateANewWord>) {
  const { meta, newWord } = payload;
  const { resetForm, setSubmitting } = meta;
  const result = {
    ...newWord,
    tags: newWord.tags.split(',').map((i) => i.trim()), // creating ['tag1', 'tag2'] from 'tag1, tag2'
  };
  try {
    yield call(wordsService.createANewWord, result);
    yield call(resetForm, {});
    yield call(setSubmitting, false);
    yield put(wordsActions.createANewWordSuccess());
    yield put(
      notificationActions.addNotification({
        type: NotificationTypes.success,
        message: 'Word has been added',
      }),
    );
  } catch (e) {
    yield call(resetForm, {});
    yield call(setSubmitting, false);
    yield put(
      notificationActions.addNotification({
        type: NotificationTypes.error,
        message: e.message,
      }),
    );
    yield put(wordsActions.createANewWordError());
  }
}

function* rateAWordWorker({ payload }: ReturnType<typeof wordsActions.rateAWord>) {
  const { id, ratingType } = payload;
  try {
    const response =
      ratingType === 'like'
        ? // @ts-ignore
          yield call(wordsService.likeAWord, id)
        : // @ts-ignore
          yield call(wordsService.dislikeAWord, id);

    // @ts-ignore
    const feedState = yield select((_state: RootState) => _state.feed);
    const newFeed = feedState.feed.map((_i: Word) => {
      const i = _i;
      if (ratingType === 'like') {
        const result =
          i.id === id ? { ...i, likes: response.data ? (i.likes += 1) : (i.likes -= 1) } : i;
        return result;
      }
      const result =
        i.id === id
          ? {
              ...i,
              dislikes: response.data ? (i.dislikes += 1) : (i.dislikes -= 1),
            }
          : i;
      return result;
    });
    yield put(wordsActions.fetchFeedSuccess(newFeed, feedState.offset));
  } catch (e) {
    yield put(
      notificationActions.addNotification({
        type: NotificationTypes.error,
        message: e.message,
      }),
    );
  }
}

export function* feed(action: any) {
  try {
    const { offset, limit } = action.payload;
    const words: AxiosResponse<Word[]> = yield call(FeedService.fetchFeed, offset, limit);
    yield put(wordsActions.fetchFeedSuccess(words.data, offset));
  } catch (e) {
    yield put(
      notificationActions.addNotification({
        type: NotificationTypes.error,
        message: e.message,
      }),
    );
    yield put(wordsActions.fetchFeedError(e));
  }
}

// --WATCHER-SAGAS--
export const wordsSagas = [
  takeEvery(CREATE_A_NEW_WORD, createANewWordWorker),
  takeEvery(RATE_A_WORD, rateAWordWorker),
  takeLatest(FETCH_FEED, feed),
];

export default wordsReducer;
