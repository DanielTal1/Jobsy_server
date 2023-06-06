const User = require("../models/users-modle");
const Recommendation = require("../models/recommendation-modle");

function cosineHelper(vectorA, vectorB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let key in vectorA) {
      dotProduct += vectorA[key] * vectorB[key];
      normA += vectorA[key] ** 2;
      normB += vectorB[key] ** 2;
    }
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    return dotProduct / (normA * normB);
}

function JaccardSimilarity(matrix){
  const similarityMatrix = {};
  for (const itemA in matrix) {
      similarityMatrix[itemA] = {};
      
      for (const itemB in matrix) {
        if (itemA === itemB) {
          continue;
        }
        
        const usersA = new Set(Object.keys(matrix[itemA]).filter(user => matrix[itemA][user] === 1));
        const usersB = new Set(Object.keys(matrix[itemB]).filter(user => matrix[itemB][user] === 1));
        const intersection = new Set([...usersA].filter(user => usersB.has(user)));
        const union = new Set([...usersA, ...usersB]);
        const similarity = intersection.size / union.size;
        similarityMatrix[itemA][itemB] = similarity;
      }
  }
  return similarityMatrix;
}

function cosineSimilarity(matrix){
  const similarityMatrix = {};
  for (let jobA in matrix) {
    similarityMatrix[jobA] = {};
    for (let jobB in matrix) {
      if (jobA !== jobB) {
        similarityMatrix[jobA][jobB] = cosineHelper(matrix[jobA], matrix[jobB]);
      }
    }
  }
  return similarityMatrix
}


function getTopKSimilarItems(itemId, similarityMatrix, k) {
  // Sort the items by similarity score and return the top k items
  const similarItems = Object.keys(similarityMatrix[itemId])
    .filter(id => id !== itemId)
    .sort((a, b) => similarityMatrix[itemId][b] - similarityMatrix[itemId][a])
    .slice(0, k);

  return similarItems;
}


async function user_recommendation(username,similarityMatrix,matrix,){
  const topK=5
  const topN=25
  const currentUser=await User.findOne({username:username}).exec();
  const user_jobs = currentUser.recommendationId;
  // Calculate the weighted scores for each item
  const itemScores = {};
  console.log(user_jobs)
  user_jobs.forEach((itemId)=> {
    // Find the top k most similar items
    console.log(itemId)
    const similarItems = getTopKSimilarItems(itemId, similarityMatrix, topK);
    // Calculate the weighted score for each similar item
    for (const similarItem of similarItems) {
      const similarity = similarityMatrix[itemId][similarItem];
      const interaction = matrix[similarItem][username];
      const weightedScore = similarity * interaction;

      // Add the weighted score to the item's total score
      if (itemScores[similarItem]) {
        itemScores[similarItem] += weightedScore;
      } else {
        itemScores[similarItem] = weightedScore;
      }
    }
  });
  // Sort the recommended items by score and return the top n items
  const recommendedItems = Object.keys(itemScores)
    .filter((itemId) => !user_jobs.includes(itemId))
    .sort((a, b) => itemScores[b] - itemScores[a])
    .slice(0, topN);
  console.log(recommendedItems)
  return recommendedItems;
}


module.exports = {
  getRecommendations:async (req, res) => {
    try{
      const [all_users, all_recommendation] = await Promise.all([
        User.find().exec(),
        Recommendation.find().exec()
      ]);
      // Create the user-job interaction matrix
      const matrix = {};
      all_recommendation.forEach((recommendation)=>{
          matrix[recommendation._id] = {};
          all_users.forEach((user)=>{
              // const hasRecommendation = user.recommendationId.includes(recommendation._id);
              const count = user.recommendationId.filter(id => id.equals(recommendation._id)).length;
              matrix[recommendation._id][user.username] = count;
          })
      })
      console.log(matrix)
      const similarityMatrix=cosineSimilarity(matrix)
      console.log(similarityMatrix);
      const recommendations_ids = await user_recommendation(req.params.id,similarityMatrix,matrix);
      const recommendations = await Recommendation.find({
        _id: { $in: recommendations_ids }
      });
      console.log(recommendations);
      res.status(200).json(recommendations);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    } 
  }
};

