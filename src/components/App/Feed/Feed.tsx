import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  ButtonGroup,
  createStyles,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  useTheme,
} from '@material-ui/core';

import { useEffect, useState } from 'react';
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom';
import VerticalAlignTopIcon from '@material-ui/icons/VerticalAlignTop';
import InfiniteScroll from 'react-infinite-scroll-component';
import WordCard from './WordCard/WordCard';
import { RootState } from '../../../store/rootReducer';
import Loader from '../../Loader/Loader';
import SearchField from './SearchField/SearchField';
import { wordsActions } from '../../../store/words/wordsReducer';
import { hasRefreshToken } from '../../../services/auth.service';
import { CustomTheme } from '../../../styles/types';

const useStyles = makeStyles<CustomTheme>((theme) =>
  createStyles({
    loader: {
      minHeight: 148,
    },
    select: {
      maxWidth: 120,
    },
    scroll: {
      zIndex: 10,
    },
    orderButton_active: {
      color: `${theme.palette.secondary.main}`,
    },
    orderButton: {},
  }),
);

interface IProps {
  className?: string;
  options: { variant: 'all' | 'createdWords' | 'favoriteWords' };
}

const SortBy: React.FC<{
  value: 'likes' | 'createdAt';
  callback: (a: 'likes' | 'createdAt') => void;
  direction: 'asc' | 'desc';
  setDirection: (a: 'asc' | 'desc') => void;
}> = ({ value, callback, direction, setDirection }) => {
  const handleLikesClick = () => {
    if (value === 'likes') {
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    }
    callback('likes');
  };
  const handleDateClick = () => {
    if (value === 'createdAt') {
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    }
    callback('createdAt');
  };
  const theme = useTheme<CustomTheme>();
  const classes = useStyles(theme && { theme });
  return (
    <ButtonGroup>
      <Button
        className={value === 'createdAt' ? classes.orderButton_active : classes.orderButton}
        variant="text"
        onClick={handleDateClick}
      >
        Дата
        {(() => {
          if (value === 'createdAt') {
            if (direction === 'desc') {
              return <VerticalAlignBottomIcon fontSize="small" />;
            }
            return <VerticalAlignTopIcon fontSize="small" />;
          }
          return null;
        })()}
      </Button>
      <Button
        className={value === 'likes' ? classes.orderButton_active : classes.orderButton}
        variant="text"
        onClick={handleLikesClick}
      >
        Падабайкi
        {(() => {
          if (value === 'likes') {
            if (direction === 'desc') {
              return <VerticalAlignBottomIcon fontSize="small" />;
            }
            return <VerticalAlignTopIcon fontSize="small" />;
          }
          return null;
        })()}
      </Button>
    </ButtonGroup>
  );
};
const Feed: React.FC<IProps> = ({ className, options }) => {
  const dispatch = useDispatch();
  const theme = useTheme<CustomTheme>();
  const classes = useStyles(theme && { theme });
  const { feed, fetching } = useSelector((state: RootState) => state.word);
  const [orderBy, setOrderBy] = useState<'likes' | 'createdAt'>('createdAt');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (hasRefreshToken()) {
      if (currentUser)
        dispatch(
          wordsActions.fetchFeed({
            ...options,
            orderByField: orderBy,
            orderByDirection: direction,
            page: currentPage,
          }),
        );
    } else {
      dispatch(
        wordsActions.fetchFeed({
          ...options,
          orderByField: orderBy,
          orderByDirection: direction,
          page: currentPage,
        }),
      );
    }
  }, [dispatch, options, currentUser, orderBy, direction, currentPage]);
  const totalCount = useSelector((state: RootState) => state.word.totalCount);
  const hasMore = +totalCount > (currentPage + 1) * 20;

  return (
    <InfiniteScroll
      loader=""
      className={classes.scroll}
      hasMore={hasMore}
      dataLength={+totalCount}
      next={() => {
        setCurrentPage((page) => page + 1);
      }}
      refreshFunction={() => {
        setCurrentPage(0);
      }}
    >
      <Box display="grid" gridGap={8} p={1} pb={10} className={className}>
        {fetching ? (
          <Loader className={classes.loader} />
        ) : (
          <>
            <SearchField />
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <SortBy
                direction={direction}
                setDirection={setDirection}
                value={orderBy}
                callback={setOrderBy}
              />
            </Box>

            {feed.map((word) => (
              <WordCard
                key={word._id}
                swearing={word.swearing}
                isFavourited={word.isFavourited}
                likes={word.likes}
                dislikes={word.dislikes}
                _id={word._id}
                wordname={word.wordname}
                meaning={word.meaning}
                isLiked={word.isLiked}
                isDisliked={word.isDisliked}
                description={word.description}
                tags={word.tags}
                createdAt={word.createdAt}
                createdByUserId={word.createdByUserId}
                currentUserId={currentUser?._id}
              />
            ))}
          </>
        )}
      </Box>
    </InfiniteScroll>
  );
};

export default Feed;
