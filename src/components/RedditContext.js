import React, { useEffect, useState, createContext } from 'react';

import { getPostsBySubreddit } from '../services/redditAPI';

const Context = createContext();
const { Provider, Consumer } = Context;

function RedditProvider({ children }) {
  const initialStatePostsBySubreddit = {
    frontend: {},
    reactjs: {},
  };

  const [postsBySubreddit, setPostsBySubreddit] = useState(initialStatePostsBySubreddit);

  const [selectedSubreddit, setSelectedSubreddit] = useState('reactjs');

  const [shouldRefreshSubreddit, setShouldRefreshSubreddit] = useState(false);

  const [isFetching, setIsFetching]= useState(false);

  useEffect(() => {
    fetchPosts();
  }, [selectedSubreddit]);

  function fetchPosts() {
    if (!shouldFetchPosts()) return(
      
      setShouldRefreshSubreddit(false),
      setIsFetching(true),
  
      getPostsBySubreddit(selectedSubreddit)
        .then(handleFetchSuccess, handleFetchError)
    );

  }

  function shouldFetchPosts() {
    const posts = postsBySubreddit[selectedSubreddit];

    if (!posts.items) return true;
    if (isFetching) return false;
    return shouldRefreshSubreddit;
  }

  function handleFetchSuccess(json) {
    const lastUpdated = Date.now();
    const items = json.data.children.map((child) => child.data);

      setShouldRefreshSubreddit(false);
      setIsFetching(false);
      const newPostBySubreddit = postsBySubreddit;
      newPostBySubreddit.selectedSubreddit = {
        items,
        lastUpdated,
      };
      setPostsBySubreddit(newPostBySubreddit);
  }

  function handleFetchError(error) {
    setShouldRefreshSubreddit(false);
    setIsFetching(false);
    const newPostBySubreddit = postsBySubreddit;
    newPostBySubreddit[selectedSubreddit] = {
      error: error.message,
      items: [],
    };
    setPostsBySubreddit(newPostBySubreddit);
  }

  function handleSubredditChange(selectedSubreddit) {
    setSelectedSubreddit(selectedSubreddit);
  }

  function handleRefreshSubreddit() {
    setShouldRefreshSubreddit(true);
  }

  const context = {
    postsBySubreddit,
    setPostsBySubreddit,
    selectedSubreddit,
    setSelectedSubreddit,
    isFetching,
    setIsFetching,
    shouldRefreshSubreddit,
    setShouldRefreshSubreddit,
    handleSubredditChange,
    fetchPosts,
    refreshSubreddit: handleRefreshSubreddit,
    availableSubreddits: Object.keys(postsBySubreddit),
    posts: postsBySubreddit[selectedSubreddit].items,
  };
 
  return (
    <Provider value={context}>
      {children}
    </Provider>
  );
}

export { RedditProvider as Provider, Consumer, Context };