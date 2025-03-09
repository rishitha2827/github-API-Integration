const express=require('express');
const axios=require('axios');
const dotenv=require('dotenv').config();

const app=express();
const PORT=process.env.PORT || 8080;

const GITHUB_API_URL='https://api.github.com';
const GITHUB_TOKEN=process.env.GITHUB_TOKEN;
const GITHUB_USERNAME=process.env.GITHUB_USERNAME;

const githubAxios=axios.create({
  baseURL: GITHUB_API_URL,
  headers: {
    Authorization:`token ${GITHUB_TOKEN}`,
  },
});

app.use(express.json());

app.get('/github', async(req,res) => {
  try {
    const pRes=await githubAxios.get(`/users/${GITHUB_USERNAME}`);
    const rRes=await githubAxios.get(`/users/${GITHUB_USERNAME}/repos`);

    const pData=pRes.data;
    const rData=rRes.data;

    res.json({
      followers: pData.followers,
      following: pData.following,
      repos: rData.map((repo) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
      })),
    });
  } catch (err) {
    console.error('Error fetching GitHub data', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/github/:repoName', async (req, res) => {
  const {repoName}=req.params;

  try {
    const repoResponse=await githubAxios.get(`/repos/${GITHUB_USERNAME}/${repoName}`);
    const repoData=repoResponse.data;

    res.json({
      name: repoData.name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      issues: repoData.open_issues_count,
      url: repoData.html_url,
    });
  } catch (error) {
    console.error('Error fetching repository data:', error);
    res.status(500).json({ error: 'Failed to fetch repository data' });
  }
});

app.post('/github/:repoName/issues', async (req, res) => {
  const { repoName }=req.params;
  const { title, body}=req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required to create an issue.' });
  }

  try {
    const issueResponse=await githubAxios.post(`/repos/${GITHUB_USERNAME}/${repoName}/issues`, {
      title,
      body,
    });

    const issueData=issueResponse.data;

    res.json({ issueUrl: issueData.html_url });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Failed to create an issue' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
