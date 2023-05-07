const User = require("../models/users-modle");
const Recommendation = require("../models/recommendation-modle");

function cosineSimilarity(vectorA, vectorB) {
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



module.exports = {
  getRecommendationsByUsers: async (req, res) => {
    const [all_users, all_recommendation] = await Promise.all([
        User.find().exec(),
        Recommendation.find().exec()
      ]);
      

    // Create the user-job interaction matrix
    const matrix = {};

    all_users.forEach((user)=>{
        matrix[user.username] = {};
        all_recommendation.forEach((recommendation)=>{
            const hasRecommendation = user.recommendationId.includes(recommendation._id);
            matrix[user.username][recommendation._id] = hasRecommendation ? 1 : 0;
        })
    })
    console.log(matrix)
    const similarityMatrix = {};
    for (let usernameA in matrix) {
      similarityMatrix[usernameA] = {};
      for (let usernameB in matrix) {
        if (usernameA !== usernameB) {
          similarityMatrix[usernameA][usernameB] = cosineSimilarity(matrix[usernameA], matrix[usernameB]);
        }
      }
    }
    console.log(similarityMatrix);
  },
  getRecommendationsByItems:async (req, res) => {
    const [all_users, all_recommendation] = await Promise.all([
        User.find().exec(),
        Recommendation.find().exec()
      ]);
      

    // Create the user-job interaction matrix
    const matrix = {};

    all_recommendation.forEach((recommendation)=>{
        matrix[recommendation._id] = {};
        all_users.forEach((user)=>{
            const hasRecommendation = user.recommendationId.includes(recommendation._id);
            matrix[recommendation._id][user.username] = hasRecommendation ? 1 : 0;
        })
    })
    console.log(matrix)
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
    console.log(similarityMatrix);
    



  }

  
};

