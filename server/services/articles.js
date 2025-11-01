const axios = require('axios');

/**
 * Search for educational articles using Google Custom Search or fallback methods
 * @param {string} topic - The search topic
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<Array>} Array of article resources
 */
async function searchArticles(topic, maxResults = 5) {
  // Educational domains to prioritize
  const educationalDomains = [
    'medium.com',
    'dev.to',
    'freecodecamp.org',
    'towardsdatascience.com',
    'geeksforgeeks.org',
    'stackoverflow.blog',
    'css-tricks.com',
    'smashingmagazine.com',
    'wikipedia.org',
    'khanacademy.org',
    'coursera.org',
    'udemy.com',
    'edx.org',
  ];

  try {
    // If Google Custom Search API is configured
    if (process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
      return await searchWithGoogleAPI(topic, maxResults);
    }

    // Fallback: Return curated article suggestions
    return getCuratedArticles(topic, educationalDomains, maxResults);
  } catch (error) {
    console.error('Error searching articles:', error.message);
    return getCuratedArticles(topic, educationalDomains, maxResults);
  }
}

/**
 * Search using Google Custom Search API
 * @param {string} topic - Search topic
 * @param {number} maxResults - Number of results
 * @returns {Promise<Array>} Array of articles
 */
async function searchWithGoogleAPI(topic, maxResults) {
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: process.env.GOOGLE_SEARCH_API_KEY,
        cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
        q: `${topic} tutorial guide`,
        num: maxResults,
      },
    });

    const articles = response.data.items.map(item => ({
      type: 'article',
      title: item.title,
      url: item.link,
      description: item.snippet,
      source: new URL(item.link).hostname,
      publishedAt: item.pagemap?.metatags?.[0]?.['article:published_time'] || null,
    }));

    return articles;
  } catch (error) {
    console.error('Google Search API error:', error.message);
    throw error;
  }
}

/**
 * Get curated article suggestions based on topic and educational domains
 * @param {string} topic - The learning topic
 * @param {Array} domains - Educational domains
 * @param {number} count - Number of suggestions
 * @returns {Array} Curated article suggestions
 */
function getCuratedArticles(topic, domains, count = 5) {
  const encodedTopic = encodeURIComponent(topic);
  const articles = [];

  // Generate search URLs for different educational platforms
  const platforms = [
    {
      name: 'Medium',
      url: `https://medium.com/search?q=${encodedTopic}`,
      description: `Comprehensive guides and tutorials on ${topic}`,
    },
    {
      name: 'freeCodeCamp',
      url: `https://www.freecodecamp.org/news/search/?query=${encodedTopic}`,
      description: `Learn ${topic} with free tutorials and articles`,
    },
    {
      name: 'Dev.to',
      url: `https://dev.to/search?q=${encodedTopic}`,
      description: `Community articles and discussions on ${topic}`,
    },
    {
      name: 'GeeksforGeeks',
      url: `https://www.geeksforgeeks.org/?s=${encodedTopic}`,
      description: `Technical articles and examples for ${topic}`,
    },
    {
      name: 'Wikipedia',
      url: `https://en.wikipedia.org/wiki/${encodedTopic.replace(/%20/g, '_')}`,
      description: `Comprehensive overview and background on ${topic}`,
    },
  ];

  // Return the requested number of article suggestions
  return platforms.slice(0, count).map((platform, index) => ({
    type: 'article',
    title: `${topic} - ${platform.name} Resource`,
    url: platform.url,
    description: platform.description,
    source: platform.name,
    publishedAt: null,
    priority: index + 1,
  }));
}

/**
 * Curate articles based on educational level and topic
 * @param {string} topic - Learning topic
 * @param {string} level - Educational level
 * @returns {Promise<Array>} Curated articles
 */
async function curateArticlesByLevel(topic, level) {
  const levelModifiers = {
    'Elementary/Primary Level': 'basics introduction simple',
    'Middle School Level': 'beginner fundamentals',
    'High School Level': 'intermediate tutorial',
    'Undergraduate/Tertiary Level': 'comprehensive guide course',
    'Postgraduate Level': 'advanced research',
    'Professional/Continuing Education': 'professional best practices',
  };

  const modifier = levelModifiers[level] || 'tutorial';
  const searchQuery = `${topic} ${modifier}`;

  return await searchArticles(searchQuery, 5);
}

/**
 * Find project-based learning articles
 * @param {string} topic - The topic for project-based learning
 * @returns {Promise<Array>} Project-focused articles
 */
async function findProjectBasedArticles(topic) {
  const projectQuery = `${topic} project tutorial hands-on practice`;
  return await searchArticles(projectQuery, 5);
}

/**
 * Combine multiple article sources for comprehensive coverage
 * @param {string} topic - Learning topic
 * @param {string} level - Educational level
 * @returns {Promise<Object>} Object with different article categories
 */
async function getComprehensiveArticles(topic, level) {
  try {
    const [basicArticles, projectArticles] = await Promise.all([
      curateArticlesByLevel(topic, level),
      findProjectBasedArticles(topic),
    ]);

    return {
      theory: basicArticles,
      projects: projectArticles,
      all: [...basicArticles, ...projectArticles],
    };
  } catch (error) {
    console.error('Error getting comprehensive articles:', error.message);
    return {
      theory: getCuratedArticles(topic, [], 3),
      projects: getCuratedArticles(`${topic} projects`, [], 2),
      all: getCuratedArticles(topic, [], 5),
    };
  }
}

module.exports = {
  searchArticles,
  curateArticlesByLevel,
  findProjectBasedArticles,
  getComprehensiveArticles,
};
