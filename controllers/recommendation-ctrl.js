const User = require("../models/users-modle");
const Recommendation = require("../models/recommendation-modle");

//Helper function to calculate cosine similarity between two vectors
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

//Function to calculate Jaccard similarity matrix- for binary matrix (not used)
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

//Function to calculate cosine similarity matrix
function cosineSimilarity(matrix){
  const similarityMatrix = {};
  for (let itemA in matrix) {
    similarityMatrix[itemA] = {};
    for (let itemB in matrix) {
      if (itemA !== itemB) {
        similarityMatrix[itemA][itemB] = cosineHelper(matrix[itemA], matrix[itemB]);
      }
    }
  }
  return similarityMatrix
}

//Function to get top k similar items for a given item given the similarityMatrix
//used for both item-item and user-user
function getTopKSimilarItems(item, similarityMatrix, k) {
  //Sort the items by similarity score and return the top k items
  const similarItems = Object.keys(similarityMatrix[item])
    .filter(id => id !== item)
    .sort((a, b) => similarityMatrix[item][b] - similarityMatrix[item][a])
    .slice(0, k);

  return similarItems;
}

//Function to generate item recommendations for a user
//used for item-item collaborative filtering
async function item_recommendations(username,similarityMatrix,matrix,){
  const topK=5
  const topN=25
  const currentUser=await User.findOne({username:username}).exec();
  const user_jobs = Array.from(currentUser.recommendationId.keys());
  //calculate the weighted scores for each item
  const itemScores = {};
  console.log(user_jobs)
  user_jobs.forEach((itemId)=> {
    //find the top k most similar jobs for each job the user interacted with
    console.log(itemId)
    const similarItems = getTopKSimilarItems(itemId, similarityMatrix, topK);
    //calculate the weighted score for each similar job
    for (const similarItem of similarItems) {
      const similarity = similarityMatrix[itemId][similarItem];
      const interaction = matrix[similarItem][username];
      const weightedScore = similarity * interaction;
      //add the weighted score to the item's total score
      if (itemScores[similarItem]) {
        itemScores[similarItem] += weightedScore;
      } else {
        itemScores[similarItem] = weightedScore;
      }
    }
  });
  //sort the recommended items by score and return the top n items
  const recommendedItems = Object.keys(itemScores)
    .filter((itemId) => !user_jobs.includes(itemId))
    .sort((a, b) => itemScores[b] - itemScores[a])
    .slice(0, topN);
  console.log(recommendedItems)
  return recommendedItems;
}



//Function to generate user recommendations based on similar users
//used for user-user collaborative filtering
async function user_recommendation(username,similarityMatrix,matrix,){
  const topK=5
  const topN=25
  const itemScores = {};
  //find the top k similar users of the current user
  const similarUsers = getTopKSimilarItems(username, similarityMatrix, topK);
  const items = Object.keys(matrix[username]);
  //find the jobs the user didn't interact with
  const itemsNotInteracted = items.filter(item => matrix[username][item] === undefined || matrix[username][item] === 0);
  //for each job the user didn't interact with calculate the weighted scores
  for (const item of itemsNotInteracted) {
    let score = 0;
    //find the sum of scores for each job in all the similar users combine
    for (const similarUser of similarUsers) {
      const similarity = similarityMatrix[username][similarUser]; //get the similarity between the users
      const interaction = matrix[similarUser][item] || 0; //get the interaction value of the similar user with this job
      score += similarity * interaction;
    }
    itemScores[item] = score
  }
  //get the top N jobs with the largest score
  const recommendedItems = Object.keys(itemScores)
  .sort((a, b) => itemScores[b] - itemScores[a])
  .slice(0, topN);
  console.log(recommendedItems);
  return recommendedItems;

    

    
}


module.exports = {
  //Function for item-item collaborative filtering
  getRecommendations:async (req, res) => {
    const userExists = await User.exists({ username:req.params.id });
    if (!userExists) {
      return res.status(404).json({ message: 'User does not exist' });
    }
    try{
      //get all the users and all the recommendation in order to create the matrix interaction
      const [all_users, all_recommendation] = await Promise.all([
        User.find().exec(), //exec is used to execute the query and retrieve the results
        Recommendation.find().exec()
      ]);
      //create the job-user interaction matrix
      const matrix = {};
      all_recommendation.forEach((recommendation)=>{
          matrix[recommendation._id] = {};
          all_users.forEach((user)=>{
              const count = user.recommendationId.get(recommendation._id) || 0; //get the value from each user's recommendationId map
              matrix[recommendation._id][user.username] = count;
          })
      })
      console.log(matrix)
      //get the similarityMatrix
      const similarityMatrix=cosineSimilarity(matrix)
      console.log(similarityMatrix);
      //get the id's of recommendations
      const recommendations_ids = await item_recommendations(req.params.id,similarityMatrix,matrix);
      //get the recommendations themselvs
      const recommendations = await Recommendation.find({
        _id: { $in: recommendations_ids }
      });
      console.log(recommendations);
      res.status(200).json(recommendations);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    } 
  },
  //Function for user-user collaborative filtering
  getRecommendationsUser:async (req, res) => {
    const userExists = await User.exists({ username:req.params.id });
    if (!userExists) {
      return res.status(404).json({ message: 'User does not exist' });
    }
    try{
      //get all the users and all the recommendation in order to create the matrix interaction
      const [all_users, all_recommendation] = await Promise.all([
        User.find().exec(),
        Recommendation.find().exec()
      ]);
      console.log(all_recommendation);
      // Create the user-job interaction matrix
      const matrix = {};
      all_users.forEach((user)=>{
          matrix[user.username] = {};
          all_recommendation.forEach((recommendation)=>{
              const count = user.recommendationId.get(recommendation._id) || 0; //get the value from each user's recommendationId map
              matrix[user.username][recommendation._id] = count;
          })
      })
      console.log(matrix)
      //get the similarityMatrix
      const similarityMatrix=cosineSimilarity(matrix)
      console.log(similarityMatrix);
      //get the id's of recommendations
      const recommendations_ids = await user_recommendation(req.params.id,similarityMatrix,matrix);
      //get the recommendations themselvs
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

