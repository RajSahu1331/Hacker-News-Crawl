import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import styles from '../styles/styles.module.scss';

const NewsList = () => {
  const { user } = useAuthContext();
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState(30); // Initial value in seconds

  useEffect(() => {
    const fetchNewsItems = async () => {
      try {
        const response = await axios.post('http://localhost:5000/dashboard');
        const reversedNewsItems = response.data.newsItems.slice(0, 90).reverse();
        setNewsItems(reversedNewsItems);
        setLoading(false);
        resetRefreshTimer(); // Reset the refresh timer after successful fetch
      } catch (error) {
        console.error('Error fetching news items:', error.message);
      }
    };

    const resetRefreshTimer = () => {
      setRefreshTimer(30); // Reset timer to initial value after each successful fetch
    };

    // Fetch news items initially if the user is logged in
    if (user) {
      fetchNewsItems();

      // Set up polling to fetch news items every 30 seconds
      const pollingInterval = 30 * 1000;
      const intervalId = setInterval(fetchNewsItems, pollingInterval);

      // Clean up the interval on component unmount
      return () => clearInterval(intervalId);
    } else {
      setLoading(false);
    }
  }, [user]); // Fetch news items when user changes

  // Countdown timer effect
  useEffect(() => {
    const countdown = setInterval(() => {
      setRefreshTimer(prevTimer => prevTimer - 1);
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(countdown);
  }, []);

  // Format the remaining time for display
  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const getHostname = (url) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, ''); // Remove 'www.' if present
    } catch (error) {
      console.error('Error extracting hostname:', error.message);
      return '';
    }
  };

  const openInNewTab = (url, index) => {
    // Update the clicked property for the item
    const updatedNewsItems = [...newsItems];
    updatedNewsItems[index].clicked = true;
    setNewsItems(updatedNewsItems);

    // Open the URL in a new tab
    window.open(url, '_blank');
  };

  const deleteRow = (rank) => {
    const updatedNewsItems = newsItems.filter((item) => item.rank !== rank);
    setNewsItems(updatedNewsItems);
  };

  return (
    <>
      <div className={styles.newsListContainer}>
        <div className={styles.refreshTimer}>
          Refreshing page in {formatTime(refreshTimer)} {/* Display the remaining time */}
        </div>
        {user ? (
          <table className={`${styles.newsTable} ${styles.w3_4}`}>
            <tbody>
              {loading ? (
                <tr>
                  <td>Loading...</td>
                </tr>
              ) : (
                newsItems.map((item, index) => (
                  <tr
                    key={item.rank}
                    className={`${index % 2 === 0 ? styles.evenRow : styles.oddRow} ${styles.clickedLink}`}
                  >
                    <td>
                      <div className={styles.rankTitleHost}>
                        <span className={`${styles.textXl} ${styles.fontSemibold} ${styles.mb2}`}>
                          {item.rank}.{' '}
                          {item.url ? (
                            <>
                              <a
                                href={item.url}
                                className={`${styles.textBlue500} ${item.clicked ? styles.opacity50 : ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => openInNewTab(item.url, index)}
                              >
                                {item.title}
                              </a>{' '}
                              <span className={styles.newsHostname}>
                                | (
                                <a
                                  href={item.url}
                                  className={`${styles.textBlue500} ${item.clicked ? styles.opacity50 : ''}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {getHostname(item.url)}
                                </a>
                                ) |{' '}
                              </span>
                            </>
                          ) : (
                            item.title
                          )}
                          {item.upvotes || item.upvotes === 0 ? `${item.upvotes} points` : '0 points'} | {item.postedOn} |{'   '}
                          {item.comments} comments{'   '}
                          <span
                            className={`${styles.cursorPointer} ${styles.deleteIcon}`}
                            onClick={() => deleteRow(item.rank)}
                            title="Delete Row"
                          >
                            &#128465;
                          </span>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <div className={styles.loginPrompt}>
            <p>You need to login or register to view this page.</p>
            <p>
              <Link to="/api/login" className={styles.textBlue500}>
                Login
              </Link>{' '}
              or{' '}
              <Link to="/api/signup" className={styles.textGreen500}>
                Signup
              </Link>
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default NewsList;
