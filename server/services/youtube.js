const { google } = require('googleapis');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

/**
 * Search YouTube for videos related to a topic
 * @param {string} topic - The search topic
 * @param {number} maxResults - Maximum number of results to return (default: 10)
 * @param {string} order - Sort order (relevance, date, rating, viewCount, title)
 * @returns {Promise<Array>} Array of video resources
 */
async function searchVideos(topic, maxResults = 10, order = 'relevance') {
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: topic,
      type: 'video',
      maxResults,
      order,
      videoDefinition: 'any',
      videoLicense: 'any',
      safeSearch: 'moderate',
    });

    const videos = response.data.items.map(item => ({
      type: 'video',
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      videoId: item.id.videoId,
    }));

    return videos;
  } catch (error) {
    console.error('Error searching YouTube:', error.message);

    // Return fallback results if API fails
    return getFallbackVideos(topic);
  }
}

/**
 * Get video details including duration, views, and other metadata
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} Video details
 */
async function getVideoDetails(videoId) {
  try {
    const response = await youtube.videos.list({
      part: 'contentDetails,statistics',
      id: videoId,
    });

    if (response.data.items.length === 0) {
      return null;
    }

    const video = response.data.items[0];
    return {
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      commentCount: video.statistics.commentCount,
    };
  } catch (error) {
    console.error('Error fetching video details:', error.message);
    return null;
  }
}

/**
 * Search for educational playlists on a topic
 * @param {string} topic - The search topic
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<Array>} Array of playlist resources
 */
async function searchPlaylists(topic, maxResults = 5) {
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: `${topic} tutorial playlist`,
      type: 'playlist',
      maxResults,
      order: 'relevance',
    });

    const playlists = response.data.items.map(item => ({
      type: 'playlist',
      title: item.snippet.title,
      url: `https://www.youtube.com/playlist?list=${item.id.playlistId}`,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      channelTitle: item.snippet.channelTitle,
      playlistId: item.id.playlistId,
    }));

    return playlists;
  } catch (error) {
    console.error('Error searching playlists:', error.message);
    return [];
  }
}

/**
 * Curate educational content for a specific topic
 * Combines videos and playlists for comprehensive learning
 * @param {string} topic - The learning topic
 * @param {string} level - Educational level
 * @returns {Promise<Array>} Curated learning resources
 */
async function curateEducationalContent(topic, level = 'beginner') {
  try {
    // Add level-specific keywords
    const levelKeywords = {
      'Elementary/Primary Level': 'for kids',
      'Middle School Level': 'for beginners',
      'High School Level': 'tutorial',
      'Undergraduate/Tertiary Level': 'course',
      'Postgraduate Level': 'advanced',
      'Professional/Continuing Education': 'professional',
    };

    const searchQuery = `${topic} ${levelKeywords[level] || 'tutorial'}`;

    // Search for videos and playlists in parallel
    const [videos, playlists] = await Promise.all([
      searchVideos(searchQuery, 8, 'relevance'),
      searchPlaylists(topic, 2),
    ]);

    // Combine and return results
    return [...videos, ...playlists];
  } catch (error) {
    console.error('Error curating educational content:', error.message);
    return getFallbackVideos(topic);
  }
}

/**
 * Fallback function when YouTube API is unavailable
 * Returns generic educational resource recommendations
 */
function getFallbackVideos(topic) {
  return [
    {
      type: 'video',
      title: `${topic} - Introduction and Basics`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}`,
      description: `Search for ${topic} tutorials on YouTube`,
      thumbnail: null,
      channelTitle: 'YouTube Search',
      publishedAt: new Date().toISOString(),
    },
    {
      type: 'video',
      title: `${topic} - Practical Projects`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' projects')}`,
      description: `Find practical ${topic} projects on YouTube`,
      thumbnail: null,
      channelTitle: 'YouTube Search',
      publishedAt: new Date().toISOString(),
    },
  ];
}

module.exports = {
  searchVideos,
  getVideoDetails,
  searchPlaylists,
  curateEducationalContent,
};
