const communityService = require("../services/communityService");

async function createCommunity(req, res) {
  const communityData = req.body;

  try {
    const newCommunity = await communityService.createCommunity(communityData);
    res.status(201).send(newCommunity);
  } catch (error) {
    console.error("Error creating community:", error);
    res.status(500).send(error);
  }
}

async function getCommunities(req, res) {
  const { query } = req;
  const searchField = Object.keys(query)[0];
  const searchValue = query[searchField];

  try {
    let communities;
    if (req.params.id) {
      const query = { _id: req.params.id };
      communities = await communityService.findCommunity(query);
    } else if (searchField && searchValue) {
      const query = { [searchField]: searchValue };
      communities = await communityService.findCommunity(query);
    } else {
      communities = await communityService.findCommunity({});
    }

    if (communities.length > 0) {
      res.send(communities);
    } else {
      res.status(404).send({ message: "Community not found" });
    }
  } catch (error) {
    console.error("Could not get communities:", error);
    res.status(500).send(error);
  }
}

async function updateCommunityField(req, res) {
  const communityData = req.body;
  try {
    const updatedCommunity = await communityService.updateCommunityField(
      communityData
    );
    res.status(200).send(updatedCommunity); // Changed status to 200 for success
  } catch (error) {
    console.error("Error updating community:", error);
    res.status(500).send(error);
  }
}

async function getCommunityByPostId(req, res) {
  const postId = req.params.id;
  try {
    const community = await communityService.getCommunityByPostId(postId);
    res.status(200).json(community);
  } catch (error) {
    console.error("Error fetching community:", error);
    res.status(500).send(error);
  }
}

async function getPopularCommunities(req, res) {
  try {
    const communites = await communityService.getTopPopularCommunities();
    res.status(200).json(communites);
  } catch (error) {
    console.error("Error fetching popular communities:", error);
    res.status(500).send(error);
  }
}

module.exports = {
  createCommunity,
  getCommunities,
  updateCommunityField,
  getCommunityByPostId,
  getPopularCommunities,
};
