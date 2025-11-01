const llmService = require('./llm');
const youtubeService = require('./youtube');
const articlesService = require('./articles');

/**
 * Generate a comprehensive course curriculum using LLM
 * Focuses on project-based learning approach
 * @param {string} topic - The learning topic
 * @param {string} level - Educational level
 * @param {string} pace - Learning pace (self-paced, intensive, casual)
 * @param {Array} goals - Learning goals
 * @returns {Promise<Object>} Generated course structure
 */
async function generateCourse(topic, level, pace, goals) {
  try {
    // Build the LLM prompt for course generation
    const prompt = buildCoursePrompt(topic, level, pace, goals);

    // Use Anthropic as primary (more cost-effective for this use case)
    const response = await llmService.sendLLMRequest(
      'anthropic',
      'claude-3-5-sonnet-20241022',
      prompt
    );

    // Parse the LLM response
    const courseStructure = parseCourseResponse(response);

    // Enrich the course with real learning resources
    const enrichedCourse = await enrichCourseWithResources(
      courseStructure,
      topic,
      level
    );

    return enrichedCourse;
  } catch (error) {
    console.error('Error generating course:', error.message);

    // Fallback to template-based course generation
    return generateTemplateCourse(topic, level, pace, goals);
  }
}

/**
 * Build a detailed prompt for the LLM to generate a project-based course
 * @param {string} topic - Learning topic
 * @param {string} level - Educational level
 * @param {string} pace - Learning pace
 * @param {Array} goals - Learning goals
 * @returns {string} Formatted prompt
 */
function buildCoursePrompt(topic, level, pace, goals) {
  const paceInfo = {
    'self-paced': '4-8 weeks with flexible scheduling',
    'intensive': '2-4 weeks with daily practice',
    'casual': '8-12 weeks with light weekly commitment',
  };

  const duration = paceInfo[pace] || '4-8 weeks';

  return `You are an expert educational curriculum designer specializing in project-based learning. Create a comprehensive learning path for the following:

Topic: ${topic}
Educational Level: ${level}
Learning Pace: ${pace} (${duration})
Learning Goals: ${goals.join(', ')}

Create a project-based learning curriculum with the following structure:

1. COURSE OVERVIEW
   - Brief description (2-3 sentences)
   - Key outcomes students will achieve
   - Total estimated time commitment

2. MODULES (Create 4-6 modules)
   For each module, provide:
   - Module title
   - Learning objectives (3-4 specific objectives)
   - Duration estimate
   - Key concepts covered

3. PROJECTS (Create 3-5 hands-on projects)
   For each project, provide:
   - Project title
   - Description (what students will build)
   - Skills practiced
   - Difficulty level (Beginner/Intermediate/Advanced)
   - Estimated time to complete

4. MILESTONES
   - Define 4-6 key checkpoints
   - Each milestone should mark significant progress

5. LEARNING RESOURCES NEEDED
   - List types of resources (videos, articles, documentation)
   - Specify what topics need video tutorials
   - Specify what topics need written guides

Format your response as valid JSON with this structure:
{
  "title": "Course Title",
  "description": "Course description",
  "duration": "X weeks",
  "estimatedHours": number,
  "modules": [
    {
      "id": number,
      "title": "Module title",
      "objectives": ["objective1", "objective2"],
      "duration": "X hours",
      "topics": ["topic1", "topic2"]
    }
  ],
  "projects": [
    {
      "id": number,
      "title": "Project title",
      "description": "What students will build",
      "skills": ["skill1", "skill2"],
      "difficulty": "Beginner|Intermediate|Advanced",
      "estimatedHours": number
    }
  ],
  "milestones": [
    {
      "id": number,
      "title": "Milestone title",
      "description": "What students should achieve",
      "moduleIds": [1, 2]
    }
  ],
  "resourceNeeds": {
    "videoTopics": ["topic1", "topic2"],
    "articleTopics": ["topic1", "topic2"],
    "practiceAreas": ["area1", "area2"]
  }
}

IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting.`;
}

/**
 * Parse the LLM response and extract course structure
 * @param {string} response - LLM response text
 * @returns {Object} Parsed course structure
 */
function parseCourseResponse(response) {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/g, '');
    }

    const courseData = JSON.parse(cleaned);
    return courseData;
  } catch (error) {
    console.error('Error parsing course response:', error.message);
    // Return minimal structure if parsing fails
    return {
      title: 'Learning Path',
      description: 'Custom learning path',
      modules: [],
      projects: [],
      milestones: [],
      resourceNeeds: {
        videoTopics: [],
        articleTopics: [],
        practiceAreas: [],
      },
    };
  }
}

/**
 * Enrich the course structure with actual learning resources from YouTube and articles
 * @param {Object} courseStructure - Generated course structure
 * @param {string} topic - Main topic
 * @param {string} level - Educational level
 * @returns {Promise<Object>} Enriched course with resources
 */
async function enrichCourseWithResources(courseStructure, topic, level) {
  try {
    const resourceNeeds = courseStructure.resourceNeeds || {
      videoTopics: [topic],
      articleTopics: [topic],
    };

    // Fetch videos for the main topic and subtopics
    const videoPromises = [topic, ...(resourceNeeds.videoTopics || []).slice(0, 3)]
      .map(t => youtubeService.searchVideos(t, 3));

    // Fetch articles for the main topic
    const articlePromises = [
      articlesService.curateArticlesByLevel(topic, level),
      articlesService.findProjectBasedArticles(topic),
    ];

    // Execute all resource fetching in parallel
    const [videoResults, articleResults] = await Promise.all([
      Promise.all(videoPromises),
      Promise.all(articlePromises),
    ]);

    // Flatten and combine results
    const videos = videoResults.flat();
    const articles = articleResults.flat();

    // Combine all resources
    const resources = [...videos, ...articles];

    // Add resources to the course structure
    return {
      ...courseStructure,
      resources,
      resourceCount: {
        videos: videos.length,
        articles: articles.length,
        total: resources.length,
      },
    };
  } catch (error) {
    console.error('Error enriching course with resources:', error.message);
    return {
      ...courseStructure,
      resources: [],
      resourceCount: { videos: 0, articles: 0, total: 0 },
    };
  }
}

/**
 * Generate a template-based course when LLM is unavailable
 * @param {string} topic - Learning topic
 * @param {string} level - Educational level
 * @param {string} pace - Learning pace
 * @param {Array} goals - Learning goals
 * @returns {Promise<Object>} Template course structure
 */
async function generateTemplateCourse(topic, level, pace, goals) {
  const duration = pace === 'intensive' ? '2-4 weeks' : pace === 'casual' ? '8-12 weeks' : '4-8 weeks';

  const courseStructure = {
    title: `${topic} - Project-Based Learning Path`,
    description: `A comprehensive ${level} course on ${topic} focusing on hands-on project development.`,
    duration,
    estimatedHours: pace === 'intensive' ? 40 : pace === 'casual' ? 20 : 30,
    modules: [
      {
        id: 1,
        title: `Introduction to ${topic}`,
        objectives: [`Understand core concepts of ${topic}`, ...goals.slice(0, 2)],
        duration: '4-6 hours',
        topics: ['Fundamentals', 'Basic concepts', 'Environment setup'],
      },
      {
        id: 2,
        title: `Practical Application`,
        objectives: ['Build real-world projects', 'Apply learned concepts'],
        duration: '8-12 hours',
        topics: ['Hands-on practice', 'Project development'],
      },
      {
        id: 3,
        title: `Advanced Topics`,
        objectives: ['Master advanced concepts', 'Optimize solutions'],
        duration: '6-8 hours',
        topics: ['Advanced techniques', 'Best practices'],
      },
    ],
    projects: [
      {
        id: 1,
        title: `${topic} Starter Project`,
        description: `Build a foundational project using ${topic}`,
        skills: goals.slice(0, 2),
        difficulty: 'Beginner',
        estimatedHours: 4,
      },
      {
        id: 2,
        title: `Intermediate ${topic} Application`,
        description: `Create a practical application incorporating multiple concepts`,
        skills: goals,
        difficulty: 'Intermediate',
        estimatedHours: 8,
      },
    ],
    milestones: [
      {
        id: 1,
        title: 'Foundation Complete',
        description: 'Completed basic concepts and first project',
        moduleIds: [1],
      },
      {
        id: 2,
        title: 'Practical Skills Acquired',
        description: 'Built multiple projects and gained hands-on experience',
        moduleIds: [2, 3],
      },
    ],
    resourceNeeds: {
      videoTopics: [topic, `${topic} tutorial`, `${topic} projects`],
      articleTopics: [topic, `${topic} guide`, `${topic} best practices`],
      practiceAreas: goals,
    },
  };

  // Enrich with resources
  return await enrichCourseWithResources(courseStructure, topic, level);
}

/**
 * Generate quick course summary for preview
 * @param {string} topic - Learning topic
 * @param {string} level - Educational level
 * @returns {Object} Quick course summary
 */
function generateCourseSummary(topic, level) {
  return {
    topic,
    level,
    estimatedModules: '4-6 modules',
    estimatedProjects: '3-5 hands-on projects',
    creditsRequired: 1,
    approxDuration: '4-8 weeks',
  };
}

module.exports = {
  generateCourse,
  generateCourseSummary,
  buildCoursePrompt,
  enrichCourseWithResources,
};
